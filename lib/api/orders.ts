import { eq, gte, lte, and, desc, count, SQL } from 'drizzle-orm'
import { db } from '@/lib/db'
import { orders, orderItems } from '@/lib/db/schema'
import type { OrderStatus } from '@/types/order'
import type { Order } from '@/types/order'

// --- Pure helpers (exported for testing) ---

export type OrderRowItem = {
  id: string
  orderId: string
  productId: string
  productName: string
  quantity: number
  purchaseCost: string | number
  sellPrice: string | number
}

export type OrderRow = {
  id: string
  status: string
  totalPurchaseCost: string | number
  totalSellRevenue: string | number
  note: string | null
  createdAt: Date
  items: OrderRowItem[]
}

export function mapOrderRow(row: OrderRow): Order {
  const totalPurchaseCost = Number(row.totalPurchaseCost)
  const totalSellRevenue = Number(row.totalSellRevenue)
  return {
    id: row.id,
    status: row.status as OrderStatus,
    totalPurchaseCost,
    totalSellRevenue,
    profit: totalSellRevenue - totalPurchaseCost,
    note: row.note ?? undefined,
    createdAt: row.createdAt instanceof Date
      ? row.createdAt.toISOString()
      : String(row.createdAt),
    items: row.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      purchaseCost: Number(item.purchaseCost),
      sellPrice: Number(item.sellPrice),
    })),
  }
}

export type OrderFiltersInput = {
  status?: string
  from?: string
  to?: string
}

export function buildOrderFilters(input: OrderFiltersInput): SQL[] {
  const conditions: SQL[] = []
  if (input.status) {
    conditions.push(eq(orders.status, input.status))
  }
  if (input.from) {
    conditions.push(gte(orders.createdAt, new Date(input.from)))
  }
  if (input.to) {
    conditions.push(lte(orders.createdAt, new Date(input.to)))
  }
  return conditions
}

// --- DB queries ---

export type GetOrdersOptions = {
  status?: OrderStatus
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

export async function getOrders(options: GetOrdersOptions = {}): Promise<{ orders: Order[]; total: number }> {
  const { page = 1, pageSize = 10 } = options
  const offset = (page - 1) * pageSize

  const conditions = buildOrderFilters({
    status: options.status,
    from: options.from,
    to: options.to,
  })
  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, [{ value: total }]] = await Promise.all([
    db.query.orders.findMany({
      where,
      orderBy: [desc(orders.createdAt)],
      limit: pageSize,
      offset,
      with: { items: true },
    }),
    db.select({ value: count() }).from(orders).where(where),
  ])

  return {
    orders: rows.map((r) => mapOrderRow({ ...r, items: r.items as OrderRowItem[] })),
    total: Number(total),
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const row = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true },
  })
  if (!row) return null
  return mapOrderRow({ ...row, items: row.items as OrderRowItem[] })
}
