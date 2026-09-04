import { ref, uploadString, getDownloadURL } from 'firebase/storage'
import { storage, isFirebaseConfigured } from './firebase'

/** Uploads a base64 JPEG data URL; falls back to returning the data URL itself in mock mode. */
export async function uploadAttendancePhoto(
  studentId: string,
  courseId: string,
  dataUrl: string
): Promise<string> {
  if (isFirebaseConfigured && storage) {
    const path = `attendance-photos/${studentId}/${courseId}_${Date.now()}.jpg`
    const r = ref(storage, path)
    await uploadString(r, dataUrl, 'data_url')
    return getDownloadURL(r)
  }
  // Mock mode: store the data URL directly (fine for local dev only).
  return dataUrl
}
