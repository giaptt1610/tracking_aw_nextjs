import { useMemo, useState } from 'react'
import { MOCK_ORDERS } from '@/lib/mock/orders'
import { Order, OrderStatus } from '@/types/order'

interface UseOrdersOptions {
  status?: OrderStatus
  productId?: string
  dateRange?: [string, string]
  page?: number
  pageSize?: number
}

interface UseOrdersReturn {
  orders: Order[]
  total: number
  isLoading: boolean
  error: string | null
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const { status, productId, dateRange, page = 1, pageSize = 10 } = options

  const filtered = useMemo(() => {
    let result = [...MOCK_ORDERS]

    if (status) {
      result = result.filter((o) => o.status === status)
    }
    if (productId) {
      result = result.filter((o) => o.items.some((it) => it.productId === productId))
    }
    if (dateRange) {
      const [from, to] = dateRange
      result = result.filter((o) => {
        const d = o.createdAt
        return d >= from && d <= to
      })
    }

    return result
  }, [status, productId, dateRange])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  return { orders: paginated, total: filtered.length, isLoading: false, error: null }
}
