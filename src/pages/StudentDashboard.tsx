import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAll, getWhere, seedIfEmpty } from '../services/store'
import { mockCourses } from '../services/mockData'
import type { AttendanceRecord, Course } from '../types'
import Overview from '../components/student/Overview'
import Timetable from '../components/student/Timetable'
import MarkPresence from '../components/student/MarkPresence'
import History from '../components/student/History'

type Tab = 'overview' | 'timetable' | 'mark' | 'history'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('overview')
  const [courses, setCourses] = useState<Course[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])

  async function refreshRecords() {
    if (!user) return
    setRecords(await getWhere<AttendanceRecord>('attendanceRecords', 'studentId', user.uid))
  }

  useEffect(() => {
    seedIfEmpty('courses', mockCourses)
    getAll<Course>('courses').then((all) =>
      setCourses(all.filter((c) => user?.enrolledCourseIds?.includes(c.id)))
    )
    refreshRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'timetable', label: 'Timetable' },
    { key: 'mark', label: 'Mark My Presence' },
    { key: 'history', label: 'History' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-4">Hi {user?.name} 👋</h1>
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

      {tab === 'overview' && <Overview courses={courses} records={records} />}
      {tab === 'timetable' && <Timetable courses={courses} />}
      {tab === 'mark' && <MarkPresence courses={courses} onSaved={refreshRecords} />}
      {tab === 'history' && <History records={records} courses={courses} />}
    </div>
  )
}
