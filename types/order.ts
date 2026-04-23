export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "invalid"

export type PaymentType = "cash" | "visa"

export interface OrderItem {
  productId: string
  productName: string
  flavorId: string | null
  flavorName: string | null
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
  paymentType?: PaymentType | null
}
