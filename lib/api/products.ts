import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { products, orderItems } from '@/lib/db/schema'
import type { Product } from '@/types/product'

// --- Pure helpers (exported for testing) ---

export type ProductRow = {
  id: string
  name: string
  sku: string
  category: string
  defaultPurchaseCost: string | number
  defaultSellPrice: string | number
  createdAt: Date
  updatedAt: Date
}

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    defaultPurchaseCost: Number(row.defaultPurchaseCost),
    defaultSellPrice: Number(row.defaultSellPrice),
    isTracked: false, // tracking is client-side (localStorage)
  }
}

// --- DB queries ---

export async function getProducts(): Promise<Product[]> {
  const rows = await db.select().from(products)
  return rows.map(mapProductRow)
}

// --- CRUD ---

export type ProductInput = {
  name: string
  sku: string
  category: string
  defaultPurchaseCost: number
  defaultSellPrice: number
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const [row] = await db
    .insert(products)
    .values({
      name: input.name,
      sku: input.sku,
      category: input.category,
      defaultPurchaseCost: String(input.defaultPurchaseCost),
      defaultSellPrice: String(input.defaultSellPrice),
    })
    .returning()
  return mapProductRow(row)
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<Product | null> {
  const [row] = await db
    .update(products)
    .set({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.sku !== undefined && { sku: input.sku }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.defaultPurchaseCost !== undefined && {
        defaultPurchaseCost: String(input.defaultPurchaseCost),
      }),
      ...(input.defaultSellPrice !== undefined && {
        defaultSellPrice: String(input.defaultSellPrice),
      }),
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning()
  return row ? mapProductRow(row) : null
}

export async function deleteProduct(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const usages = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .where(eq(orderItems.productId, id))
    .limit(1)

  if (usages.length > 0) {
    return { success: false, error: 'Sản phẩm đang được dùng trong đơn hàng, không thể xóa' }
  }

  await db.delete(products).where(eq(products.id, id))
  return { success: true }
}
