'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'tracking_aw_tracked_products'

export function useTrackedProducts() {
  const [trackedIds, setTrackedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as string[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trackedIds))
    } catch {}
  }, [trackedIds])

  const toggleProduct = (productId: string) => {
    setTrackedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  return { trackedIds, toggleProduct }
}
