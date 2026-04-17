'use server'

import { revalidatePath } from 'next/cache'
import { createProduct, updateProduct, deleteProduct } from '@/lib/api/products'
import type { ProductInput } from '@/lib/api/products'
import type { Product } from '@/types/product'

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createProductAction(
  input: ProductInput
): Promise<ActionResult<Product>> {
  try {
    const product = await createProduct(input)
    revalidatePath('/products')
    return { success: true, data: product }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function updateProductAction(
  id: string,
  input: Partial<ProductInput>
): Promise<ActionResult<Product>> {
  try {
    const product = await updateProduct(id, input)
    if (!product) {
      return { success: false, error: 'Sản phẩm không tồn tại' }
    }
    revalidatePath('/products')
    return { success: true, data: product }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function deleteProductAction(
  id: string
): Promise<ActionResult<void>> {
  try {
    const result = await deleteProduct(id)
    if (!result.success) {
      return { success: false, error: result.error ?? 'Không thể xóa sản phẩm' }
    }
    revalidatePath('/products')
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
