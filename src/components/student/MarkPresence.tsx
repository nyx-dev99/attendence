import { useState } from 'react'
import { useCamera } from '../../hooks/useCamera'
import { useGeolocation } from '../../hooks/useGeolocation'
import { create } from '../../services/store'
import { uploadAttendancePhoto } from '../../services/storageService'
import { ALLOW_LOCATION_UNAVAILABLE } from '../../services/firebase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../Shared'
import type { AttendanceRecord, Course } from '../../types'

export default function MarkPresence({ courses, onSaved }: { courses: Course[]; onSaved: () => void }) {
  const { user } = useAuth()
  const { push } = useToast()
  const cam = useCamera()
  const { request: requestLocation } = useGeolocation()
  const [courseId, setCourseId] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'camera' | 'review' | 'done'>('select')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AttendanceRecord | null>(null)

  async function beginCamera() {
    if (!courseId) return push('Please choose a course first.', 'error')
    setStep('camera')
    await cam.start()
  }

  function takePhoto() {
    const dataUrl = cam.capture()
    if (!dataUrl) return push('Could not capture photo, try again.', 'error')
    setPhoto(dataUrl)
    cam.stop()
    setStep('review')
  }

  async function submit() {
    if (!user || !photo) return
    setSubmitting(true)
    try {
      const loc = await requestLocation()
      if (loc.status !== 'captured' && !ALLOW_LOCATION_UNAVAILABLE) {
        push('Location is required to mark attendance here. Please enable location access.', 'error')
        setSubmitting(false)
        return
      }
      const course = courses.find((c) => c.id === courseId)!
      const photoUrl = await uploadAttendancePhoto(user.uid, courseId, photo)
      const record: AttendanceRecord = {
        id: '',
        studentId: user.uid,
        studentName: user.name,
        courseId,
        courseName: course.name,
        date: new Date().toISOString().slice(0, 10),
        status: 'present',
        source: 'student_self_checkin',
        photoUrl,
        photoTimestamp: Date.now(),
        geoTag: loc.geo ?? undefined,
        locationStatus: loc.status,
        createdAt: Date.now(),
      }
      const id = await create('attendanceRecords', record)
      setResult({ ...record, id })
      setStep('done')
      onSaved()
    } catch (e) {
      push('Failed to submit attendance. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setStep('select'); setCourseId(''); setPhoto(null); setResult(null)
  }

  return (
    <div className="card max-w-md">
      <h3 className="font-bold mb-2">📍 Mark My Presence</h3>
      <p className="text-xs text-slate-500 mb-3">
        We capture a photo and your approximate location only to verify attendance for this class.
        Your exact coordinates are visible only to your teacher/CR for this course.
      </p>

      {step === 'select' && (
        <div className="space-y-3">
          <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">Select a course…</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <p className="text-xs text-slate-500">
            Camera and location permissions will be requested. This requires HTTPS (or localhost) to work.
          </p>
          <button className="btn-primary w-full" onClick={beginCamera}>Start check-in</button>
        </div>
      )}

      {step === 'camera' && (
        <div className="space-y-3">
          {cam.error && <p className="text-sm text-red-500">{cam.error}</p>}
          <video ref={cam.videoRef} className="w-full rounded-xl bg-black aspect-video" muted playsInline />
          <div className="flex gap-2">
            <button className="btn-outline flex-1" onClick={() => { cam.stop(); setStep('select') }}>Cancel</button>
            <button className="btn-primary flex-1" disabled={!cam.active} onClick={takePhoto}>Capture photo</button>
          </div>
        </div>
      )}

      {step === 'review' && photo && (
        <div className="space-y-3">
          <img src={photo} alt="Captured preview" className="w-full rounded-xl" />
          <div className="flex gap-2">
            <button className="btn-outline flex-1" onClick={() => { setPhoto(null); setStep('select') }}>Retake</button>
            <button className="btn-primary flex-1" disabled={submitting} onClick={submit}>
              {submitting ? 'Submitting…' : 'Confirm & submit'}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && result && (
        <div className="space-y-2 text-sm">
          <p className="text-brand-green font-semibold">✅ Attendance marked!</p>
          <p>Course: {result.courseName}</p>
          <p>Date: {result.date}</p>
          <p>Time: {new Date(result.photoTimestamp!).toLocaleTimeString()}</p>
          <p>
            Location:{' '}
            {result.locationStatus === 'captured'
              ? 'captured ✅'
              : result.locationStatus === 'denied'
              ? 'permission denied ⚠️'
              : 'unavailable ⚠️'}
          </p>
          <button className="btn-outline w-full mt-2" onClick={reset}>Mark another</button>
        </div>
      )}
    </div>
  )
}
