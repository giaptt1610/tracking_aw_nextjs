import { NextResponse } from "next/server"
import { getOrderById } from "@/lib/api/orders"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const order = await getOrderById(id)
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      )
    }
    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 },
    )
  }
}
