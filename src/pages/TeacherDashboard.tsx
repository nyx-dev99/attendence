import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { create, getAll, getWhere, put, update } from '../services/store'
import { sendAttendanceAlert } from '../services/notificationService'
import { useToast } from '../components/Shared'
import { mockCourses } from '../services/mockData'
import type { AttendanceRecord, AttendanceSession, Course, UserProfile } from '../types'
import { calcAttendancePercent } from '../utils/attendanceMarks'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const { push } = useToast()

  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<UserProfile[]>([])
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [courseId, setCourseId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [marks, setMarks] = useState<Record<string, 'present' | 'absent'>>({})
  const [saving, setSaving] = useState(false)

  // Evidence modal state
  const [viewPhoto, setViewPhoto] = useState<string | null>(null)
  const [viewGeo, setViewGeo] = useState<AttendanceRecord | null>(null)

  // Load teacher courses & student roster
  async function refreshData() {
    if (!user) return
    const allCourses = await getAll<Course>('courses')
    const myCourses = allCourses.filter(
      (c) => c.teacherId === user.uid || user.assignedCourseIds?.includes(c.id)
    )
    const activeCourseList = myCourses.length > 0 ? myCourses : allCourses
    setCourses(activeCourseList)
    if (!courseId && activeCourseList[0]) {
      setCourseId(activeCourseList[0].id)
    }

    const allUsers = await getAll<UserProfile>('users')
    setStudents(allUsers.filter((u) => u.role === 'student'))

    const allSessions = await getAll<AttendanceSession>('attendanceSessions')
    setSessions(allSessions)

    const allRecs = await getAll<AttendanceRecord>('attendanceRecords')
    setRecords(allRecs)
  }

  useEffect(() => {
    refreshData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Current course object
  const currentCourse = useMemo(() => courses.find((c) => c.id === courseId), [courses, courseId])

  // Enrolled students for selected course
  const enrolledStudents = useMemo(() => {
    return students.filter((s) => !courseId || s.enrolledCourseIds?.includes(courseId))
  }, [students, courseId])

  // Records for current course
  const courseRecords = useMemo(() => {
    return records.filter((r) => r.courseId === courseId)
  }, [records, courseId])

  // Self checkin records for current course
  const selfCheckinRecords = useMemo(() => {
    return courseRecords
      .filter((r) => r.source === 'student_self_checkin')
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [courseRecords])

  // Existing teacher marks for selected date
  const existingMarksForDate = useMemo(() => {
    const map: Record<string, 'present' | 'absent'> = {}
    for (const r of courseRecords) {
      if (r.date === date && r.source === 'teacher_marked') {
        map[r.studentId] = r.status
      }
    }
    return map
  }, [courseRecords, date])

  // Sync marks state when date or course changes
  useEffect(() => {
    if (Object.keys(existingMarksForDate).length > 0) {
      setMarks(existingMarksForDate)
    } else {
      // Default all enrolled students to 'present' for easy marking
      const initial: Record<string, 'present' | 'absent'> = {}
      enrolledStudents.forEach((s) => {
        initial[s.uid] = 'present'
      })
      setMarks(initial)
    }
  }, [existingMarksForDate, enrolledStudents, date, courseId])

  // Summary counts for current marking session
  const totalEnrolled = enrolledStudents.length
  const presentCount = enrolledStudents.filter((s) => (marks[s.uid] ?? 'present') === 'present').length
  const absentCount = totalEnrolled - presentCount
  const sessionPercentage = calcAttendancePercent(presentCount, totalEnrolled)

  // Mark all helpers
  function markAll(status: 'present' | 'absent') {
    const updated: Record<string, 'present' | 'absent'> = {}
    enrolledStudents.forEach((s) => {
      updated[s.uid] = status
    })
    setMarks(updated)
  }

  // Save / update attendance session
  async function handleSaveAttendance(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !currentCourse) return
    setSaving(true)

    try {
      // Find existing teacher records for this course & date
      const existingDateRecs = courseRecords.filter(
        (r) => r.date === date && r.source === 'teacher_marked'
      )
      const existingRecMap = new Map(existingDateRecs.map((r) => [r.studentId, r]))

      for (const s of enrolledStudents) {
        const status = marks[s.uid] ?? 'absent'
        const existing = existingRecMap.get(s.uid)

        if (existing) {
          // Update existing record
          await update('attendanceRecords', existing.id, {
            status,
            createdAt: Date.now(),
          })
        } else {
          // Create new record
          const rec: AttendanceRecord = {
            id: '',
            studentId: s.uid,
            studentName: s.name,
            rollNumber: s.rollNumber || '2024-ECO-042',
            courseId: currentCourse.id,
            courseName: currentCourse.name,
            date,
            time: 'Class Session',
            status,
            source: 'teacher_marked',
            locationStatus: 'unavailable',
            createdAt: Date.now(),
          }
          await create('attendanceRecords', rec)
        }

        // Send missed class notification if student marked absent
        if (status === 'absent') {
          await sendAttendanceAlert({
            student: s,
            title: `Missed Class Notice: ${currentCourse.name}`,
            message: `You were marked absent in ${currentCourse.name} on ${date}. Please reach out to ${user.name} if this is an error.`,
            type: 'missed_class',
          })
        }
      }

      // Upsert AttendanceSession record
      const existingSession = sessions.find((s) => s.courseId === currentCourse.id && s.date === date)
      if (existingSession) {
        await update('attendanceSessions', existingSession.id, {
          totalStudents: totalEnrolled,
          presentCount,
          absentCount,
        })
      } else {
        const session: AttendanceSession = {
          id: '',
          teacherId: user.uid,
          courseId: currentCourse.id,
          courseName: currentCourse.name,
          date,
          createdAt: Date.now(),
          totalStudents: totalEnrolled,
          presentCount,
          absentCount,
        }
        await create('attendanceSessions', session)
      }

      push(`Attendance for ${currentCourse.name} (${date}) saved successfully!`, 'success')
      await refreshData()
    } catch (err: any) {
      push(err?.message || 'Failed to save attendance.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Verify or Reject student self-checkin
  async function handleVerification(record: AttendanceRecord, decision: 'verified' | 'rejected') {
    try {
      const newStatus = decision === 'verified' ? 'present' : 'absent'
      await update('attendanceRecords', record.id, {
        verificationStatus: decision,
        status: newStatus,
        verifiedBy: user?.name || 'Teacher',
        verifiedAt: Date.now(),
      })

      // Send alert to student
      const student = students.find((s) => s.uid === record.studentId)
      if (student) {
        await sendAttendanceAlert({
          student,
          title: `Self-Attendance ${decision === 'verified' ? 'Verified' : 'Rejected'}`,
          message:
            decision === 'verified'
              ? `Your self-marked attendance for ${record.courseName} on ${record.date} was verified by ${user?.name}.`
              : `Your self-marked attendance for ${record.courseName} on ${record.date} was rejected by ${user?.name}.`,
          type: 'verification',
        })
      }

      push(
        `Self-attendance for ${record.studentName} marked as ${decision.toUpperCase()}.`,
        decision === 'verified' ? 'success' : 'info'
      )
      await refreshData()
    } catch {
      push('Failed to update verification status.', 'error')
    }
  }

  // Student-wise stats calculation for this course
  const studentStats = useMemo(() => {
    // Distinct sessions for this course
    const distinctDates = Array.from(new Set(courseRecords.map((r) => r.date)))
    const totalSessions = distinctDates.length

    return enrolledStudents.map((s) => {
      const studentRecs = courseRecords.filter((r) => r.studentId === s.uid)
      // Count present: teacher_marked present OR student_self_checkin verified
      const attendedCount = studentRecs.filter(
        (r) =>
          r.status === 'present' &&
          (r.source === 'teacher_marked' || r.verificationStatus === 'verified' || !r.verificationStatus)
      ).length
      const percent = calcAttendancePercent(attendedCount, totalSessions)
      return {
        student: s,
        attendedCount,
        totalSessions,
        percent,
        isShortage: totalSessions > 0 && percent < 67,
      }
    })
  }, [enrolledStudents, courseRecords])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Teacher / Faculty Dashboard</h1>
          <p className="text-xs text-slate-500">Welcome, {user?.name}. Manage class attendance & verify self-checkins.</p>
        </div>

        {/* Course Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Active Course:</label>
          <select
            className="input text-sm py-1.5 font-medium max-w-xs"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Marking & Session Editor */}
      <div className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="font-bold text-base">📝 Mark & Update Attendance</h2>
            <p className="text-xs text-slate-500">
              Select date to mark or revise attendance for {currentCourse?.name || 'Class'}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">Session Date:</label>
            <input
              type="date"
              className="input text-sm py-1 max-w-[160px]"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Live Attendance Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500">Total Enrolled</span>
            <p className="text-xl font-bold">{totalEnrolled}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
            <span className="text-xs text-emerald-600 dark:text-emerald-400">Present</span>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{presentCount}</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800 text-center">
            <span className="text-xs text-red-600 dark:text-red-400">Absent</span>
            <p className="text-xl font-bold text-red-700 dark:text-red-300">{absentCount}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
            <span className="text-xs text-brand-blue">Session Attendance</span>
            <p className="text-xl font-bold text-brand-blue">{sessionPercentage.toFixed(0)}%</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-outline text-xs py-1"
              onClick={() => markAll('present')}
            >
              ✅ Mark All Present
            </button>
            <button
              type="button"
              className="btn-outline text-xs py-1"
              onClick={() => markAll('absent')}
            >
              ❌ Mark All Absent
            </button>
          </div>
          <span className="text-xs text-slate-400">
            {Object.keys(existingMarksForDate).length > 0 ? '✏️ Editing Saved Session' : '🆕 New Session'}
          </span>
        </div>

        {/* Student Roster List */}
        <form onSubmit={handleSaveAttendance} className="space-y-3">
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-b border-slate-100 dark:border-slate-800">
            {enrolledStudents.map((s) => {
              const status = marks[s.uid] ?? 'present'
              return (
                <div key={s.uid} className="flex items-center justify-between py-2.5 text-sm gap-2">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{s.name}</span>
                    <span className="text-xs text-slate-400 ml-2">({s.rollNumber || 'No Roll No'})</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      className={`btn-outline text-xs px-3 py-1 font-semibold ${
                        status === 'present'
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                      onClick={() => setMarks((m) => ({ ...m, [s.uid]: 'present' }))}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      className={`btn-outline text-xs px-3 py-1 font-semibold ${
                        status === 'absent'
                          ? 'bg-red-500 text-white border-red-500'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                      onClick={() => setMarks((m) => ({ ...m, [s.uid]: 'absent' }))}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              )
            })}
            {enrolledStudents.length === 0 && (
              <p className="text-sm text-slate-500 py-4 text-center">No students currently enrolled in this course.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || enrolledStudents.length === 0}
            className="btn-primary w-full sm:w-auto"
          >
            {saving ? 'Saving attendance…' : '💾 Save & Update Attendance Session'}
          </button>
        </form>
      </div>

      {/* Student-Wise Attendance Percentage Overview */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base">📊 Student-Wise Attendance Percentage</h2>
            <p className="text-xs text-slate-500">
              Cumulative attendance across all sessions held for {currentCourse?.name}.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <th className="py-2 pr-2">Student</th>
                <th className="pr-2">Roll Number</th>
                <th className="pr-2">Attended / Total</th>
                <th className="pr-2">Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {studentStats.map(({ student, attendedCount, totalSessions, percent, isShortage }) => (
                <tr key={student.uid} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <td className="py-2.5 pr-2 font-medium">{student.name}</td>
                  <td className="pr-2 text-slate-500 text-xs">{student.rollNumber || '—'}</td>
                  <td className="pr-2 font-mono text-xs">
                    {attendedCount} / {totalSessions}
                  </td>
                  <td className="pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs">{percent.toFixed(0)}%</span>
                      <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 hidden sm:block">
                        <div
                          className={`h-1.5 rounded-full ${isShortage ? 'bg-red-500' : 'bg-brand-green'}`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    {isShortage ? (
                      <span className="badge bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300">
                        Shortage (&lt;67%)
                      </span>
                    ) : (
                      <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                        Eligible
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {studentStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-slate-500 text-sm">
                    No enrolled students.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Self Check-In Verification Table */}
      <div className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              📸 Student Self Check-In Submissions
              <span className="badge bg-brand-blue text-white text-[10px]">
                {selfCheckinRecords.filter((r) => r.verificationStatus === 'pending').length} Pending
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Review live captured photos & coordinates submitted by students. Accept or Reject with one click.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <th className="py-2.5 pr-2">Student</th>
                <th className="pr-2">Date & Time</th>
                <th className="pr-2">Photo</th>
                <th className="pr-2">Location</th>
                <th className="pr-2">Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {selfCheckinRecords.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <td className="py-2.5 pr-2">
                    <div className="font-semibold">{r.studentName}</div>
                    <div className="text-[11px] text-slate-400">{r.rollNumber || 'No Roll No'}</div>
                  </td>
                  <td className="pr-2 whitespace-nowrap text-xs">
                    <div>{r.date}</div>
                    <div className="text-slate-400">{r.time || new Date(r.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="pr-2">
                    {r.photoUrl ? (
                      <button
                        type="button"
                        className="flex items-center gap-1 text-xs text-brand-blue font-medium hover:underline"
                        onClick={() => setViewPhoto(r.photoUrl!)}
                      >
                        📷 View Photo
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">No photo</span>
                    )}
                  </td>
                  <td className="pr-2">
                    <button
                      type="button"
                      className="text-xs text-slate-600 dark:text-slate-300 hover:text-brand-blue font-medium underline"
                      onClick={() => setViewGeo(r)}
                    >
                      {r.geoTag ? '📍 View GPS' : `📍 ${r.locationStatus}`}
                    </button>
                  </td>
                  <td className="pr-2">
                    <span
                      className={`badge ${
                        r.verificationStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : r.verificationStatus === 'rejected'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {r.verificationStatus ? r.verificationStatus.toUpperCase() : 'PENDING'}
                    </span>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleVerification(r, 'verified')}
                        className="btn-outline text-xs py-1 px-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-semibold"
                        title="Accept and mark student present"
                      >
                        ✓ Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerification(r, 'rejected')}
                        className="btn-outline text-xs py-1 px-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 font-semibold"
                        title="Reject and mark student absent"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {selfCheckinRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-500 text-sm">
                    No student self check-ins recorded for this course yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session History & Date Browser */}
      <div className="card space-y-3">
        <h2 className="font-bold text-base">📅 Attendance Session History</h2>
        <p className="text-xs text-slate-500">
          Click on any previous date to load its student roster and revise marks.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sessions
            .filter((s) => s.courseId === courseId)
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setDate(s.date)
                  push(`Loaded attendance session for ${s.date}`, 'info')
                }}
                className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-brand-blue transition text-xs space-y-1"
              >
                <div className="flex justify-between items-center font-semibold">
                  <span>{s.date}</span>
                  <span className="text-brand-blue">Open & Edit →</span>
                </div>
                <div className="text-slate-500">
                  Present: {s.presentCount ?? '—'} · Absent: {s.absentCount ?? '—'}
                </div>
              </div>
            ))}
          {sessions.filter((s) => s.courseId === courseId).length === 0 && (
            <p className="text-sm text-slate-500 py-3 col-span-full">No previous sessions saved for this course.</p>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {viewPhoto && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setViewPhoto(null)}
        >
          <div className="card max-w-md w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm">Student Self-Attendance Photo</h3>
              <button className="btn-outline text-xs py-1" onClick={() => setViewPhoto(null)}>
                ✕ Close
              </button>
            </div>
            <img src={viewPhoto} alt="Student Check-in" className="w-full rounded-xl aspect-video object-cover" />
          </div>
        </div>
      )}

      {/* Geolocation Modal */}
      {viewGeo && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setViewGeo(null)}
        >
          <div className="card max-w-sm w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm">Student Location Details</h3>
              <button className="btn-outline text-xs py-1" onClick={() => setViewGeo(null)}>
                ✕ Close
              </button>
            </div>
            <div className="text-xs space-y-2">
              <div>
                <span className="text-slate-500">Student:</span> <b>{viewGeo.studentName}</b>
              </div>
              <div>
                <span className="text-slate-500">Location Status:</span>{' '}
                <b className="capitalize">{viewGeo.locationStatus}</b>
              </div>
              {viewGeo.geoTag ? (
                <>
                  <div>
                    <span className="text-slate-500">Coordinates:</span>{' '}
                    <span className="font-mono">
                      {viewGeo.geoTag.latitude.toFixed(4)}° N, {viewGeo.geoTag.longitude.toFixed(4)}° E
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">GPS Accuracy:</span> ~{viewGeo.geoTag.accuracy ?? 10} meters
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${viewGeo.geoTag.latitude},${viewGeo.geoTag.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary inline-block text-xs py-1.5 px-3 mt-2"
                  >
                    Open in Google Maps ↗
                  </a>
                </>
              ) : (
                <p className="text-slate-400">Exact coordinates were unavailable at the time of submission.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

