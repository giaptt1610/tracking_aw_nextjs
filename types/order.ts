export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  purchaseCost: number
  sellPrice: number
}

export interface Order {
  id: string
  createdAt: string
  status: OrderStatus
  items: OrderItem[]
  totalPurchaseCost: number
  totalSellRevenue: number
  profit: number
  note?: string
}
