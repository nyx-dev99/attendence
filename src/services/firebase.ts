import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(cfg.apiKey && cfg.projectId)

// Config flag: allow attendance submission when location permission fails.
export const ALLOW_LOCATION_UNAVAILABLE =
  (import.meta.env.VITE_ALLOW_LOCATION_UNAVAILABLE ?? 'true') === 'true'

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
let storage: FirebaseStorage | undefined

if (isFirebaseConfigured) {
  app = initializeApp(cfg)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
} else {
  // eslint-disable-next-line no-console
  console.warn(
    '[firebase] Not configured — set VITE_FIREBASE_* env vars. Falling back to mock data mode.'
  )
}

export { app, auth, db, storage }
