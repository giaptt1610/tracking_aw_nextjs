import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

vi.mock('@/lib/api/orders', () => ({
  createOrder: vi.fn(),
  updateOrder: vi.fn(),
  deleteOrder: vi.fn(),
}))

const mockOrder = {
  id: 'ord-uuid-1',
  status: 'pending' as const,
  totalPurchaseCost: 100000,
  totalSellRevenue: 150000,
  profit: 50000,
  note: undefined,
  createdAt: '2024-01-15T00:00:00.000Z',
  items: [
    {
      productId: 'prod-uuid-1',
      productName: 'Áo thun',
      quantity: 2,
      purchaseCost: 50000,
      sellPrice: 75000,
    },
  ],
}

describe('createOrderAction', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success with order data on valid input', async () => {
    const { createOrder } = await import('@/lib/api/orders')
    vi.mocked(createOrder).mockResolvedValueOnce(mockOrder)

    const { createOrderAction } = await import('@/lib/actions/orders')
    const result = await createOrderAction({
      status: 'pending',
      items: [
        {
          productId: 'prod-uuid-1',
          productName: 'Áo thun',
          quantity: 2,
          purchaseCost: 50000,
          sellPrice: 75000,
        },
      ],
    })

    expect(result.success).toBe(true)
    expect(result.data?.id).toBe('ord-uuid-1')
  })

  it('calls revalidatePath for orders, dashboard, statistics after create', async () => {
    const { createOrder } = await import('@/lib/api/orders')
    vi.mocked(createOrder).mockResolvedValueOnce(mockOrder)
    const { revalidatePath } = await import('next/cache')

    const { createOrderAction } = await import('@/lib/actions/orders')
    await createOrderAction({
      status: 'pending',
      items: [
        {
          productId: 'prod-uuid-1',
          productName: 'Áo thun',
          quantity: 2,
          purchaseCost: 50000,
          sellPrice: 75000,
        },
      ],
    })

    expect(revalidatePath).toHaveBeenCalledWith('/orders')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(revalidatePath).toHaveBeenCalledWith('/statistics')
  })

  it('returns error on exception', async () => {
    const { createOrder } = await import('@/lib/api/orders')
    vi.mocked(createOrder).mockRejectedValueOnce(new Error('Insert failed'))

    const { createOrderAction } = await import('@/lib/actions/orders')
    const result = await createOrderAction({ status: 'pending', items: [] })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Insert failed')
  })
})

describe('updateOrderAction', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success with updated order', async () => {
    const { updateOrder } = await import('@/lib/api/orders')
    const updated = { ...mockOrder, status: 'completed' as const }
    vi.mocked(updateOrder).mockResolvedValueOnce(updated)

    const { updateOrderAction } = await import('@/lib/actions/orders')
    const result = await updateOrderAction('ord-uuid-1', { status: 'completed' })

    expect(result.success).toBe(true)
    expect(result.data?.status).toBe('completed')
  })

  it('returns error when order not found', async () => {
    const { updateOrder } = await import('@/lib/api/orders')
    vi.mocked(updateOrder).mockResolvedValueOnce(null)

    const { updateOrderAction } = await import('@/lib/actions/orders')
    const result = await updateOrderAction('non-existent', { status: 'completed' })

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('calls revalidatePath after update', async () => {
    const { updateOrder } = await import('@/lib/api/orders')
    vi.mocked(updateOrder).mockResolvedValueOnce(mockOrder)
    const { revalidatePath } = await import('next/cache')

    const { updateOrderAction } = await import('@/lib/actions/orders')
    await updateOrderAction('ord-uuid-1', { status: 'completed' })

    expect(revalidatePath).toHaveBeenCalledWith('/orders')
  })
})

describe('deleteOrderAction', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success when order deleted', async () => {
    const { deleteOrder } = await import('@/lib/api/orders')
    vi.mocked(deleteOrder).mockResolvedValueOnce(true)

    const { deleteOrderAction } = await import('@/lib/actions/orders')
    const result = await deleteOrderAction('ord-uuid-1')

    expect(result.success).toBe(true)
  })

  it('returns error when order not found', async () => {
    const { deleteOrder } = await import('@/lib/api/orders')
    vi.mocked(deleteOrder).mockResolvedValueOnce(false)

    const { deleteOrderAction } = await import('@/lib/actions/orders')
    const result = await deleteOrderAction('non-existent')

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('calls revalidatePath for orders, dashboard, statistics after delete', async () => {
    const { deleteOrder } = await import('@/lib/api/orders')
    vi.mocked(deleteOrder).mockResolvedValueOnce(true)
    const { revalidatePath } = await import('next/cache')

    const { deleteOrderAction } = await import('@/lib/actions/orders')
    await deleteOrderAction('ord-uuid-1')

    expect(revalidatePath).toHaveBeenCalledWith('/orders')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(revalidatePath).toHaveBeenCalledWith('/statistics')
  })
})
