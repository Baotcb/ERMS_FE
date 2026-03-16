'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

interface UserLocation {
  /** Tên chuẩn: "Hà Nội", "TP. Hồ Chí Minh"... */
  city: string
  /** Tên gốc từ API */
  rawCity: string
  /** Tên vùng/tỉnh */
  regionName: string
}

interface UseUserLocationResult {
  location: UserLocation | null
  isLoading: boolean
  error: string | null
}

const CACHE_KEY = 'erms_user_location'
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 giờ

interface CachedLocation {
  data: UserLocation
  timestamp: number
}

/** ip-api.com trả "Hồ Chí Minh" nhưng app dùng "TP. Hồ Chí Minh" */
function normalizeCity(rawCity: string): string {
  const trimmed = rawCity.trim()
  if (/^h[oồ]\s*ch[ií]\s*minh$/i.test(trimmed)) {
    return 'TP. Hồ Chí Minh'
  }
  return trimmed
}

function getCachedLocation(): UserLocation | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null

    const cached: CachedLocation = JSON.parse(raw)
    if (Date.now() - cached.timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return cached.data
  } catch {
    return null
  }
}

function setCachedLocation(data: UserLocation): void {
  if (typeof window === 'undefined') return

  try {
    const cached: CachedLocation = { data, timestamp: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
  } catch {
    // localStorage full hoặc bị block → bỏ qua
  }
}

/**
 * Hook detect vị trí user qua BE proxy (ip-api.com phía server)
 * - Gọi GET /api/public/geolocation (HTTPS-safe, production-ready)
 * - Cache kết quả vào localStorage (24h)
 * - Graceful degradation: location = null nếu fail
 */
export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cached = getCachedLocation()
    if (cached) {
      setLocation(cached)
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function fetchLocation() {
      try {
        const response = await apiClient.get('/api/public/geolocation')

        if (!response.ok) {
          throw new Error('Không thể xác định vị trí')
        }

        const data = await response.json()

        if (!data.city) {
          throw new Error('Vị trí không xác định')
        }

        if (cancelled) return

        const result: UserLocation = {
          city: normalizeCity(data.city),
          rawCity: data.city,
          regionName: data.regionName ?? '',
        }

        setCachedLocation(result)
        setLocation(result)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Lỗi không xác định')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchLocation()

    return () => { cancelled = true }
  }, [])

  return { location, isLoading, error }
}
