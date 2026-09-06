import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { create, getAll, getWhere } from '../services/store'
import { useToast } from '../components/Shared'
import type { AttendanceRecord, AttendanceSession, Course, UserProfile } from '../types'

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

  useEffect(() => {
    if (!user) return
    getAll<Course>('courses').then((all) => {
      const mine = all.filter((c) => c.teacherId === user.uid || user.assignedCourseIds?.includes(c.id))
      setCourses(mine)
      if (mine[0]) setCourseId(mine[0].id)
    })
    getAll<UserProfile>('users').then((all) => setStudents(all.filter((u) => u.role === 'student')))
    getWhere<AttendanceSession>('attendanceSessions', 'teacherId', user.uid).then(setSessions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!courseId) return
    getWhere<AttendanceRecord>('attendanceRecords', 'courseId', courseId).then(setRecords)
  }, [courseId])

  const enrolledStudents = useMemo(
    () => students.filter((s) => s.enrolledCourseIds?.includes(courseId)),
    [students, courseId]
  )

  const alreadyMarkedToday = useMemo(
    () => new Set(records.filter((r) => r.date === date && r.source === 'teacher_marked').map((r) => r.studentId)),
    [records, date]
  )

  async function submitSession(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !courseId) return
    const course = courses.find((c) => c.id === courseId)!
    const dup = sessions.find((s) => s.courseId === courseId && s.date === date)
    if (dup) return push('Attendance for this course and date was already submitted.', 'error')

    for (const s of enrolledStudents) {
      if (alreadyMarkedToday.has(s.uid)) continue
      const status = marks[s.uid] ?? 'absent'
      const rec: AttendanceRecord = {
        id: '', studentId: s.uid, studentName: s.name, courseId, courseName: course.name, date,
        status, source: 'teacher_marked', locationStatus: 'unavailable', createdAt: Date.now(),
      }
      await create('attendanceRecords', rec)
    }
    const session: AttendanceSession = {
      id: '', teacherId: user.uid, courseId, courseName: course.name, date, createdAt: Date.now(),
    }
    await create('attendanceSessions', session)
    setSessions((s) => [...s, session])
    setMarks({})
    push('Attendance session submitted', 'success')
    getWhere<AttendanceRecord>('attendanceRecords', 'courseId', courseId).then(setRecords)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-xl font-bold">Teacher dashboard</h1>

      <div className="card">
        <h2 className="font-semibold mb-3">Mark today's attendance</h2>
        <form onSubmit={submitSession} className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <select className="input max-w-xs" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="date" className="input max-w-xs" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {enrolledStudents.map((s) => (
              <div key={s.uid} className="flex items-center justify-between py-2 text-sm">
                <span>{s.name}{alreadyMarkedToday.has(s.uid) ? ' (already recorded)' : ''}</span>
                <div className="flex gap-2">
                  <button type="button" disabled={alreadyMarkedToday.has(s.uid)}
                    className={`btn-outline text-xs ${marks[s.uid] === 'present' ? 'bg-brand-green text-white' : ''}`}
                    onClick={() => setMarks((m) => ({ ...m, [s.uid]: 'present' }))}>
                    Present
                  </button>
                  <button type="button" disabled={alreadyMarkedToday.has(s.uid)}
                    className={`btn-outline text-xs ${marks[s.uid] === 'absent' ? 'bg-red-500 text-white' : ''}`}
                    onClick={() => setMarks((m) => ({ ...m, [s.uid]: 'absent' }))}>
                    Absent
                  </button>
                </div>
              </div>
            ))}
            {enrolledStudents.length === 0 && <p className="text-sm text-slate-500 py-3">No students enrolled in this course.</p>}
          </div>
          <button className="btn-primary" disabled={enrolledStudents.length === 0}>Submit attendance</button>
        </form>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-3">Session history</h2>
        {sessions.length === 0 && <p className="text-sm text-slate-500">No sessions submitted yet.</p>}
        <ul className="text-sm space-y-1">
          {sessions.sort((a, b) => b.date.localeCompare(a.date)).map((s) => (
            <li key={s.id}>{s.date} · {s.courseName}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-3">Self check-in records for this course</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <th className="py-2 pr-2">Student</th><th className="pr-2">Date</th><th className="pr-2">Location</th><th>Approx. coordinates</th>
            </tr>
          </thead>
          <tbody>
            {records.filter((r) => r.source === 'student_self_checkin').map((r) => (
              <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td className="py-2 pr-2">{r.studentName}</td>
                <td className="pr-2">{r.date}</td>
                <td className="pr-2 capitalize">{r.locationStatus}</td>
                <td>{r.geoTag ? `${r.geoTag.latitude.toFixed(3)}, ${r.geoTag.longitude.toFixed(3)}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
