'use server'

import { revalidatePath } from 'next/cache'
import { createOrder, updateOrder, deleteOrder } from '@/lib/api/orders'
import type { CreateOrderInput, UpdateOrderInput } from '@/lib/api/orders'
import type { Order } from '@/types/order'

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

function revalidateOrderPaths() {
  revalidatePath('/orders')
  revalidatePath('/dashboard')
  revalidatePath('/statistics')
}

export async function createOrderAction(
  input: CreateOrderInput
): Promise<ActionResult<Order>> {
  try {
    const order = await createOrder(input)
    revalidateOrderPaths()
    return { success: true, data: order }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function updateOrderAction(
  id: string,
  input: UpdateOrderInput
): Promise<ActionResult<Order>> {
  try {
    const order = await updateOrder(id, input)
    if (!order) {
      return { success: false, error: 'Đơn hàng không tồn tại' }
    }
    revalidateOrderPaths()
    return { success: true, data: order }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function deleteOrderAction(
  id: string
): Promise<ActionResult<void>> {
  try {
    const deleted = await deleteOrder(id)
    if (!deleted) {
      return { success: false, error: 'Đơn hàng không tồn tại' }
    }
    revalidateOrderPaths()
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
