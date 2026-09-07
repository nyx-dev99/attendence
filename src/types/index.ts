export type Role = 'student' | 'teacher' | 'cr'

export interface UserProfile {
  uid: string
  name: string
  email: string
  role: Role
  rollNumber?: string
  course?: string
  mobileNumber?: string
  emailNotificationsEnabled?: boolean
  assignedClass?: string
  enrolledCourseIds?: string[]
  assignedCourseIds?: string[]
  createdAt: number
}

export type CourseCategory = 'DSC_MAIN_6' | 'DSC_MAIN_5' | 'SEC_2' | 'GE_5'

export interface Course {
  id: string
  name: string
  code: string
  category: CourseCategory
  maxAttendanceMarks: 6 | 5 | 2
  teacherId?: string
}

export type AnnouncementCategory = 'Academic' | 'Event' | 'Exam' | 'Holiday' | 'Urgent'

export interface Announcement {
  id: string
  title: string
  message: string
  category: AnnouncementCategory
  isUrgent: boolean
  authorId: string
  authorName: string
  createdAt: number
  expiresAt?: number
  isActive: boolean
}

export interface GeoTag {
  latitude: number
  longitude: number
  accuracy?: number
}

export type LocationStatus = 'captured' | 'unavailable' | 'denied'
export type AttendanceSource = 'teacher_marked' | 'student_self_checkin'
export type AttendanceStatus = 'present' | 'absent'
export type VerificationStatus = 'pending' | 'verified' | 'rejected'

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  rollNumber?: string
  courseId: string
  courseName: string
  date: string // YYYY-MM-DD
  time?: string // HH:MM AM/PM
  status: AttendanceStatus
  source: AttendanceSource
  verificationStatus?: VerificationStatus
  verifiedBy?: string
  verifiedAt?: number
  photoUrl?: string
  photoTimestamp?: number
  geoTag?: GeoTag
  locationStatus: LocationStatus
  createdAt: number
}

export interface TimetableEntry {
  id: string
  studentId: string
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
  startTime: string
  endTime: string
  courseId: string
  courseName: string
  category: CourseCategory
}

export interface AttendanceSession {
  id: string
  teacherId: string
  courseId: string
  courseName: string
  date: string
  createdAt: number
  totalStudents?: number
  presentCount?: number
  absentCount?: number
}

export interface NotificationItem {
  id: string
  userId: string
  userEmail: string
  title: string
  message: string
  type: 'missed_class' | 'shortage_warning' | 'announcement' | 'verification'
  createdAt: number
  read: boolean
}
