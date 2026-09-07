import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAll, getWhere, seedIfEmpty } from '../services/store'
import { mockCourses } from '../services/mockData'
import { getStudentNotifications } from '../services/notificationService'
import type { AttendanceRecord, Course, NotificationItem } from '../types'
import Overview from '../components/student/Overview'
import Timetable from '../components/student/Timetable'
import MarkPresence from '../components/student/MarkPresence'
import History from '../components/student/History'
import Profile from '../components/student/Profile'

type Tab = 'overview' | 'timetable' | 'mark' | 'history' | 'profile' | 'notifications'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('overview')
  const [courses, setCourses] = useState<Course[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  async function refreshRecords() {
    if (!user) return
    const recs = await getWhere<AttendanceRecord>('attendanceRecords', 'studentId', user.uid)
    setRecords(recs)
    const notifs = await getStudentNotifications(user.uid)
    setNotifications(notifs)
  }

  useEffect(() => {
    seedIfEmpty('courses', mockCourses)
    getAll<Course>('courses').then((all) => {
      if (user?.enrolledCourseIds && user.enrolledCourseIds.length > 0) {
        setCourses(all.filter((c) => user.enrolledCourseIds?.includes(c.id)))
      } else {
        setCourses(all)
      }
    })
    refreshRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const unreadCount = notifications.filter((n) => !n.read).length

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'timetable', label: 'Timetable' },
    { key: 'mark', label: 'Mark My Presence' },
    { key: 'history', label: 'History' },
    { key: 'profile', label: 'Student Profile' },
    { key: 'notifications', label: 'Alerts', badge: unreadCount },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold">Hi {user?.name} 👋</h1>
          <p className="text-xs text-slate-500">
            {user?.course || 'B.A. (Hons) Economics'} · Roll No: {user?.rollNumber || '2024-ECO-042'}
          </p>
        </div>
        <button
          onClick={() => setTab('mark')}
          className="btn-primary text-xs flex items-center gap-1.5 py-1.5"
        >
          📍 Mark My Presence
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`btn-outline whitespace-nowrap text-sm flex items-center gap-1.5 ${
              tab === t.key ? 'bg-brand-blue text-white' : ''
            }`}
          >
            <span>{t.label}</span>
            {Boolean(t.badge && t.badge > 0) && (
              <span className="bg-red-500 text-white rounded-full text-[10px] px-1.5 py-0.2 font-bold">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'overview' && <Overview courses={courses} records={records} />}
      {tab === 'timetable' && <Timetable courses={courses} />}
      {tab === 'mark' && <MarkPresence courses={courses} onSaved={refreshRecords} />}
      {tab === 'history' && <History records={records} courses={courses} />}
      {tab === 'profile' && <Profile />}
      {tab === 'notifications' && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="card">
            <h3 className="font-bold text-base mb-2">🔔 Attendance Alerts & Notifications</h3>
            <p className="text-xs text-slate-500 mb-4">
              Automated notifications for missed classes, low attendance warnings, and verification updates.
            </p>
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No alerts at this time. All clear! 🎉</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <b className="text-slate-800 dark:text-slate-200">{n.title}</b>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
