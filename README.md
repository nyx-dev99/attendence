# Smart Attendance Tracker

A mobile-responsive attendance app for **students**, **teachers**, and **Class Representatives (CRs)**, built with React + TypeScript + Vite, Tailwind CSS, React Router, and Firebase (Auth, Firestore, Storage).

## Features
- Role-based signup/login (student / teacher / CR) with course enrollment
- Public "Campus Announcements" on the login page, managed by CRs
- Student dashboard: attendance % per course, donut + progress bar, attendance-marks calculator, 75%-target predictor, weekly timetable, attendance history with filters
- **Mark My Presence**: camera capture + geotagging self check-in, stored in Firebase Storage/Firestore
- Teacher dashboard: mark daily attendance per course, prevents duplicate sessions, session history, view geotag/photo status for self check-ins on their own courses
- Dark/light mode (persisted), accessible forms, loading/empty/error states, toasts

## 1. Prerequisites
- Node.js 18+
- A [Firebase](https://console.firebase.google.com/) project (free Spark plan is enough)

## 2. Firebase setup
1. Create a Firebase project.
2. Enable **Authentication → Email/Password**.
3. Create a **Firestore** database (production mode).
4. Enable **Storage**.
5. In Project Settings → General, create a **Web app** and copy the config values.
6. Deploy the provided rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore storage   # point to firestore.rules / storage.rules in this repo
   firebase deploy --only firestore:rules,storage:rules
   ```

## 3. Environment variables
Copy `.env.example` to `.env` and fill in your Firebase config:
```bash
cp .env.example .env
```
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ALLOW_LOCATION_UNAVAILABLE=true
```
> **No Firebase config?** The app automatically falls back to a `localStorage`-backed mock data layer so you can develop and demo the UI without a Firebase project. Just leave `.env` blank or unset — you'll see a console warning, which is expected.

`VITE_ALLOW_LOCATION_UNAVAILABLE` controls whether a self check-in can still be submitted (marked `locationUnavailable`) when geolocation permission is denied or the API is unavailable. Set to `false` to hard-require location.

## 4. Local development
```bash
npm install
npm run dev
```
Open the printed local URL. Camera/geolocation APIs require **HTTPS or `localhost`** — `npm run dev` on `localhost` works fine; a LAN IP will not prompt for camera/location.

## 5. Tests
```bash
npm run test
```
Runs unit tests for the attendance-marks calculation logic (`src/utils/attendanceMarks.ts`).

## 6. Build
```bash
npm run build
npm run preview
```

## 7. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Smart Attendance Tracker"
git branch -M main
git remote add origin https://github.com/<your-username>/smart-attendance-tracker.git
git push -u origin main
```
`.env` is gitignored — never commit real Firebase keys. Add them instead as secrets in your hosting provider (Vercel/Netlify/Firebase Hosting) environment settings.

## 8. Deploying
Any static host works (the app is a Vite SPA):
- **Firebase Hosting**: `firebase init hosting` → `firebase deploy`
- **Vercel/Netlify**: import the repo, set the `VITE_FIREBASE_*` env vars in the dashboard, build command `npm run build`, output dir `dist`.

The deployed site **must be served over HTTPS** — camera and geolocation browser APIs refuse to run on insecure origins (`localhost` is exempted for local dev only).

## Data model
See `src/types/index.ts` for all Firestore document shapes (`users`, `courses`, `announcements`, `attendanceRecords`, `timetableEntries`, `attendanceSessions`).

## Security notes
- `firestore.rules` and `storage.rules` enforce: users only edit their own profile; students only read their own attendance/timetable; teachers write attendance only for courses they're assigned to; CRs write only their own announcements; attendance photos are private per-student (no public read); role is never trusted from client-only checks alone — rules re-derive it from the signed-in user's own Firestore profile.
- Exact GPS coordinates from student self check-ins are only ever shown in the Teacher dashboard for that teacher's own courses — never broadly exposed.
- No location data is fabricated; if permission is denied/unavailable the record is explicitly flagged `locationUnavailable`/`denied` rather than filled with fake coordinates.

## Known browser limitations
- Camera (`getUserMedia`) and Geolocation (`getCurrentPosition`) require a **secure context** (HTTPS or `localhost`).
- iOS Safari requires the page to be a top-level HTTPS document (not embedded in a non-secure iframe) to prompt for camera/location.
- If a user denies permission, they must manually re-enable it in browser site settings — the app cannot re-prompt automatically.
