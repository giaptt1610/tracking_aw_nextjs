import { NextResponse } from 'next/server'
import { getOrders } from '@/lib/api/orders'
import type { OrderStatus } from '@/types/order'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as OrderStatus | null
    const from = searchParams.get('from') ?? undefined
    const to = searchParams.get('to') ?? undefined
    const page = Number(searchParams.get('page') ?? 1)
    const pageSize = Number(searchParams.get('pageSize') ?? 10)

    const result = await getOrders({
      status: status ?? undefined,
      from,
      to,
      page,
      pageSize,
    })

    return NextResponse.json({
      success: true,
      data: result,
      meta: { page, pageSize, total: result.total },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
