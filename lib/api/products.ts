import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
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
