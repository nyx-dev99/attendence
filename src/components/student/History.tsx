import { useState } from 'react'
import type { AttendanceRecord, Course } from '../../types'

export default function History({ records, courses }: { records: AttendanceRecord[]; courses: Course[] }) {
  const [courseFilter, setCourseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [openPhoto, setOpenPhoto] = useState<string | null>(null)

  const filtered = records.filter((r) => {
    if (courseFilter && r.courseId !== courseFilter) return false
    if (statusFilter && r.status !== statusFilter) return false
    if (from && r.date < from) return false
    if (to && r.date > to) return false
    return true
  }).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-4">
      <div className="card grid sm:grid-cols-4 gap-2">
        <select className="input" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="">All courses</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
        </select>
        <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <th className="py-2 pr-2">Date</th><th className="pr-2">Course</th><th className="pr-2">Status</th>
              <th className="pr-2">Source</th><th className="pr-2">Photo</th><th>Location</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td className="py-2 pr-2">{r.date}</td>
                <td className="pr-2">{r.courseName}</td>
                <td className="pr-2 capitalize">{r.status}</td>
                <td className="pr-2">{r.source === 'student_self_checkin' ? 'Self check-in' : 'Teacher marked'}</td>
                <td className="pr-2">
                  {r.photoUrl ? (
                    <button className="text-brand-blue underline" onClick={() => setOpenPhoto(r.photoUrl!)}>View</button>
                  ) : '—'}
                </td>
                <td className="capitalize">{r.locationStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-sm text-slate-500 py-6 text-center">No records found.</p>}
      </div>

      {openPhoto && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-40" onClick={() => setOpenPhoto(null)}>
          <img src={openPhoto} className="max-w-md rounded-xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
