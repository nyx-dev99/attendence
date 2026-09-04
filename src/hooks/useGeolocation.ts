import { useCallback, useState } from 'react'
import type { GeoTag, LocationStatus } from '../types'

export function useGeolocation() {
  const [status, setStatus] = useState<LocationStatus | 'idle'>('idle')
  const [geo, setGeo] = useState<GeoTag | null>(null)

  const request = useCallback(async (): Promise<{ status: LocationStatus; geo: GeoTag | null }> => {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        setStatus('unavailable')
        resolve({ status: 'unavailable', geo: null })
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const g: GeoTag = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }
          setGeo(g)
          setStatus('captured')
          resolve({ status: 'captured', geo: g })
        },
        (err) => {
          const s: LocationStatus = err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable'
          setStatus(s)
          resolve({ status: s, geo: null })
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }, [])

  return { status, geo, request }
}
