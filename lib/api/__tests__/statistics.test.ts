import { describe, it, expect } from 'vitest'

describe('computeTotals', () => {
  it('sums revenue, cost, profit, orderCount across product stats', async () => {
    const { computeTotals } = await import('@/lib/api/statistics')
    const stats = [
      { productId: 'p1', productName: 'A', totalQuantity: 10, totalPurchaseCost: 100, totalSellRevenue: 150, totalProfit: 50, orderCount: 5 },
      { productId: 'p2', productName: 'B', totalQuantity: 5, totalPurchaseCost: 200, totalSellRevenue: 300, totalProfit: 100, orderCount: 3 },
    ]
    const totals = computeTotals(stats)
    expect(totals.totalRevenue).toBe(450)
    expect(totals.totalCost).toBe(300)
    expect(totals.totalProfit).toBe(150)
    expect(totals.orderCount).toBe(8)
  })

  it('returns zeros for empty stats', async () => {
    const { computeTotals } = await import('@/lib/api/statistics')
    const totals = computeTotals([])
    expect(totals.totalRevenue).toBe(0)
    expect(totals.totalCost).toBe(0)
    expect(totals.totalProfit).toBe(0)
    expect(totals.orderCount).toBe(0)
  })
})

describe('mapProductStatRow', () => {
  it('converts numeric strings from DB to numbers', async () => {
    const { mapProductStatRow } = await import('@/lib/api/statistics')
    const row = {
      productId: 'p1',
      productName: 'Áo thun',
      totalQuantity: '10',
      totalPurchaseCost: '100.00',
      totalSellRevenue: '150.00',
      totalProfit: '50.00',
      orderCount: '5',
    }
    const result = mapProductStatRow(row)
    expect(result.totalQuantity).toBe(10)
    expect(result.totalPurchaseCost).toBe(100)
    expect(result.totalSellRevenue).toBe(150)
    expect(result.totalProfit).toBe(50)
    expect(result.orderCount).toBe(5)
  })
})
