import { useState } from 'react'
import { SCHEDULE_DATA, DAY_ORDER, DAY_FULL, YEAR_ORDER } from '../../data/scheduleData'

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export default function AutoTimetable({
  programName,
  savedYear,
  onYearChange,
}: {
  programName?: string
  savedYear?: string
  onYearChange?: (year: string) => void
}) {
  const isKnownProgram = !!programName && !!SCHEDULE_DATA[programName]
  const [year, setYear] = useState<string | null>(
    savedYear && isKnownProgram && SCHEDULE_DATA[programName].years[savedYear] ? savedYear : null
  )

  function selectYear(y: string) {
    setYear(y)
    onYearChange?.(y)
  }

  if (!programName) {
    return <p className="text-sm text-slate-500">No programme on file for your account yet.</p>
  }

  if (!isKnownProgram) {
    return (
      <div className="card text-sm text-slate-600 dark:text-slate-300">
        <p className="mb-1">You're enrolled in <b>{programName}</b>.</p>
        <p className="text-slate-500">
          We don't have a pre-loaded timetable for this course yet — only{' '}
          <b>B.Sc. (Hons) Physics</b> and <b>B.Sc. Physical Science with Chemistry</b> are available right now.
        </p>
      </div>
    )
  }

  const years = YEAR_ORDER.filter((y) => Object.keys(SCHEDULE_DATA[programName].years).includes(y))

  if (!year) {
    return (
      <div className="card">
        <p className="text-sm mb-3">Select your current year for <b>{programName}</b>:</p>
        <div className="flex flex-col gap-2">
          {years.map((y) => (
            <button key={y} onClick={() => selectYear(y)} className="btn-outline text-left">
              {y}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const data = SCHEDULE_DATA[programName].years[year]

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DAY_ORDER.map((day) => {
          const entries = data.schedule
            .filter((e) => e.day === day)
            .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
          return (
            <div key={day} className="card">
              <h4 className="font-semibold mb-2">{DAY_FULL[day]}</h4>
              {entries.length === 0 && <p className="text-xs text-slate-400">No classes</p>}
              {entries.map((e, i) => (
                <div key={i} className="text-sm py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-slate-500">{e.start}–{e.end}</span>
                  </div>
                  <div className="font-medium">{e.course}</div>
                  {(e.teacher || e.room) && (
                    <div className="text-xs text-slate-500">{[e.teacher, e.room].filter(Boolean).join(' · ')}</div>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}