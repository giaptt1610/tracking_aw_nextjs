import { eq, gte, lte, and, desc, count, sum, ne, SQL } from "drizzle-orm"
import { db } from "@/lib/db"
import { orders, orderItems, productFlavors } from "@/lib/db/schema"
import type { OrderStatus, Order, PaymentType } from "@/types/order"

// --- Pure helpers (exported for testing) ---

export type OrderRowItem = {
  id: string
  orderId: string
  productId: string
  productName: string
  flavorId: string | null
  flavorName: string | null
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
  paymentType: string | null
  customerName: string | null
  customerPhone: string | null
  createdAt: Date
  items: OrderRowItem[]
}

function isPaymentType(v: unknown): v is PaymentType {
  return v === "cash" || v === "visa"
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
    paymentType: isPaymentType(row.paymentType) ? row.paymentType : null,
    customerName: row.customerName ?? null,
    customerPhone: row.customerPhone ?? null,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
    items: row.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      flavorId: item.flavorId ?? null,
      flavorName: item.flavorName ?? null,
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

export async function getOrders(
  options: GetOrdersOptions = {},
): Promise<{ orders: Order[]; total: number }> {
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
    orders: rows.map((r) =>
      mapOrderRow({ ...r, items: r.items as OrderRowItem[] }),
    ),
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

export async function getOrderTotals(
  filters: OrderFiltersInput = {},
): Promise<OrderTotals> {
  const conditions = buildOrderFilters(filters)
  conditions.push(ne(orders.status, "cancelled"))
  conditions.push(ne(orders.status, "invalid"))
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

export type PaymentTypeCostRow = {
  paymentType: "cash" | "visa" | "unknown"
  totalCost: number
  orderCount: number
}

export async function getCostByPaymentType(
  filters: OrderFiltersInput = {},
): Promise<PaymentTypeCostRow[]> {
  const conditions = buildOrderFilters(filters)
  conditions.push(ne(orders.status, "cancelled"))
  conditions.push(ne(orders.status, "invalid"))
  const where = and(...conditions)

  const rows = await db
    .select({
      paymentType: orders.paymentType,
      totalCost: sum(orders.totalPurchaseCost),
      orderCount: count(),
    })
    .from(orders)
    .where(where)
    .groupBy(orders.paymentType)

  return rows.map((r) => ({
    paymentType:
      r.paymentType === "cash" || r.paymentType === "visa"
        ? r.paymentType
        : ("unknown" as const),
    totalCost: Number(r.totalCost ?? 0),
    orderCount: Number(r.orderCount ?? 0),
  }))
}

// --- CRUD ---

export type OrderItemInput = {
  productId: string
  productName: string
  flavorId?: string | null
  quantity: number
  // purchaseCost/sellPrice are ignored by the server when flavorId is provided;
  // the server re-reads prices from DB to prevent client tampering.
  purchaseCost: number
  sellPrice: number
}

export type CreateOrderInput = {
  status: OrderStatus
  note?: string
  paymentType?: PaymentType | null
  customerName?: string | null
  customerPhone?: string | null
  createdAt?: string
  items: OrderItemInput[]
}

export type UpdateOrderInput = {
  status?: OrderStatus
  note?: string
  paymentType?: PaymentType | null
  customerName?: string | null
  customerPhone?: string | null
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return db.transaction(async (tx) => {
    // Resolve prices server-side for flavor items; client-supplied prices are ignored
    const resolvedItems = await Promise.all(
      input.items.map(async (it) => {
        if (!it.flavorId) {
          return {
            productId: it.productId,
            productName: it.productName,
            flavorId: null as string | null,
            flavorName: null as string | null,
            quantity: it.quantity,
            purchaseCost: it.purchaseCost,
            sellPrice: it.sellPrice,
          }
        }

        const [flavor] = await tx
          .select()
          .from(productFlavors)
          .where(eq(productFlavors.id, it.flavorId))
          .limit(1)

        if (!flavor) {
          throw new Error("Phiên bản sản phẩm không tồn tại")
        }
        if (flavor.productId !== it.productId) {
          throw new Error("Phiên bản không thuộc sản phẩm này")
        }
        if (flavor.status === "out_of_stock") {
          throw new Error(`Phiên bản "${flavor.name}" hiện không còn hàng`)
        }

        return {
          productId: it.productId,
          productName: it.productName,
          flavorId: flavor.id,
          flavorName: flavor.name,
          quantity: it.quantity,
          purchaseCost: Number(flavor.purchaseCost),
          sellPrice: Number(flavor.sellPrice),
        }
      }),
    )

    const totalPurchaseCost = resolvedItems.reduce(
      (acc, it) => acc + it.purchaseCost * it.quantity,
      0,
    )
    const totalSellRevenue = resolvedItems.reduce(
      (acc, it) => acc + it.sellPrice * it.quantity,
      0,
    )

    const createdAt = input.createdAt ? new Date(input.createdAt) : undefined

    const [order] = await tx
      .insert(orders)
      .values({
        status: input.status,
        totalPurchaseCost: String(totalPurchaseCost),
        totalSellRevenue: String(totalSellRevenue),
        note: input.note ?? null,
        paymentType: input.paymentType ?? null,
        customerName: input.customerName ?? null,
        customerPhone: input.customerPhone ?? null,
        ...(createdAt && { createdAt }),
      })
      .returning()

    await tx.insert(orderItems).values(
      resolvedItems.map((it) => ({
        orderId: order.id,
        productId: it.productId,
        productName: it.productName,
        flavorId: it.flavorId,
        flavorName: it.flavorName,
        quantity: it.quantity,
        purchaseCost: String(it.purchaseCost),
        sellPrice: String(it.sellPrice),
      })),
    )

    const full = await getOrderById(order.id)
    return full!
  })
}

export async function updateOrder(
  id: string,
  input: UpdateOrderInput,
): Promise<Order | null> {
  const [row] = await db
    .update(orders)
    .set({
      ...(input.status !== undefined && { status: input.status }),
      ...(input.note !== undefined && { note: input.note }),
      ...(input.paymentType !== undefined && {
        paymentType: input.paymentType,
      }),
      ...(input.customerName !== undefined && {
        customerName: input.customerName,
      }),
      ...(input.customerPhone !== undefined && {
        customerPhone: input.customerPhone,
      }),
    })
    .where(eq(orders.id, id))
    .returning()

  if (!row) return null
  return getOrderById(id)
}

export async function deleteOrder(id: string): Promise<boolean> {
  const [row] = await db
    .update(orders)
    .set({ status: "invalid" })
    .where(eq(orders.id, id))
    .returning({ id: orders.id })
  return row !== undefined
}
