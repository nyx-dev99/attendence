import { useEffect, useMemo, useState } from 'react'
import { SCHEDULE_DATA, ABBREV_LEGEND, DAY_ORDER, DAY_FULL, YEAR_ORDER, type ClassEntry } from '../data/scheduleData'

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function nowInfo() {
  const now = new Date()
  const jsDay = now.getDay()
  const dayCode = DAY_ORDER[(jsDay + 6) % 7]
  const minutes = now.getHours() * 60 + now.getMinutes()
  return { now, dayCode, minutes }
}

export default function TimetablePage() {
  const [program, setProgram] = useState<string | null>(null)
  const [year, setYear] = useState<string | null>(null)
  const [tab, setTab] = useState<'timetable' | 'teachers'>('timetable')
  const [clock, setClock] = useState(new Date())
  const [search, setSearch] = useState('')

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const data = program && year ? SCHEDULE_DATA[program].years[year] : null
  const { dayCode, minutes } = nowInfo()

  const todaysClasses = useMemo(() => {
    if (!data) return []
    return data.schedule
      .filter((e) => e.day === dayCode)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
  }, [data, dayCode])

  const liveClass = todaysClasses.find((e) => minutes >= toMinutes(e.start) && minutes < toMinutes(e.end))
  const nextClass = todaysClasses.find((e) => toMinutes(e.start) > minutes)

  if (!program) {
    const allNames = Object.keys(SCHEDULE_DATA)
    const filtered = allNames.filter((n) => n.toLowerCase().includes(search.toLowerCase()))
    const exactMatch = allNames.find((n) => n.toLowerCase() === search.trim().toLowerCase())

    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-8 border border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Find your timetable</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            Pick your programme from the list, or type your own course name below.
          </p>

          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Programme
          </label>
          <div className="flex flex-col gap-2 mb-4">
            {allNames.map((name) => (
              <button
                key={name}
                onClick={() => setProgram(name)}
                className="text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:shadow-sm transition flex justify-between items-center bg-white dark:bg-slate-900"
              >
                <span className="font-medium text-slate-800 dark:text-slate-100">{name}</span>
                <span className="text-xs text-slate-400 font-mono">
                  {Object.keys(SCHEDULE_DATA[name].years).length} years available
                </span>
              </button>
            ))}
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Or write your course
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type your programme name..."
            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 text-slate-800 dark:text-slate-100 mb-2"
          />

          {search.trim() && filtered.length > 0 && !exactMatch && (
            <div className="flex flex-col gap-2 mb-2">
              {filtered.map((name) => (
                <button
                  key={name}
                  onClick={() => setProgram(name)}
                  className="text-left px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {search.trim() && filtered.length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              We don't have a timetable for that course yet — see the note below.
            </p>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <b className="text-slate-700 dark:text-slate-200">Note:</b> Only{' '}
            <b className="text-slate-700 dark:text-slate-200">B.Sc. (Hons) Physics</b> and{' '}
            <b className="text-slate-700 dark:text-slate-200">B.Sc. Physical Science with Chemistry</b>{' '}
            currently have timetables loaded (First, Second, and Third Year each). Other courses will be added soon.
          </div>
        </div>
      </div>
    )
  }

  if (!year) {
    const years = YEAR_ORDER.filter((y) => Object.keys(SCHEDULE_DATA[program].years).includes(y))
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-8 border border-slate-200 dark:border-slate-700">
          <button onClick={() => setProgram(null)} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-4 underline">
            ← Back to programmes
          </button>
          <h1 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">{program}</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Now select your current year.</p>
          <div className="flex flex-col gap-2">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className="text-left px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 font-semibold transition bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-start mb-4 gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{program}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{year}</p>
        </div>
        <button
          onClick={() => { setProgram(null); setYear(null) }}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-3 py-2 rounded-full whitespace-nowrap"
        >
          Change
        </button>
      </div>

      <div className={`rounded-2xl border p-5 mb-5 shadow-sm ${liveClass ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide text-slate-400">
          <span className={liveClass ? 'text-orange-500' : ''}>{liveClass ? 'Class in session' : 'Status'}</span>
          <span className="font-mono normal-case">{DAY_FULL[dayCode]} · {clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="text-xl font-bold mt-2 mb-1 flex items-center text-slate-900 dark:text-white">
          {liveClass && <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse" />}
          {liveClass ? liveClass.course : 'No class right now'}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {liveClass
            ? [liveClass.teacher && `with ${liveClass.teacher}`, liveClass.room && `in ${liveClass.room}`, `ends ${liveClass.end}`].filter(Boolean).join(' · ')
            : nextClass
              ? <>Next up: <b className="text-slate-700 dark:text-slate-200">{nextClass.course}</b> at <b className="text-slate-700 dark:text-slate-200">{nextClass.start}</b></>
              : 'No more classes scheduled today.'}
        </div>
      </div>

      <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 mb-5 gap-1">
        <button
          onClick={() => setTab('timetable')}
          className={`flex-1 py-2 rounded-full text-xs font-semibold transition ${tab === 'timetable' ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}
        >
          TIMETABLE
        </button>
        <button
          onClick={() => setTab('teachers')}
          className={`flex-1 py-2 rounded-full text-xs font-semibold transition ${tab === 'teachers' ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}
        >
          TEACHERS
        </button>
      </div>

      {tab === 'timetable' ? (
        <div>
          {DAY_ORDER.map((day) => {
            const entries = data!.schedule
              .filter((e) => e.day === day)
              .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
            if (entries.length === 0) return null
            return (
              <div key={day} className="mb-5">
                <div className="font-semibold text-sm text-indigo-600 dark:text-indigo-300 mb-2 flex items-center gap-2">
                  {DAY_FULL[day]}
                  {day === dayCode && <span className="text-[10px] font-bold text-white bg-indigo-600 px-2 py-0.5 rounded-full">TODAY</span>}
                </div>
                {entries.map((e: ClassEntry, i: number) => {
                  const isLive = day === dayCode && minutes >= toMinutes(e.start) && minutes < toMinutes(e.end)
                  return (
                    <div
                      key={i}
                      className={`grid grid-cols-[70px_1fr] gap-3 p-3 rounded-xl border mb-2 ${isLive ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                    >
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 leading-relaxed">{e.start}<br />{e.end}</div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center flex-wrap gap-2">
                          {e.course}
                          {isLive && <span className="text-[9px] font-bold text-white bg-orange-500 px-2 py-0.5 rounded-full">NOW</span>}
                        </div>
                        {(e.teacher || e.room) && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {[e.teacher, e.room].filter(Boolean).join(' · ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {Object.entries(data!.teachers).map(([name, t]) => (
            <div key={name} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-between mt-1">
                <b>Abbreviation</b><span>{t.initials || '—'}</span>
              </div>
            </div>
          ))}
          {Object.keys(ABBREV_LEGEND).length > 0 && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 mt-2">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Abbreviation key</div>
              {Object.entries(ABBREV_LEGEND).map(([k, v]) => (
                <div key={k} className="text-xs text-slate-500 dark:text-slate-400 flex justify-between py-1 border-t border-slate-100 dark:border-slate-700 first:border-0">
                  <b className="text-slate-700 dark:text-slate-200">{k}</b><span>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}