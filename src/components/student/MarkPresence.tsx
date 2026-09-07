import { useState } from 'react'
import { useCamera } from '../../hooks/useCamera'
import { useGeolocation } from '../../hooks/useGeolocation'
import { create } from '../../services/store'
import { uploadAttendancePhoto } from '../../services/storageService'
import { ALLOW_LOCATION_UNAVAILABLE } from '../../services/firebase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../Shared'
import type { AttendanceRecord, Course, GeoTag, LocationStatus } from '../../types'

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
  const [isDevPhoto, setIsDevPhoto] = useState(false)
  const [overrideGeo, setOverrideGeo] = useState<GeoTag | null>(null)

  async function beginCamera() {
    if (!courseId) return push('Please choose a course first.', 'error')
    setStep('camera')
    setIsDevPhoto(false)
    await cam.start()
  }

  function takePhoto() {
    const dataUrl = cam.capture()
    if (!dataUrl) return push('Could not capture photo, try again.', 'error')
    setPhoto(dataUrl)
    setIsDevPhoto(false)
    cam.stop()
    setStep('review')
  }

  function useSimulatedPhoto() {
    cam.stop()
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(0, 0, 400, 300)
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.arc(200, 120, 60, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(200, 260, 90, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(user?.name || 'Student Photo', 200, 230)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '12px sans-serif'
      ctx.fillText(`[Dev Simulated Capture] ${new Date().toLocaleTimeString()}`, 200, 280)
    }
    setPhoto(canvas.toDataURL('image/jpeg', 0.85))
    setIsDevPhoto(true)
    setStep('review')
    push('Using simulated test frame (Dev Mode)', 'info')
  }

  function useCampusLocation() {
    const campusGeo: GeoTag = {
      latitude: 28.6892,
      longitude: 77.209,
      accuracy: 10,
    }
    setOverrideGeo(campusGeo)
    push('Applied simulated campus GPS coordinates (Dev Mode)', 'info')
  }

  async function submit() {
    if (!user || !photo) return
    setSubmitting(true)
    try {
      let geo: GeoTag | undefined = overrideGeo ?? undefined
      let locStatus: LocationStatus = overrideGeo ? 'captured' : 'unavailable'

      if (!overrideGeo) {
        const loc = await requestLocation()
        if (loc.status !== 'captured' && !ALLOW_LOCATION_UNAVAILABLE) {
          push('Location is required to mark attendance. Please enable location access or use dev fallback.', 'error')
          setSubmitting(false)
          return
        }
        geo = loc.geo ?? undefined
        locStatus = loc.status
      }

      const course = courses.find((c) => c.id === courseId)!
      const photoUrl = await uploadAttendancePhoto(user.uid, courseId, photo)
      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      const record: AttendanceRecord = {
        id: '',
        studentId: user.uid,
        studentName: user.name,
        rollNumber: user.rollNumber || '2024-ECO-042',
        courseId,
        courseName: course.name,
        date: now.toISOString().slice(0, 10),
        time: timeStr,
        status: 'present',
        verificationStatus: 'pending',
        source: 'student_self_checkin',
        photoUrl,
        photoTimestamp: Date.now(),
        geoTag: geo,
        locationStatus: locStatus,
        createdAt: Date.now(),
      }

      const id = await create('attendanceRecords', record)
      setResult({ ...record, id })
      setStep('done')
      onSaved()
      push('Presence marked! Sent to teacher for verification.', 'success')
    } catch {
      push('Failed to submit attendance. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setStep('select')
    setCourseId('')
    setPhoto(null)
    setResult(null)
    setOverrideGeo(null)
    setIsDevPhoto(false)
  }

  return (
    <div className="card max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-base flex items-center gap-2">
          📍 Mark My Presence
        </h3>
        <span className="badge bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
          Self Check-In
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Self-attendance requires a real-time photo and geolocation verification. Once submitted, your teacher can review and verify your presence.
      </p>

      {step === 'select' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Select Enrolled Subject / Course
            </label>
            <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">Select a course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-400">
            <p className="font-medium text-slate-800 dark:text-slate-200">Check-in Requirements:</p>
            <p>📷 Live photo captured via camera</p>
            <p>📍 Location check (HTTPS / localhost required)</p>
            <p>⏱️ Auto-timestamped date and session</p>
          </div>

          <button className="btn-primary w-full" onClick={beginCamera}>
            Proceed to Camera Check-in
          </button>
        </div>
      )}

      {step === 'camera' && (
        <div className="space-y-3">
          {cam.error && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-300">
              ⚠️ {cam.error}
            </div>
          )}

          <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
            <video ref={cam.videoRef} className="w-full h-full object-cover" muted playsInline />
            {!cam.active && !cam.error && (
              <p className="absolute text-xs text-slate-400">Requesting camera access…</p>
            )}
          </div>

          <div className="flex gap-2">
            <button className="btn-outline flex-1" onClick={() => { cam.stop(); setStep('select') }}>
              Cancel
            </button>
            <button className="btn-primary flex-1" disabled={!cam.active} onClick={takePhoto}>
              Capture Photo
            </button>
          </div>

          {/* Clearly isolated testing fallback */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] text-slate-400 mb-1">Camera not accessible on this device?</p>
            <button
              type="button"
              onClick={useSimulatedPhoto}
              className="text-xs text-brand-blue hover:underline font-medium"
            >
              🛠️ Dev Fallback: Simulate Demo Camera Photo
            </button>
          </div>
        </div>
      )}

      {step === 'review' && photo && (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <img src={photo} alt="Captured preview" className="w-full aspect-video object-cover" />
            {isDevPhoto && (
              <span className="absolute top-2 right-2 badge bg-amber-500 text-white font-medium">
                Simulated Frame
              </span>
            )}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-semibold">{user?.name} ({user?.rollNumber || 'Roll No Pending'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Course:</span>
              <span className="font-semibold">{courses.find((c) => c.id === courseId)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Location Status:</span>
              <span className="font-medium text-brand-blue">
                {overrideGeo ? 'Simulated Campus GPS (28.6892°, 77.2090°)' : 'Will query device GPS on submit'}
              </span>
            </div>
          </div>

          {!overrideGeo && (
            <div className="text-right">
              <button
                type="button"
                onClick={useCampusLocation}
                className="text-[11px] text-slate-500 hover:text-brand-blue underline"
              >
                🛠️ Dev Fallback: Use Campus Coordinates
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button className="btn-outline flex-1" onClick={() => { setPhoto(null); setStep('camera'); cam.start() }}>
              Retake
            </button>
            <button className="btn-primary flex-1" disabled={submitting} onClick={submit}>
              {submitting ? 'Submitting…' : 'Confirm & Submit Presence'}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && result && (
        <div className="space-y-3 text-sm">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center">
            <span className="text-2xl">🎉</span>
            <p className="text-emerald-700 dark:text-emerald-300 font-bold mt-1">Presence Submitted Successfully!</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
              Status: <b className="uppercase">{result.verificationStatus}</b> (Awaiting teacher verification)
            </p>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">Subject:</span> <b>{result.courseName}</b></div>
            <div className="flex justify-between"><span className="text-slate-500">Student:</span> <b>{result.studentName} ({result.rollNumber})</b></div>
            <div className="flex justify-between"><span className="text-slate-500">Date & Time:</span> <b>{result.date} · {result.time || new Date(result.photoTimestamp!).toLocaleTimeString()}</b></div>
            <div className="flex justify-between">
              <span className="text-slate-500">Location Coordinates:</span>
              <b>{result.geoTag ? `${result.geoTag.latitude.toFixed(4)}° N, ${result.geoTag.longitude.toFixed(4)}° E` : result.locationStatus}</b>
            </div>
            <div className="flex justify-between"><span className="text-slate-500">Source:</span> <span className="badge bg-blue-100 text-blue-700">Student Self Marked</span></div>
          </div>

          <button className="btn-outline w-full mt-2" onClick={reset}>
            Mark Another Subject
          </button>
        </div>
      )}
    </div>
  )
}
