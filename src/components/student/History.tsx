import { useState } from 'react'
import type { AttendanceRecord, Course } from '../../types'

export default function History({ records, courses }: { records: AttendanceRecord[]; courses: Course[] }) {
  const [courseFilter, setCourseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)

  const filtered = records
    .filter((r) => {
      if (courseFilter && r.courseId !== courseFilter) return false
      if (statusFilter && r.status !== statusFilter) return false
      if (from && r.date < from) return false
      if (to && r.date > to) return false
      return true
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)

  return (
    <div className="space-y-4">
      <div className="card grid sm:grid-cols-4 gap-2">
        <select className="input" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
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
              <th className="py-2.5 pr-2">Date & Time</th>
              <th className="pr-2">Course</th>
              <th className="pr-2">Status</th>
              <th className="pr-2">Source</th>
              <th className="pr-2">Verification</th>
              <th className="pr-2">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td className="py-2.5 pr-2 whitespace-nowrap">
                  <div>{r.date}</div>
                  <div className="text-[11px] text-slate-400">
                    {r.time || (r.photoTimestamp ? new Date(r.photoTimestamp).toLocaleTimeString() : 'Class session')}
                  </div>
                </td>
                <td className="pr-2 font-medium">{r.courseName}</td>
                <td className="pr-2">
                  <span
                    className={`badge ${
                      r.status === 'present'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    {r.status.toUpperCase()}
                  </span>
                </td>
                <td className="pr-2">
                  <span
                    className={`badge ${
                      r.source === 'student_self_checkin'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {r.source === 'student_self_checkin' ? 'Self Check-in' : 'Teacher Marked'}
                  </span>
                </td>
                <td className="pr-2">
                  {r.source === 'student_self_checkin' ? (
                    <span
                      className={`badge ${
                        r.verificationStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                          : r.verificationStatus === 'rejected'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                      }`}
                    >
                      {r.verificationStatus ? r.verificationStatus.toUpperCase() : 'PENDING'}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Directly Recorded</span>
                  )}
                </td>
                <td className="pr-2">
                  {r.photoUrl || r.geoTag ? (
                    <button
                      className="text-xs text-brand-blue hover:underline font-medium"
                      onClick={() => setSelectedRecord(r)}
                    >
                      View Details
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-sm text-slate-500 py-6 text-center">No attendance records found.</p>}
      </div>

      {/* Details modal for student verification record */}
      {selectedRecord && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-40"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="card max-w-md w-full space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm">Attendance Evidence & Location</h3>
              <button
                className="btn-outline text-xs py-1 px-2"
                onClick={() => setSelectedRecord(null)}
              >
                ✕ Close
              </button>
            </div>

            {selectedRecord.photoUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={selectedRecord.photoUrl} alt="Captured Attendance" className="w-full aspect-video object-cover" />
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Course:</span>
                <span className="font-semibold">{selectedRecord.courseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-medium">{selectedRecord.date} · {selectedRecord.time || 'Class Time'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location Status:</span>
                <span className="font-medium capitalize">{selectedRecord.locationStatus}</span>
              </div>
              {selectedRecord.geoTag && (
                <div className="flex justify-between">
                  <span className="text-slate-500">GPS Coordinates:</span>
                  <span className="font-mono font-medium">
                    {selectedRecord.geoTag.latitude.toFixed(4)}° N, {selectedRecord.geoTag.longitude.toFixed(4)}° E
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Verification State:</span>
                <span className="font-semibold capitalize text-brand-blue">
                  {selectedRecord.verificationStatus || 'Pending'}
                </span>
              </div>
              {selectedRecord.verifiedBy && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Reviewed By:</span>
                  <span className="font-semibold">{selectedRecord.verifiedBy}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
