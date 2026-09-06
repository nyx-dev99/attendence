import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { AttendanceRecord, Course } from '../../types'
import {
  calcAttendanceMarks, calcAttendancePercent, classesNeededForTarget,
  formatMarksLabel, isShortage, MAX_MARKS_BY_CATEGORY,
} from '../../utils/attendanceMarks'

const COLORS = ['#3ecf8e', '#e2e8f0']

export default function Overview({
  courses,
  records,
  programName,
  year,
}: {
  courses: Course[]
  records: AttendanceRecord[]
  programName?: string
  year?: string
}) {
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

  const totalPresent = records.filter((r) => r.status === 'present').length
  const totalClasses = records.length
  const overallPercent = calcAttendancePercent(totalPresent, totalClasses)
  const ringColor = overallPercent < 67 ? '#ef4444' : '#3ecf8e'

  return (
    <div className="space-y-4">
      {(programName || totalClasses > 0) && (
        <div className="card flex flex-col sm:flex-row sm:items-center gap-5">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: `conic-gradient(${ringColor} calc(${overallPercent} * 1%), #e2e8f0 0)`,
            }}
          >
            <div className="w-[72px] h-[72px] rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center">
              <span className="text-lg font-bold">{overallPercent.toFixed(0)}%</span>
              <span className="text-[10px] text-slate-500">Overall</span>
            </div>
          </div>
          <div className="flex-1">
            {programName && (
              <p className="text-sm">
                <span className="text-slate-500">Programme:</span> <b>{programName}</b>
                {year && (
                  <>
                    <span className="text-slate-500"> · Year:</span> <b>{year}</b>
                  </>
                )}
              </p>
            )}
            <div className="flex gap-4 mt-2 text-sm">
              <span><b>{totalPresent}</b> <span className="text-slate-500">attended</span></span>
              <span><b>{totalClasses - totalPresent}</b> <span className="text-slate-500">missed</span></span>
              <span><b>{totalClasses}</b> <span className="text-slate-500">total</span></span>
            </div>
          </div>
        </div>
      )}

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
                {r.course.code && <p className="text-xs text-slate-500">{r.course.code}</p>}
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
        {rows.length === 0 && <p className="text-sm text-slate-500">No courses on file yet — pick your programme and year to see your subjects here.</p>}
      </div>
    </div>
  )
}