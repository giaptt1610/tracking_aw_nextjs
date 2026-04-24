import { NextResponse } from "next/server"
import { getProductImagesBySku } from "@/lib/api/products"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sku: string }> },
) {
  try {
    const { sku } = await params
    const data = await getProductImagesBySku(sku)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch product images" },
      { status: 500 },
    )
  }
}
