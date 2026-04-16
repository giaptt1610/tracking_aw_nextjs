import { Order, OrderStatus } from '@/types/order'
import { MOCK_PRODUCTS } from './products'

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled']

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

export function generateMockOrders(count = 50): Order[] {
  const orders: Order[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const itemCount = Math.floor(pseudoRandom(i * 7) * 3) + 1
    const items = Array.from({ length: itemCount }, (_, j) => {
      const productIdx = Math.floor(pseudoRandom(i * 13 + j) * MOCK_PRODUCTS.length)
      const product = MOCK_PRODUCTS[productIdx]
      const quantity = Math.floor(pseudoRandom(i * 17 + j) * 5) + 1
      return {
        productId: product.id,
        productName: product.name,
        quantity,
        purchaseCost: product.defaultPurchaseCost,
        sellPrice: product.defaultSellPrice,
      }
    })

    const totalPurchaseCost = items.reduce((s, it) => s + it.purchaseCost * it.quantity, 0)
    const totalSellRevenue = items.reduce((s, it) => s + it.sellPrice * it.quantity, 0)
    const daysAgo = Math.floor(pseudoRandom(i * 3) * 90)
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)

    orders.push({
      id: `ORD-${String(i + 1).padStart(4, '0')}`,
      createdAt: date.toISOString(),
      status: STATUSES[Math.floor(pseudoRandom(i * 11) * STATUSES.length)],
      items,
      totalPurchaseCost,
      totalSellRevenue,
      profit: totalSellRevenue - totalPurchaseCost,
    })
  }

  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const MOCK_ORDERS = generateMockOrders(50)
