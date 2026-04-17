import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/api/products'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getProducts()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
