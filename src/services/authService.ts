import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut,
  onAuthStateChanged, type User,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './firebase'
import { getById, put } from './store'
import type { Role, UserProfile } from '../types'

const LS_USER = 'sat_current_user'

export async function signUp(
  name: string,
  email: string,
  password: string,
  role: Role,
  enrolledCourseIds: string[],
  extra?: {
    rollNumber?: string
    course?: string
    mobileNumber?: string
    assignedClass?: string
  }
): Promise<UserProfile> {
  let uid: string
  if (isFirebaseConfigured && auth) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    uid = cred.user.uid
  } else {
    uid = `local_${Date.now()}`
    localStorage.setItem(LS_USER, JSON.stringify({ uid, email }))
  }
  const profile: UserProfile = {
    uid,
    name,
    email,
    role,
    rollNumber: extra?.rollNumber,
    course: extra?.course,
    mobileNumber: extra?.mobileNumber,
    emailNotificationsEnabled: true,
    assignedClass: extra?.assignedClass,
    enrolledCourseIds: role === 'student' ? enrolledCourseIds : undefined,
    assignedCourseIds: role === 'teacher' ? ['c1', 'c2'] : undefined,
    createdAt: Date.now(),
  }
  await put<UserProfile & { id: string }>('users', { ...profile, id: uid })
  return profile
}

export async function updateProfileData(uid: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
  const current = await getById<UserProfile>('users', uid)
  if (!current) return null
  const updated = { ...current, ...data }
  await put<UserProfile & { id: string }>('users', { ...updated, id: uid })
  return updated
}

export async function quickLoginAs(user: UserProfile): Promise<UserProfile> {
  localStorage.setItem(LS_USER, JSON.stringify({ uid: user.uid, email: user.email }))
  await put<UserProfile & { id: string }>('users', { ...user, id: user.uid })
  return user
}

export async function logIn(email: string, password: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured && auth) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return getById<UserProfile>('users', cred.user.uid)
  }
  // Mock mode: find by email in local "users" store.
  const raw = localStorage.getItem('sat_users')
  const all: (UserProfile & { id: string })[] = raw ? JSON.parse(raw) : []
  const found = all.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (found) localStorage.setItem(LS_USER, JSON.stringify({ uid: found.uid, email: found.email }))
  return found ?? null
}

export async function logOut(): Promise<void> {
  if (isFirebaseConfigured && auth) await fbSignOut(auth)
  localStorage.removeItem(LS_USER)
}

export function watchAuthState(cb: (uid: string | null) => void): () => void {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (u: User | null) => cb(u ? u.uid : null))
  }
  const raw = localStorage.getItem(LS_USER)
  const uid = raw ? JSON.parse(raw).uid : null
  // fire once, async, to mimic Firebase behavior
  setTimeout(() => cb(uid), 0)
  return () => {}
}
