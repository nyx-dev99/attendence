import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logIn, signUp } from '../services/authService'
import { getAll, seedIfEmpty } from '../services/store'
import { mockAnnouncements } from '../services/mockData'
import { SCHEDULE_DATA, YEAR_ORDER } from '../data/scheduleData'
import type { Announcement, Role } from '../types'
import { AnnouncementList, isAnnouncementLive } from '../components/Announcements'
import { useToast } from '../components/Shared'

const AVAILABLE_PROGRAMS = Object.keys(SCHEDULE_DATA)

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('student')
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [customCourse, setCustomCourse] = useState('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showAll, setShowAll] = useState(false)
  const [busy, setBusy] = useState(false)
  const { setUser } = useAuth()
  const { push } = useToast()
  const nav = useNavigate()

  useEffect(() => {
    seedIfEmpty('announcements', mockAnnouncements)
    getAll<Announcement>('announcements').then((all) =>
      setAnnouncements(all.filter(isAnnouncementLive).sort((a, b) => b.createdAt - a.createdAt))
    )
  }, [])

  const availableYears = selectedProgram && SCHEDULE_DATA[selectedProgram]
    ? YEAR_ORDER.filter((y) => Object.keys(SCHEDULE_DATA[selectedProgram].years).includes(y))
    : []
  const needsYear = role === 'student' && availableYears.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'signup' && needsYear && !selectedYear) {
      push('Please select your current year.', 'error')
      return
    }
    setBusy(true)
    try {
      if (mode === 'signup') {
        const enrolledCourseIds = role === 'student'
          ? [selectedProgram || customCourse.trim()].filter(Boolean)
          : []
        const profile = await signUp(name, email, password, role, enrolledCourseIds, needsYear ? selectedYear : undefined)
        setUser(profile)
        push('Account created — welcome!', 'success')
      } else {
        const profile = await logIn(email, password)
        if (!profile) throw new Error('Invalid email or password.')
        setUser(profile)
        push(`Welcome back, ${profile.name}!`, 'success')
      }
      nav(role === 'cr' ? '/cr' : role === 'teacher' ? '/teacher' : '/student')
    } catch (err: any) {
      push(err?.message ?? 'Something went wrong.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <div className="card">
        <div className="flex gap-2 mb-4">
          <button
            className={`btn-outline flex-1 ${mode === 'login' ? 'bg-brand-blue text-white' : ''}`}
            onClick={() => setMode('login')}
          >
            Log in
          </button>
          <button
            className={`btn-outline flex-1 ${mode === 'signup' ? 'bg-brand-blue text-white' : ''}`}
            onClick={() => setMode('signup')}
          >
            Sign up
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="text-sm font-medium">Full name</label>
              <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-sm font-medium">Role</label>
                <select className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="cr">Class Representative (CR)</option>
                </select>
              </div>
              {role === 'student' && (
                <div>
                  <label className="text-sm font-medium">Your programme</label>
                  <div className="flex flex-col gap-2 mt-1">
                    {AVAILABLE_PROGRAMS.map((p) => (
                      <label
                        key={p}
                        className={`flex items-center justify-between gap-2 text-sm border rounded-lg px-3 py-2 cursor-pointer transition ${
                          selectedProgram === p ? 'border-brand-blue bg-brand-blue/10' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="program"
                            checked={selectedProgram === p}
                            onChange={() => { setSelectedProgram(p); setCustomCourse(''); setSelectedYear('') }}
                          />
                          {p}
                        </span>
                      </label>
                    ))}
                  </div>

                  <label className="text-sm font-medium block mt-3">Or write your course</label>
                  <input
                    className="input mt-1"
                    placeholder="Type your programme name..."
                    value={customCourse}
                    onChange={(e) => { setCustomCourse(e.target.value); setSelectedProgram(''); setSelectedYear('') }}
                  />

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    <b>Note:</b> Only <b>B.Sc. (Hons) Physics</b> and{' '}
                    <b>B.Sc. Physical Science with Chemistry</b> currently have timetables loaded
                    (First, Second, and Third Year each). Other courses will be added soon.
                  </p>

                  {needsYear && (
                    <div className="mt-3">
                      <label className="text-sm font-medium">Your current year</label>
                      <div className="flex flex-col gap-2 mt-1">
                        {availableYears.map((y) => (
                          <label
                            key={y}
                            className={`flex items-center gap-2 text-sm border rounded-lg px-3 py-2 cursor-pointer transition ${
                              selectedYear === y ? 'border-brand-blue bg-brand-blue/10' : 'border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name="year"
                              checked={selectedYear === y}
                              onChange={() => setSelectedYear(y)}
                            />
                            {y}
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        This decides which timetable shows up on your dashboard — you can change it later from the Timetable tab.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          <button className="btn-primary w-full" disabled={busy} type="submit">
            {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </form>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">📢 Campus Announcements</h2>
          {announcements.length > 3 && (
            <button className="text-sm text-brand-blue underline" onClick={() => setShowAll(true)}>
              View all announcements
            </button>
          )}
        </div>
        <AnnouncementList items={announcements.slice(0, 5)} />
      </div>

      {showAll && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-40">
          <div className="card max-w-xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">All announcements</h3>
              <button className="btn-outline text-sm" onClick={() => setShowAll(false)}>Close</button>
            </div>
            <AnnouncementList items={announcements} />
          </div>
        </div>
      )}
    </div>
  )
}