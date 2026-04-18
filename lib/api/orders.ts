import { eq, gte, lte, and, desc, count, sum, ne, SQL } from 'drizzle-orm'
import { db } from '@/lib/db'
import { orders, orderItems } from '@/lib/db/schema'
import type { OrderStatus, Order } from '@/types/order'

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

export type OrderTotals = {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  orderCount: number
}

export async function getOrderTotals(filters: OrderFiltersInput = {}): Promise<OrderTotals> {
  const conditions = buildOrderFilters(filters)
  conditions.push(ne(orders.status, 'cancelled'))
  const where = and(...conditions)

  const [row] = await db
    .select({
      totalRevenue: sum(orders.totalSellRevenue),
      totalCost: sum(orders.totalPurchaseCost),
      orderCount: count(),
    })
    .from(orders)
    .where(where)

  const totalRevenue = Number(row?.totalRevenue ?? 0)
  const totalCost = Number(row?.totalCost ?? 0)
  return {
    totalRevenue,
    totalCost,
    totalProfit: totalRevenue - totalCost,
    orderCount: Number(row?.orderCount ?? 0),
  }
}

// --- CRUD ---

export type OrderItemInput = {
  productId: string
  productName: string
  quantity: number
  purchaseCost: number
  sellPrice: number
}

export type CreateOrderInput = {
  status: OrderStatus
  note?: string
  items: OrderItemInput[]
}

export type UpdateOrderInput = {
  status?: OrderStatus
  note?: string
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const totalPurchaseCost = input.items.reduce(
    (sum, it) => sum + it.purchaseCost * it.quantity,
    0
  )
  const totalSellRevenue = input.items.reduce(
    (sum, it) => sum + it.sellPrice * it.quantity,
    0
  )

  const [order] = await db
    .insert(orders)
    .values({
      status: input.status,
      totalPurchaseCost: String(totalPurchaseCost),
      totalSellRevenue: String(totalSellRevenue),
      note: input.note ?? null,
    })
    .returning()

  try {
    await db.insert(orderItems).values(
      input.items.map((it) => ({
        orderId: order.id,
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        purchaseCost: String(it.purchaseCost),
        sellPrice: String(it.sellPrice),
      }))
    )
  } catch (err) {
    // Clean up the order if items insert fails
    await db.delete(orders).where(eq(orders.id, order.id))
    throw err
  }

  const full = await getOrderById(order.id)
  return full!
}

export async function updateOrder(
  id: string,
  input: UpdateOrderInput
): Promise<Order | null> {
  const [row] = await db
    .update(orders)
    .set({
      ...(input.status !== undefined && { status: input.status }),
      ...(input.note !== undefined && { note: input.note }),
    })
    .where(eq(orders.id, id))
    .returning()

  if (!row) return null
  return getOrderById(id)
}

export async function deleteOrder(id: string): Promise<boolean> {
  // orderItems cascade-delete automatically (onDelete: 'cascade' in schema)
  const result = await db
    .delete(orders)
    .where(eq(orders.id, id))
    .returning({ id: orders.id })
  return result.length > 0
}
