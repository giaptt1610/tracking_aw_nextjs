'use client'

import { useEffect, useState } from 'react'
import { MOCK_PRODUCTS } from '@/lib/mock/products'

const STORAGE_KEY = 'tracking_aw_tracked_products'

export function useTrackedProducts() {
  const [trackedIds, setTrackedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return MOCK_PRODUCTS.filter((p) => p.isTracked).map((p) => p.id)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored) as string[]
    } catch {}
    return MOCK_PRODUCTS.filter((p) => p.isTracked).map((p) => p.id)
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

  const trackedProducts = MOCK_PRODUCTS.filter((p) => trackedIds.includes(p.id))

  return { trackedIds, trackedProducts, toggleProduct }
}
