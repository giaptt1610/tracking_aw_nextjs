import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { sum, count, gte, lte, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    const conditions = []
    if (fromDate) conditions.push(gte(orders.createdAt, new Date(fromDate)))
    if (toDate) conditions.push(lte(orders.createdAt, new Date(toDate)))
    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [totals] = await db
      .select({
        totalRevenue: sum(orders.totalSellRevenue),
        totalCost: sum(orders.totalPurchaseCost),
        orderCount: count(),
      })
      .from(orders)
      .where(where)

    const statusRows = await db
      .select({ status: orders.status, count: count() })
      .from(orders)
      .where(where)
      .groupBy(orders.status)

    const totalRevenue = Number(totals.totalRevenue ?? 0)
    const totalCost = Number(totals.totalCost ?? 0)

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalCost,
        totalProfit: totalRevenue - totalCost,
        orderCount: Number(totals.orderCount),
        ordersByStatus: Object.fromEntries(
          statusRows.map((r) => [r.status, Number(r.count)])
        ),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
