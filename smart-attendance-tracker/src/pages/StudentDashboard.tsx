import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getWhere, put } from '../services/store'
import { getProgramCourses } from '../data/scheduleData'
import type { AttendanceRecord, Course, UserProfile } from '../types'
import Overview from '../components/student/Overview'
import AutoTimetable from '../components/student/AutoTimetable'
import MarkPresence from '../components/student/MarkPresence'
import History from '../components/student/History'

type Tab = 'overview' | 'timetable' | 'mark' | 'history'

export default function StudentDashboard() {
  const { user, setUser } = useAuth()
  const [tab, setTab] = useState<Tab>('overview')
  const [records, setRecords] = useState<AttendanceRecord[]>([])

  async function refreshRecords() {
    if (!user) return
    setRecords(await getWhere<AttendanceRecord>('attendanceRecords', 'studentId', user.uid))
  }

  useEffect(() => {
    refreshRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'timetable', label: 'Timetable' },
    { key: 'mark', label: 'Mark My Presence' },
    { key: 'history', label: 'History' },
  ]

  const programName = user?.enrolledCourseIds?.[0]

  // Real courses come from the student's actual timetable (programme + year),
  // not a generic placeholder list — so they line up with what's on their schedule.
  const courses: Course[] = getProgramCourses(programName, user?.year).map((c) => ({
    id: c.id,
    name: c.name,
    code: '',
    category: 'GE_5',
    maxAttendanceMarks: 5,
  }))

  async function handleYearChange(year: string) {
    if (!user) return
    const updated: UserProfile = { ...user, year }
    await put<UserProfile & { id: string }>('users', { ...updated, id: user.uid })
    setUser(updated)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-1">Hi {user?.name} 👋</h1>
      {programName && (
        <p className="text-sm text-slate-500 mb-4">
          Enrolled in: <b>{programName}</b>{user?.year ? <> · <b>{user.year}</b></> : null}
        </p>
      )}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`btn-outline whitespace-nowrap ${tab === t.key ? 'bg-brand-blue text-white' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <Overview courses={courses} records={records} programName={programName} year={user?.year} />
      )}
      {tab === 'timetable' && (
        <AutoTimetable programName={programName} savedYear={user?.year} onYearChange={handleYearChange} />
      )}
      {tab === 'mark' && <MarkPresence courses={courses} onSaved={refreshRecords} />}
      {tab === 'history' && <History records={records} courses={courses} />}
    </div>
  )
}