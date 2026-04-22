import { NextResponse } from 'next/server'
import { getProductImagesBySku } from '@/lib/api/products'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { sku: string } }
) {
  try {
    const data = await getProductImagesBySku(params.sku)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product images' },
      { status: 500 }
    )
  }
}
