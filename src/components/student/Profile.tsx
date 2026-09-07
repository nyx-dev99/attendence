import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { updateProfileData } from '../../services/authService'
import { useToast } from '../Shared'

export default function Profile() {
  const { user, setUser } = useAuth()
  const { push } = useToast()

  const [name, setName] = useState(user?.name || '')
  const [course, setCourse] = useState(user?.course || 'B.A. (Hons) Economics')
  const [rollNumber, setRollNumber] = useState(user?.rollNumber || '')
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '')
  const [emailNotifications, setEmailNotifications] = useState<boolean>(
    user?.emailNotificationsEnabled !== false
  )
  const [saving, setSaving] = useState(false)

  if (!user) return null

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      const updated = await updateProfileData(user.uid, {
        name,
        course,
        rollNumber,
        mobileNumber,
        emailNotificationsEnabled: emailNotifications,
      })
      if (updated) {
        setUser(updated)
        push('Profile updated successfully!', 'success')
      }
    } catch (err: any) {
      push(err?.message || 'Failed to update profile.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function toggleUnsubscribe() {
    if (!user) return
    const nextState = !emailNotifications
    setEmailNotifications(nextState)
    try {
      const updated = await updateProfileData(user.uid, {
        emailNotificationsEnabled: nextState,
      })
      if (updated) {
        setUser(updated)
        if (!nextState) {
          push('You have unsubscribed from email alerts. Your attendance records remain intact.', 'info')
        } else {
          push('Email notifications re-enabled.', 'success')
        }
      }
    } catch {
      push('Failed to update email preferences.', 'error')
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div>
            <h2 className="text-lg font-bold">👤 Student Profile</h2>
            <p className="text-xs text-slate-500">View and update your academic details</p>
          </div>
          <span className="badge bg-brand-blue/10 text-brand-blue font-semibold uppercase">
            {user.role}
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-sm">
          <div>
            <label className="block font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Roll Number</label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. 2024-ECO-042"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Course / Program</label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. B.A. (Hons) Economics"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Email ID</label>
              <input
                type="email"
                disabled
                className="input bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                value={user.email}
              />
              <span className="text-[10px] text-slate-400">Email ID is linked to account authentication</span>
            </div>
            <div>
              <label className="block font-medium mb-1">Mobile Number</label>
              <input
                type="tel"
                className="input"
                placeholder="e.g. +91 98765 43210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full mt-2">
            {saving ? 'Saving changes…' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Notification and Email Preferences */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">📧 Attendance Notifications & Alerts</h3>
            <p className="text-xs text-slate-500">
              Receive automatic alerts when you are marked absent or fall below 75% attendance.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">
              Email Notifications: {emailNotifications ? '✅ Enabled' : '🚫 Unsubscribed'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {emailNotifications
                ? `Alerts are dispatched to ${user.email}.`
                : 'Email notifications are paused. (Your attendance records and marks remain completely intact.)'}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleUnsubscribe}
            className={`btn-outline text-xs whitespace-nowrap ${
              emailNotifications
                ? 'text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950'
                : 'text-brand-green border-green-200 hover:bg-green-50 dark:hover:bg-green-950'
            }`}
          >
            {emailNotifications ? 'Unsubscribe from Emails' : 'Subscribe to Emails'}
          </button>
        </div>
      </div>
    </div>
  )
}
