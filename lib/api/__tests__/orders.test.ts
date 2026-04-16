import { describe, it, expect } from 'vitest'

// These tests target pure helper functions exported from lib/api/orders
// No DB connection needed — functions are imported directly

describe('mapOrderRow', () => {
  it('converts numeric strings to numbers and computes profit', async () => {
    const { mapOrderRow } = await import('@/lib/api/orders')
    const row = {
      id: 'ord-1',
      status: 'delivered',
      totalPurchaseCost: '100.00',
      totalSellRevenue: '150.00',
      note: null,
      createdAt: new Date('2024-01-15'),
      items: [
        {
          id: 'item-1',
          orderId: 'ord-1',
          productId: 'prod-1',
          productName: 'Áo thun',
          quantity: 2,
          purchaseCost: '50.00',
          sellPrice: '75.00',
        },
      ],
    }
    const result = mapOrderRow(row)
    expect(result.id).toBe('ord-1')
    expect(result.totalPurchaseCost).toBe(100)
    expect(result.totalSellRevenue).toBe(150)
    expect(result.profit).toBe(50)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].quantity).toBe(2)
    expect(result.items[0].purchaseCost).toBe(50)
    expect(result.items[0].sellPrice).toBe(75)
  })

  it('sets status and note from DB row', async () => {
    const { mapOrderRow } = await import('@/lib/api/orders')
    const row = {
      id: 'ord-2',
      status: 'pending',
      totalPurchaseCost: '0.00',
      totalSellRevenue: '0.00',
      note: 'test note',
      createdAt: new Date(),
      items: [],
    }
    const result = mapOrderRow(row)
    expect(result.status).toBe('pending')
    expect(result.note).toBe('test note')
    expect(result.profit).toBe(0)
  })
})

describe('buildOrderFilters', () => {
  it('returns empty array when no filters', async () => {
    const { buildOrderFilters } = await import('@/lib/api/orders')
    const result = buildOrderFilters({})
    expect(result).toEqual([])
  })

  it('includes status filter when provided', async () => {
    const { buildOrderFilters } = await import('@/lib/api/orders')
    const result = buildOrderFilters({ status: 'delivered' })
    expect(result).toHaveLength(1)
  })

  it('includes date range filters when both dates provided', async () => {
    const { buildOrderFilters } = await import('@/lib/api/orders')
    const result = buildOrderFilters({ from: '2024-01-01', to: '2024-12-31' })
    expect(result).toHaveLength(2)
  })
})
