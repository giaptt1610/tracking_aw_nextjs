import { useMemo } from 'react'
import { MOCK_ORDERS } from '@/lib/mock/orders'
import { ProductStat, PeriodStat } from '@/types/statistics'

export function useStatistics(fromDate?: string, toDate?: string) {
  const filteredOrders = useMemo(() => {
    if (!fromDate && !toDate) return MOCK_ORDERS
    return MOCK_ORDERS.filter((o) => {
      const d = o.createdAt
      if (fromDate && d < fromDate) return false
      if (toDate && d > toDate) return false
      return true
    })
  }, [fromDate, toDate])

  const productStats: ProductStat[] = useMemo(() => {
    const map = new Map<string, ProductStat>()
    for (const order of filteredOrders) {
      if (order.status === 'cancelled') continue
      for (const item of order.items) {
        const existing = map.get(item.productId)
        const revenue = item.sellPrice * item.quantity
        const cost = item.purchaseCost * item.quantity
        if (existing) {
          map.set(item.productId, {
            ...existing,
            totalQuantity: existing.totalQuantity + item.quantity,
            totalSellRevenue: existing.totalSellRevenue + revenue,
            totalPurchaseCost: existing.totalPurchaseCost + cost,
            totalProfit: existing.totalProfit + (revenue - cost),
            orderCount: existing.orderCount + 1,
          })
        } else {
          map.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            totalQuantity: item.quantity,
            totalSellRevenue: revenue,
            totalPurchaseCost: cost,
            totalProfit: revenue - cost,
            orderCount: 1,
          })
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalProfit - a.totalProfit)
  }, [filteredOrders])

  const periodStats: PeriodStat[] = useMemo(() => {
    const map = new Map<string, PeriodStat>()
    for (const order of filteredOrders) {
      if (order.status === 'cancelled') continue
      const period = order.createdAt.slice(0, 7)
      const existing = map.get(period)
      if (existing) {
        map.set(period, {
          ...existing,
          revenue: existing.revenue + order.totalSellRevenue,
          cost: existing.cost + order.totalPurchaseCost,
          profit: existing.profit + order.profit,
          orderCount: existing.orderCount + 1,
        })
      } else {
        map.set(period, {
          period,
          revenue: order.totalSellRevenue,
          cost: order.totalPurchaseCost,
          profit: order.profit,
          orderCount: 1,
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => a.period.localeCompare(b.period))
  }, [filteredOrders])

  const totals = useMemo(() => {
    const active = filteredOrders.filter((o) => o.status !== 'cancelled')
    return {
      totalRevenue: active.reduce((s, o) => s + o.totalSellRevenue, 0),
      totalCost: active.reduce((s, o) => s + o.totalPurchaseCost, 0),
      totalProfit: active.reduce((s, o) => s + o.profit, 0),
      orderCount: active.length,
    }
  }, [filteredOrders])

  return { productStats, periodStats, totals, isLoading: false }
}
