import type { Announcement, Course } from '../types'

export const mockCourses: Course[] = [
  { id: 'c1', name: 'Microeconomics II', code: 'ECO201', category: 'DSC_MAIN_6', maxAttendanceMarks: 6, teacherId: 't1' },
  { id: 'c2', name: 'Statistics', code: 'ECO202', category: 'DSC_MAIN_5', maxAttendanceMarks: 5, teacherId: 't1' },
  { id: 'c3', name: 'Environmental Studies', code: 'GE101', category: 'GE_5', maxAttendanceMarks: 5, teacherId: 't2' },
  { id: 'c4', name: 'Data Skills Lab', code: 'SEC101', category: 'SEC_2', maxAttendanceMarks: 2, teacherId: 't2' },
]

export const mockAnnouncements: Announcement[] = [
  {
    id: 'a1',
    title: 'Mid-sem exam schedule released',
    message: 'Check the notice board for hall tickets and timing.',
    category: 'Exam',
    isUrgent: true,
    authorId: 'cr1',
    authorName: 'Priya (CR)',
    createdAt: Date.now() - 1000 * 60 * 60,
    isActive: true,
  },
  {
    id: 'a2',
    title: 'Guest lecture on Behavioral Economics',
    message: 'Friday 2 PM, Seminar Hall.',
    category: 'Academic',
    isUrgent: false,
    authorId: 'cr1',
    authorName: 'Priya (CR)',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    isActive: true,
  },
  {
    id: 'a3',
    title: 'Holiday on account of festival',
    message: 'College closed on Monday.',
    category: 'Holiday',
    isUrgent: false,
    authorId: 'cr1',
    authorName: 'Priya (CR)',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    isActive: true,
  },
]
