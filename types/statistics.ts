export interface ProductStat {
  productId: string
  productName: string
  totalQuantity: number
  totalPurchaseCost: number
  totalSellRevenue: number
  totalProfit: number
  orderCount: number
}

export interface PeriodStat {
  period: string
  revenue: number
  cost: number
  profit: number
  orderCount: number
}
