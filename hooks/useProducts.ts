'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Product } from '@/types/product'

const STORAGE_KEY = 'tracking_aw_tracked_products'

function getTrackedIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as string[]) : []
  } catch {
    return []
  }
}

interface UseProductsReturn {
  products: Product[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useProducts(onlyTracked = false): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/products')
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      const trackedIds = getTrackedIds()
      const merged: Product[] = (json.data as Product[]).map((p) => ({
        ...p,
        isTracked: trackedIds.includes(p.id),
      }))
      setProducts(onlyTracked ? merged.filter((p) => p.isTracked) : merged)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm')
    } finally {
      setIsLoading(false)
    }
  }, [onlyTracked])

  useEffect(() => {
    load()
  }, [load])

  return { products, isLoading, error, refresh: load }
}
