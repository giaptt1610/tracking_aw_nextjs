import { ne, gte, lte, and, sum, count, SQL } from 'drizzle-orm'
import { db } from '@/lib/db'
import { orders, orderItems } from '@/lib/db/schema'
import type { ProductStat, PeriodStat } from '@/types/statistics'

// --- Pure helpers (exported for testing) ---

export type ProductStatRow = {
  productId: string
  productName: string
  totalQuantity: string | number
  totalPurchaseCost: string | number
  totalSellRevenue: string | number
  totalProfit: string | number
  orderCount: string | number
}

export function mapProductStatRow(row: ProductStatRow): ProductStat {
  return {
    productId: row.productId,
    productName: row.productName,
    totalQuantity: Number(row.totalQuantity),
    totalPurchaseCost: Number(row.totalPurchaseCost),
    totalSellRevenue: Number(row.totalSellRevenue),
    totalProfit: Number(row.totalProfit),
    orderCount: Number(row.orderCount),
  }
}

export function computeTotals(stats: ProductStat[]) {
  return stats.reduce(
    (acc, s) => ({
      totalRevenue: acc.totalRevenue + s.totalSellRevenue,
      totalCost: acc.totalCost + s.totalPurchaseCost,
      totalProfit: acc.totalProfit + s.totalProfit,
      orderCount: acc.orderCount + s.orderCount,
    }),
    { totalRevenue: 0, totalCost: 0, totalProfit: 0, orderCount: 0 }
  )
}

// --- DB queries ---

export type GetStatisticsOptions = {
  fromDate?: string
  toDate?: string
}

export async function getStatistics(options: GetStatisticsOptions = {}) {
  const dateConditions: SQL[] = [ne(orders.status, 'cancelled')]
  if (options.fromDate) {
    dateConditions.push(gte(orders.createdAt, new Date(options.fromDate)))
  }
  if (options.toDate) {
    dateConditions.push(lte(orders.createdAt, new Date(options.toDate)))
  }
  const where = and(...dateConditions)

  // Product stats via join
  const productRows = await db
    .select({
      productId: orderItems.productId,
      productName: orderItems.productName,
      totalQuantity: sum(orderItems.quantity).mapWith(Number),
      totalPurchaseCost: sum(orderItems.purchaseCost).mapWith(Number),
      totalSellRevenue: sum(orderItems.sellPrice).mapWith(Number),
      totalProfit: sum(orderItems.sellPrice).mapWith(Number),
      orderCount: count(orderItems.orderId),
    })
    .from(orderItems)
    .innerJoin(orders, and(
      ne(orders.status, 'cancelled'),
      options.fromDate ? gte(orders.createdAt, new Date(options.fromDate)) : undefined,
      options.toDate ? lte(orders.createdAt, new Date(options.toDate)) : undefined,
    ))
    .groupBy(orderItems.productId, orderItems.productName)

  const productStats: ProductStat[] = productRows.map((r) => ({
    productId: r.productId,
    productName: r.productName,
    totalQuantity: r.totalQuantity ?? 0,
    totalPurchaseCost: r.totalPurchaseCost ?? 0,
    totalSellRevenue: r.totalSellRevenue ?? 0,
    totalProfit: (r.totalSellRevenue ?? 0) - (r.totalPurchaseCost ?? 0),
    orderCount: r.orderCount,
  })).sort((a, b) => b.totalProfit - a.totalProfit)

  // Period stats (monthly aggregation done in app layer for simplicity)
  const orderRows = await db
    .select({
      createdAt: orders.createdAt,
      totalPurchaseCost: orders.totalPurchaseCost,
      totalSellRevenue: orders.totalSellRevenue,
    })
    .from(orders)
    .where(where)

  const periodMap = new Map<string, PeriodStat>()
  for (const row of orderRows) {
    const period = row.createdAt.toISOString().slice(0, 7) // YYYY-MM
    const revenue = Number(row.totalSellRevenue)
    const cost = Number(row.totalPurchaseCost)
    const existing = periodMap.get(period)
    if (existing) {
      existing.revenue += revenue
      existing.cost += cost
      existing.profit += revenue - cost
      existing.orderCount += 1
    } else {
      periodMap.set(period, { period, revenue, cost, profit: revenue - cost, orderCount: 1 })
    }
  }
  const periodStats = Array.from(periodMap.values()).sort((a, b) => a.period.localeCompare(b.period))

  const totals = computeTotals(productStats)

  return { productStats, periodStats, totals }
}
