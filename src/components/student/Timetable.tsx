import { useEffect, useState } from 'react'
import { create, getWhere, remove } from '../../services/store'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../Shared'
import type { Course, TimetableEntry } from '../../types'

const DAYS: TimetableEntry['day'][] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Timetable({ courses }: { courses: Course[] }) {
  const { user } = useAuth()
  const { push } = useToast()
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [form, setForm] = useState({ day: 'Mon' as TimetableEntry['day'], startTime: '', endTime: '', courseId: '' })

  async function refresh() {
    if (!user) return
    setEntries(await getWhere<TimetableEntry>('timetableEntries', 'studentId', user.uid))
  }
  useEffect(() => { refresh() }, [user]) // eslint-disable-line

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    const course = courses.find((c) => c.id === form.courseId)
    if (!course) return push('Choose a subject from your enrolled courses.', 'error')
    await create<TimetableEntry>('timetableEntries', {
      id: '', studentId: user.uid, day: form.day, startTime: form.startTime, endTime: form.endTime,
      courseId: course.id, courseName: course.name, category: course.category,
    })
    setForm({ day: 'Mon', startTime: '', endTime: '', courseId: '' })
    push('Timetable entry added', 'success')
    refresh()
  }

  async function del(id: string) {
    await remove('timetableEntries', id)
    refresh()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="card grid sm:grid-cols-5 gap-2 items-end">
        <div>
          <label className="text-xs">Day</label>
          <select className="input" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value as any })}>
            {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs">Start</label>
          <input type="time" className="input" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
        </div>
        <div>
          <label className="text-xs">End</label>
          <input type="time" className="input" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
        </div>
        <div className="sm:col-span-1">
          <label className="text-xs">Subject</label>
          <select className="input" required value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
            <option value="">Select…</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button className="btn-primary">Add entry</button>
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DAYS.map((day) => (
          <div key={day} className="card">
            <h4 className="font-semibold mb-2">{day}</h4>
            {entries.filter((e) => e.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime)).map((e) => (
              <div key={e.id} className="flex justify-between items-center text-sm py-1 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <span>{e.startTime}-{e.endTime} · {e.courseName}</span>
                <button className="text-xs text-red-500" onClick={() => del(e.id)}>Remove</button>
              </div>
            ))}
            {entries.filter((e) => e.day === day).length === 0 && <p className="text-xs text-slate-400">No classes</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
