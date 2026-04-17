'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Order, OrderStatus } from '@/types/order'

interface UseOrdersOptions {
  status?: OrderStatus
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

interface UseOrdersReturn {
  orders: Order[]
  total: number
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const { status, from, to, page = 1, pageSize = 10 } = options
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))

      const res = await fetch('/api/orders?' + params.toString())
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setOrders(json.data.orders)
      setTotal(json.data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách đơn hàng')
    } finally {
      setIsLoading(false)
    }
  }, [status, from, to, page, pageSize])

  useEffect(() => {
    load()
  }, [load])

  return { orders, total, isLoading, error, refresh: load }
}
