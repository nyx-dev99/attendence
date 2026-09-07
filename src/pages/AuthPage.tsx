import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logIn, signUp, quickLoginAs } from '../services/authService'
import { getAll, seedIfEmpty } from '../services/store'
import {
  mockAnnouncements,
  mockAttendanceRecords,
  mockAttendanceSessions,
  mockCourses,
  mockUsers,
} from '../services/mockData'
import type { Announcement, Course, Role, UserProfile } from '../types'
import { AnnouncementList, isAnnouncementLive } from '../components/Announcements'
import { useToast } from '../components/Shared'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('student')
  const [rollNumber, setRollNumber] = useState('')
  const [course, setCourse] = useState('B.A. (Hons) Economics')
  const [mobileNumber, setMobileNumber] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [enrolled, setEnrolled] = useState<string[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showAll, setShowAll] = useState(false)
  const [busy, setBusy] = useState(false)
  const { setUser } = useAuth()
  const { push } = useToast()
  const nav = useNavigate()

  useEffect(() => {
    seedIfEmpty('courses', mockCourses)
    seedIfEmpty('announcements', mockAnnouncements)
    seedIfEmpty('users', mockUsers)
    seedIfEmpty('attendanceSessions', mockAttendanceSessions)
    seedIfEmpty('attendanceRecords', mockAttendanceRecords)
    getAll<Course>('courses').then(setCourses)
    getAll<Announcement>('announcements').then((all) =>
      setAnnouncements(all.filter(isAnnouncementLive).sort((a, b) => b.createdAt - a.createdAt))
    )
  }, [])

  async function handleDemoLogin(user: UserProfile) {
    setBusy(true)
    try {
      const logged = await quickLoginAs(user)
      setUser(logged)
      push(`Signed in as ${logged.name} (${logged.role.toUpperCase()})`, 'success')
      nav(logged.role === 'cr' ? '/cr' : logged.role === 'teacher' ? '/teacher' : '/student')
    } catch (err: any) {
      push(err?.message ?? 'Demo login failed.', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      if (mode === 'signup') {
        const profile = await signUp(name, email, password, role, enrolled, {
          rollNumber: rollNumber || undefined,
          course: course || undefined,
          mobileNumber: mobileNumber || undefined,
        })
        setUser(profile)
        push('Account created — welcome!', 'success')
        nav(profile.role === 'cr' ? '/cr' : profile.role === 'teacher' ? '/teacher' : '/student')
      } else {
        const profile = await logIn(email, password)
        if (!profile) throw new Error('Invalid email or password.')
        setUser(profile)
        push(`Welcome back, ${profile.name}!`, 'success')
        nav(profile.role === 'cr' ? '/cr' : profile.role === 'teacher' ? '/teacher' : '/student')
      }
    } catch (err: any) {
      push(err?.message ?? 'Something went wrong.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      {/* Auth form */}
      <div className="space-y-6">
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
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                className="input"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
                {(role === 'student' || role === 'cr') && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium">Roll Number</label>
                      <input
                        className="input text-sm"
                        placeholder="e.g. 2024-ECO-042"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Course/Program</label>
                      <input
                        className="input text-sm"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium">Mobile Number</label>
                  <input
                    className="input text-sm"
                    placeholder="e.g. +91 98765 43210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                </div>
                {role === 'student' && (
                  <div>
                    <label className="text-sm font-medium">Enrolled courses</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {courses.map((c) => (
                        <label key={c.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={enrolled.includes(c.id)}
                            onChange={(e) =>
                              setEnrolled((prev) =>
                                e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id)
                              )
                            }
                          />
                          {c.name} ({c.code})
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            <button className="btn-primary w-full" disabled={busy} type="submit">
              {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
            </button>
          </form>
        </div>

        {/* Quick Demo Logins for Hackathon evaluation */}
        <div className="card bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">🚀 1-Click Demo Logins</h3>
            <span className="text-xs text-brand-blue font-medium">Hackathon Ready</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Quickly test the system as Student, Teacher, or Class Representative (CR) with seeded classes & attendance data.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              className="btn-outline text-xs py-2 bg-white dark:bg-slate-900 hover:border-brand-blue"
              onClick={() => handleDemoLogin(mockUsers[0])}
            >
              🎓 <b>Student</b>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">Aarav (ECO-042)</div>
            </button>
            <button
              className="btn-outline text-xs py-2 bg-white dark:bg-slate-900 hover:border-brand-blue"
              onClick={() => handleDemoLogin(mockUsers[1])}
            >
              👨‍🏫 <b>Teacher</b>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">Dr. Gupta (Faculty)</div>
            </button>
            <button
              className="btn-outline text-xs py-2 bg-white dark:bg-slate-900 hover:border-brand-blue"
              onClick={() => handleDemoLogin(mockUsers[2])}
            >
              📋 <b>CR</b>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">Priya (Class Rep)</div>
            </button>
          </div>
        </div>
      </div>

      {/* Public announcements */}
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
