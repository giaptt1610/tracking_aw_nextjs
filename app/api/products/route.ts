import { NextRequest, NextResponse } from 'next/server'
import { getProducts, createProduct, type ProductInput } from '@/lib/api/products'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ProductInput
    const data = await createProduct(body)
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
