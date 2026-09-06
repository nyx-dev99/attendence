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
  enrolledCourseIds: string[]
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
    enrolledCourseIds: role === 'student' ? enrolledCourseIds : undefined,
    assignedCourseIds: role === 'teacher' ? [] : undefined,
    createdAt: Date.now(),
  }
  await put<UserProfile & { id: string }>('users', { ...profile, id: uid })
  return profile
}

export async function logIn(email: string, password: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured && auth) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return getById<UserProfile>('users', cred.user.uid)
  }
  // Mock mode: find by email in local "users" store.
  const raw = localStorage.getItem('sat_users')
  const all: (UserProfile & { id: string })[] = raw ? JSON.parse(raw) : []
  const found = all.find((u) => u.email === email)
  if (found) localStorage.setItem(LS_USER, JSON.stringify({ uid: found.uid, email }))
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
