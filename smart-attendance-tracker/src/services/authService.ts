import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut,
  onAuthStateChanged, sendEmailVerification, type User,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './firebase'
import { getById, put } from './store'
import type { Role, UserProfile } from '../types'

const LS_USER = 'sat_current_user'

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function readLocalUsers(): (UserProfile & { id: string })[] {
  const raw = localStorage.getItem('sat_users')
  return raw ? JSON.parse(raw) : []
}

export async function signUp(
  name: string,
  email: string,
  password: string,
  role: Role,
  enrolledCourseIds: string[],
  year?: string
): Promise<UserProfile> {
  let uid: string
  if (isFirebaseConfigured && auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      uid = cred.user.uid
      await sendEmailVerification(cred.user)
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please log in instead.')
      }
      throw err
    }
  } else {
    const existing = readLocalUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existing) {
      throw new Error('An account with this email already exists. Please log in instead.')
    }
    uid = `local_${Date.now()}`
    const passwordHash = await sha256(password)
    localStorage.setItem(LS_USER, JSON.stringify({ uid, email }))
    localStorage.setItem(`sat_pwd_${uid}`, passwordHash)
  }
  const profile: UserProfile = {
    uid,
    name,
    email,
    role,
    enrolledCourseIds: role === 'student' ? enrolledCourseIds : undefined,
    assignedCourseIds: role === 'teacher' ? [] : undefined,
    year: role === 'student' ? year : undefined,
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
  const all = readLocalUsers()
  const found = all.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!found) return null

  const hash = await sha256(password)
  const storedHash = localStorage.getItem(`sat_pwd_${found.uid}`)
  if (!storedHash || hash !== storedHash) return null

  localStorage.setItem(LS_USER, JSON.stringify({ uid: found.uid, email }))
  return found
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
  setTimeout(() => cb(uid), 0)
  return () => {}
}