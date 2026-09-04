import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { AttendanceRecord, Course } from '../../types'
import {
  calcAttendanceMarks, calcAttendancePercent, classesNeededForTarget,
  formatMarksLabel, isShortage, MAX_MARKS_BY_CATEGORY,
} from '../../utils/attendanceMarks'

const COLORS = ['#3ecf8e', '#e2e8f0']

export default function Overview({ courses, records }: { courses: Course[]; records: AttendanceRecord[] }) {
  const rows = courses.map((c) => {
    const forCourse = records.filter((r) => r.courseId === c.id)
    const present = forCourse.filter((r) => r.status === 'present').length
    const total = forCourse.length
    const percent = calcAttendancePercent(present, total)
    const maxMarks = c.maxAttendanceMarks ?? MAX_MARKS_BY_CATEGORY[c.category]
    const marks = calcAttendanceMarks(percent, maxMarks)
    const needed = classesNeededForTarget(present, total)
    return { course: c, present, total, percent, maxMarks, marks, needed }
  })

  const shortages = rows.filter((r) => r.total > 0 && isShortage(r.percent))

  return (
    <div className="space-y-4">
      {shortages.map((r) => (
        <div key={r.course.id} className="card bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-200 text-sm">
          ⚠️ Your attendance in {r.course.name} is below 67% — attend more classes to avoid shortage.
        </div>
      ))}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((r) => (
          <div key={r.course.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{r.course.name}</h3>
                <p className="text-xs text-slate-500">{r.course.code}</p>
              </div>
              <div className="w-16 h-16">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[{ value: r.percent }, { value: 100 - r.percent }]}
                      dataKey="value" innerRadius={20} outerRadius={30} startAngle={90} endAngle={-270}
                    >
                      <Cell fill={r.percent < 67 ? '#ef4444' : COLORS[0]} />
                      <Cell fill={COLORS[1]} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{r.percent.toFixed(0)}%</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${r.percent < 67 ? 'bg-red-500' : 'bg-brand-green'}`}
                style={{ width: `${Math.min(100, r.percent)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{r.present} / {r.total} classes attended</p>
            <p className="text-xs mt-2">{formatMarksLabel(r.percent, r.marks, r.maxMarks)}</p>
            <p className="text-xs mt-1 text-brand-blue">
              {r.needed > 0
                ? `You need to attend ${r.needed} more class${r.needed > 1 ? 'es' : ''} to reach 75%`
                : '✅ You are already at or above 75% attendance'}
            </p>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-slate-500">No enrolled courses yet.</p>}
      </div>
    </div>
  )
}
