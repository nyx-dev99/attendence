import { create, getWhere } from './store'
import type { NotificationItem, UserProfile } from '../types'

/**
 * Dispatches an attendance notification (e.g. for missed classes or verification decisions).
 * Checks the user's email preference (`emailNotificationsEnabled`).
 * If enabled, records in the in-app `notifications` collection and logs
 * the simulated email dispatch (or triggers external email provider if configured).
 */
export async function sendAttendanceAlert({
  student,
  title,
  message,
  type,
}: {
  student: Pick<UserProfile, 'uid' | 'email' | 'name' | 'emailNotificationsEnabled'>
  title: string
  message: string
  type: 'missed_class' | 'shortage_warning' | 'announcement' | 'verification'
}): Promise<void> {
  const isEmailSubscribed = student.emailNotificationsEnabled !== false

  // Store in-app notification record regardless, so the student can review alerts in their portal
  const notif: NotificationItem = {
    id: '',
    userId: student.uid,
    userEmail: student.email,
    title,
    message,
    type,
    createdAt: Date.now(),
    read: false,
  }
  await create('notifications', notif)

  if (!isEmailSubscribed) {
    // eslint-disable-next-line no-console
    console.info(
      `[Email Service] Notification email suppressed for ${student.email} because user unsubscribed.`
    )
    return
  }

  // Isolate email provider integration:
  // In production, configure SendGrid / SMTP / Cloud Functions here.
  // In dev / hackathon mode, log with full details.
  // eslint-disable-next-line no-console
  console.log(
    `%c[EMAIL DISPATCH SIMULATION] 📧 To: ${student.email} (${student.name}) | Subject: ${title} | Body: ${message}`,
    'color: #0284c7; font-weight: bold;'
  )
}

export async function getStudentNotifications(studentId: string): Promise<NotificationItem[]> {
  const items = await getWhere<NotificationItem>('notifications', 'userId', studentId)
  return items.sort((a, b) => b.createdAt - a.createdAt)
}
