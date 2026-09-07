import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { create, getAll, getWhere, remove, update } from '../services/store'
import type { Announcement, AnnouncementCategory, AttendanceRecord, AttendanceSession, Course, UserProfile } from '../types'
import { AnnouncementList } from '../components/Announcements'
import { useToast } from '../components/Shared'
import { calcAttendancePercent } from '../utils/attendanceMarks'

const CATEGORIES: AnnouncementCategory[] = ['Academic', 'Event', 'Exam', 'Holiday', 'Urgent']

const empty = { title: '', message: '', category: 'Academic' as AnnouncementCategory, isUrgent: false, expiresAt: '' }

type CRTab = 'attendance' | 'announcements'

export default function CRDashboard() {
  const { user } = useAuth()
  const { push } = useToast()

  const [activeTab, setActiveTab] = useState<CRTab>('attendance')

  // Attendance state
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<UserProfile[]>([])
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState('')

  // Announcement state
  const [items, setItems] = useState<Announcement[]>([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)

  // Evidence modal state
  const [viewPhoto, setViewPhoto] = useState<string | null>(null)
  const [viewGeo, setViewGeo] = useState<AttendanceRecord | null>(null)

  async function refreshAnnouncements() {
    if (!user) return
    const mine = await getWhere<Announcement>('announcements', 'authorId', user.uid)
    setItems(mine.sort((a, b) => b.createdAt - a.createdAt))
  }

  async function refreshAttendanceData() {
    const allCourses = await getAll<Course>('courses')
    setCourses(allCourses)
    if (!selectedCourseId && allCourses[0]) {
      setSelectedCourseId(allCourses[0].id)
    }

    const allUsers = await getAll<UserProfile>('users')
    setStudents(allUsers.filter((u) => u.role === 'student'))

    const allSessions = await getAll<AttendanceSession>('attendanceSessions')
    setSessions(allSessions)

    const allRecs = await getAll<AttendanceRecord>('attendanceRecords')
    setRecords(allRecs)
  }

  useEffect(() => {
    refreshAnnouncements()
    refreshAttendanceData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Current selected course
  const currentCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId),
    [courses, selectedCourseId]
  )

  // Enrolled students for selected class course
  const enrolledStudents = useMemo(() => {
    return students.filter((s) => !selectedCourseId || s.enrolledCourseIds?.includes(selectedCourseId))
  }, [students, selectedCourseId])

  // Records for selected course
  const courseRecords = useMemo(() => {
    return records.filter((r) => r.courseId === selectedCourseId)
  }, [records, selectedCourseId])

  // Distinct session dates held
  const distinctDates = useMemo(() => {
    return Array.from(new Set(courseRecords.map((r) => r.date)))
  }, [courseRecords])

  // Student-wise attendance stats for CR view
  const studentStats = useMemo(() => {
    const totalSessions = distinctDates.length
    return enrolledStudents.map((s) => {
      const studentRecs = courseRecords.filter((r) => r.studentId === s.uid)
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
  }, [enrolledStudents, courseRecords, distinctDates])

  // Overall class average attendance
  const overallAverage = useMemo(() => {
    if (studentStats.length === 0) return 0
    const sum = studentStats.reduce((acc, curr) => acc + curr.percent, 0)
    return sum / studentStats.length
  }, [studentStats])

  const shortageCount = studentStats.filter((s) => s.isShortage).length

  // Self checkin records for this course
  const selfCheckins = useMemo(() => {
    return courseRecords
      .filter((r) => r.source === 'student_self_checkin')
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [courseRecords])

  // Announcement Handlers
  function draft(): Announcement {
    return {
      id: editingId ?? '',
      title: form.title,
      message: form.message,
      category: form.category,
      isUrgent: form.isUrgent,
      authorId: user!.uid,
      authorName: user!.name,
      createdAt: Date.now(),
      expiresAt: form.expiresAt ? new Date(form.expiresAt).getTime() : undefined,
      isActive: true,
    }
  }

  async function submitAnnouncement(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (editingId) {
      await update('announcements', editingId, draft())
      push('Announcement updated', 'success')
    } else {
      await create('announcements', draft())
      push('Announcement published', 'success')
    }
    setForm(empty)
    setEditingId(null)
    setPreview(false)
    refreshAnnouncements()
  }

  function editItem(a: Announcement) {
    setEditingId(a.id)
    setForm({
      title: a.title,
      message: a.message,
      category: a.category,
      isUrgent: a.isUrgent,
      expiresAt: a.expiresAt ? new Date(a.expiresAt).toISOString().slice(0, 10) : '',
    })
  }

  async function del(id: string) {
    await remove('announcements', id)
    push('Announcement deleted', 'success')
    refreshAnnouncements()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Class Representative (CR) Portal</h1>
          <p className="text-xs text-slate-500">
            {user?.assignedClass || 'B.A. (Hons) Economics - Sem IV'} · Representative: {user?.name}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2">
          <button
            className={`btn-outline text-xs sm:text-sm font-semibold ${
              activeTab === 'attendance' ? 'bg-brand-blue text-white' : ''
            }`}
            onClick={() => setActiveTab('attendance')}
          >
            📊 Class Attendance
          </button>
          <button
            className={`btn-outline text-xs sm:text-sm font-semibold ${
              activeTab === 'announcements' ? 'bg-brand-blue text-white' : ''
            }`}
            onClick={() => setActiveTab('announcements')}
          >
            📢 Campus Announcements
          </button>
        </div>
      </div>

      {/* ================= TAB 1: CLASS ATTENDANCE ================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Class Overview Cards */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">Selected Subject:</label>
              <select
                className="input text-sm py-1.5 font-medium max-w-xs"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
              Class-level visibility only (Read-only attendance)
            </span>
          </div>

          {/* Metrics summary banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card text-center">
              <span className="text-xs text-slate-500">Class Strength</span>
              <p className="text-2xl font-bold mt-1">{enrolledStudents.length}</p>
              <span className="text-[10px] text-slate-400">enrolled students</span>
            </div>
            <div className="card text-center">
              <span className="text-xs text-slate-500">Sessions Held</span>
              <p className="text-2xl font-bold mt-1">{distinctDates.length}</p>
              <span className="text-[10px] text-slate-400">total lectures</span>
            </div>
            <div className="card text-center">
              <span className="text-xs text-slate-500">Average Attendance</span>
              <p className="text-2xl font-bold mt-1 text-brand-blue">{overallAverage.toFixed(0)}%</p>
              <span className="text-[10px] text-slate-400">class-wide average</span>
            </div>
            <div className="card text-center">
              <span className="text-xs text-slate-500">Attendance Shortage</span>
              <p className="text-2xl font-bold mt-1 text-red-500">{shortageCount}</p>
              <span className="text-[10px] text-red-500">below 67% requirement</span>
            </div>
          </div>

          {/* Student Roster & Attendance Status */}
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base">👥 Student Attendance Roster</h2>
                <p className="text-xs text-slate-500">
                  Real-time status for students in {currentCourse?.name || 'Class'}.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 pr-2">Student Name</th>
                    <th className="pr-2">Roll Number</th>
                    <th className="pr-2">Classes Attended</th>
                    <th className="pr-2">Attendance %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentStats.map(({ student, attendedCount, totalSessions, percent, isShortage }) => (
                    <tr key={student.uid} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="py-2.5 pr-2 font-semibold text-slate-800 dark:text-slate-100">
                        {student.name}
                      </td>
                      <td className="pr-2 text-slate-500 text-xs">{student.rollNumber || '—'}</td>
                      <td className="pr-2 font-mono text-xs">
                        {attendedCount} / {totalSessions}
                      </td>
                      <td className="pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs">{percent.toFixed(0)}%</span>
                          <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 hidden sm:block">
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
                            ⚠️ Shortage (&lt;67%)
                          </span>
                        ) : (
                          <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                            Good (&gt;=75%)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {studentStats.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-500 text-sm">
                        No students enrolled in this course.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Self-Marked Attendance (Read-Only) */}
          <div className="card space-y-3">
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                📸 Self Check-In Submissions
                <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px]">
                  Read Only
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Class representatives can view self-checkins and evidence for transparency without teacher verify/reject modification controls.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 pr-2">Student</th>
                    <th className="pr-2">Date & Time</th>
                    <th className="pr-2">Photo</th>
                    <th className="pr-2">Location</th>
                    <th>Verification Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selfCheckins.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="py-2.5 pr-2">
                        <div className="font-medium">{r.studentName}</div>
                        <div className="text-[10px] text-slate-400">{r.rollNumber || 'No Roll No'}</div>
                      </td>
                      <td className="pr-2 text-xs whitespace-nowrap">
                        <div>{r.date}</div>
                        <div className="text-slate-400">{r.time || 'Check-in'}</div>
                      </td>
                      <td className="pr-2">
                        {r.photoUrl ? (
                          <button
                            type="button"
                            className="text-xs text-brand-blue hover:underline font-medium"
                            onClick={() => setViewPhoto(r.photoUrl!)}
                          >
                            📷 View Frame
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="pr-2">
                        <button
                          type="button"
                          className="text-xs text-slate-600 dark:text-slate-300 hover:text-brand-blue underline"
                          onClick={() => setViewGeo(r)}
                        >
                          {r.geoTag ? '📍 View GPS' : `📍 ${r.locationStatus}`}
                        </button>
                      </td>
                      <td>
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
                    </tr>
                  ))}
                  {selfCheckins.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-500 text-sm">
                        No self check-in submissions for this course.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ANNOUNCEMENTS ================= */}
      {activeTab === 'announcements' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="font-bold text-lg mb-3">{editingId ? 'Edit announcement' : 'New announcement'}</h2>
            <form onSubmit={submitAnnouncement} className="space-y-3">
              <input
                className="input"
                placeholder="Title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <textarea
                className="input"
                placeholder="Message"
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as AnnouncementCategory })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  className="input"
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isUrgent}
                  onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })}
                />
                Mark as urgent
              </label>
              <div className="flex gap-2">
                <button type="button" className="btn-outline" onClick={() => setPreview((p) => !p)}>
                  {preview ? 'Hide preview' : 'Preview'}
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? 'Save changes' : 'Publish'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setEditingId(null)
                      setForm(empty)
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            {preview && form.title && (
              <div className="mt-4">
                <AnnouncementList items={[draft()]} />
              </div>
            )}
          </div>

          <div>
            <h2 className="font-bold text-lg mb-3">Your announcements</h2>
            <AnnouncementList
              items={items}
              actionsFor={(a) => (
                <div className="flex gap-2 shrink-0">
                  <button className="btn-outline text-xs" onClick={() => editItem(a)}>
                    Edit
                  </button>
                  <button className="btn-outline text-xs" onClick={() => del(a.id)}>
                    Delete
                  </button>
                </div>
              )}
            />
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {viewPhoto && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setViewPhoto(null)}
        >
          <div className="card max-w-md w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm">Captured Self-Attendance Photo</h3>
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
                    <span className="text-slate-500">Accuracy:</span> ~{viewGeo.geoTag.accuracy ?? 10} meters
                  </div>
                </>
              ) : (
                <p className="text-slate-400">Exact coordinates were unavailable at submission time.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

