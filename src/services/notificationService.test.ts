import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sendAttendanceAlert, getStudentNotifications } from './notificationService'
import { getAll } from './store'
import type { NotificationItem } from '../types'

const storageMap = new Map<string, string>()

// Node environment localStorage polyfill for testing store.ts
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: (key: string) => storageMap.get(key) ?? null,
    setItem: (key: string, value: string) => storageMap.set(key, value),
    removeItem: (key: string) => storageMap.delete(key),
    clear: () => storageMap.clear(),
    key: (i: number) => Array.from(storageMap.keys())[i] ?? null,
    length: 0,
  } as any
}

describe('notificationService', () => {
  beforeEach(() => {
    storageMap.clear()
    vi.restoreAllMocks()
  })

  it('records in-app notification when student is subscribed', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await sendAttendanceAlert({
      student: {
        uid: 'stud_test_1',
        name: 'Test Student',
        email: 'test@college.edu',
        emailNotificationsEnabled: true,
      },
      title: 'Missed Class Notice',
      message: 'You were marked absent in Microeconomics.',
      type: 'missed_class',
    })

    const notifs = await getStudentNotifications('stud_test_1')
    expect(notifs).toHaveLength(1)
    expect(notifs[0].title).toBe('Missed Class Notice')
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[EMAIL DISPATCH SIMULATION]'),
      expect.any(String)
    )
  })

  it('suppresses simulated email when student has unsubscribed, while preserving in-app alert and attendance record', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    await sendAttendanceAlert({
      student: {
        uid: 'stud_unsub_1',
        name: 'Unsubscribed Student',
        email: 'unsub@college.edu',
        emailNotificationsEnabled: false,
      },
      title: 'Missed Class Notice',
      message: 'You were marked absent in Statistics.',
      type: 'missed_class',
    })

    const notifs = await getStudentNotifications('stud_unsub_1')
    expect(notifs).toHaveLength(1)
    expect(notifs[0].title).toBe('Missed Class Notice')
    // Email dispatch suppressed
    expect(logSpy).not.toHaveBeenCalled()
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('Notification email suppressed')
    )
  })
})
