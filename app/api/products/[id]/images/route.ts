import { NextResponse } from 'next/server'
import { getProductImages } from '@/lib/api/products'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await getProductImages(params.id)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product images' },
      { status: 500 }
    )
  }
}
