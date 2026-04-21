import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { products, productImages, orderItems } from '@/lib/db/schema'
import type { Product, ProductImage } from '@/types/product'

// --- Pure helpers (exported for testing) ---

export type ProductRow = {
  id: string
  name: string
  sku: string
  category: string
  refUrl: string | null
  defaultPurchaseCost: string | number
  defaultSellPrice: string | number
  createdAt: Date
  updatedAt: Date
}

export function mapProductRow(row: ProductRow, images: ProductImage[] = []): Product {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    refUrl: row.refUrl,
    images,
    defaultPurchaseCost: Number(row.defaultPurchaseCost),
    defaultSellPrice: Number(row.defaultSellPrice),
    isTracked: false, // tracking is client-side (localStorage)
  }
}

// --- DB queries ---

export async function getProducts(): Promise<Product[]> {
  const rows = await db.query.products.findMany({
    with: { images: { orderBy: (i, { asc }) => [asc(i.sortOrder)] } },
  })
  return rows.map((row) => mapProductRow(row, row.images))
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: { images: { orderBy: (i, { asc }) => [asc(i.sortOrder)] } },
  })
  if (!row) return null
  return mapProductRow(row, row.images)
}

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(productImages.sortOrder)
}

export async function getProductImagesBySku(sku: string): Promise<ProductImage[]> {
  const product = await db.query.products.findFirst({
    where: eq(products.sku, sku),
  })
  if (!product) return []
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(productImages.sortOrder)
}

// --- CRUD ---

export type ProductInput = {
  name: string
  sku: string
  category: string
  refUrl?: string | null
  images?: string[]
  defaultPurchaseCost: number
  defaultSellPrice: number
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const refUrl = input.refUrl?.trim() || null

  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(products)
      .values({
        name: input.name,
        sku: input.sku,
        category: input.category,
        refUrl,
        defaultPurchaseCost: String(input.defaultPurchaseCost),
        defaultSellPrice: String(input.defaultSellPrice),
      })
      .returning()

    const imageRows = await insertImages(tx, row.id, input.images ?? [])
    return mapProductRow(row, imageRows)
  })
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<Product | null> {
  return db.transaction(async (tx) => {
    const refUrl = input.refUrl !== undefined ? (input.refUrl?.trim() || null) : undefined

    const [row] = await tx
      .update(products)
      .set({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.sku !== undefined && { sku: input.sku }),
        ...(input.category !== undefined && { category: input.category }),
        ...(refUrl !== undefined && { refUrl }),
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

    if (!row) return null

    let imageRows: ProductImage[]
    if (input.images !== undefined) {
      await tx.delete(productImages).where(eq(productImages.productId, id))
      imageRows = await insertImages(tx, id, input.images)
    } else {
      imageRows = await tx
        .select()
        .from(productImages)
        .where(eq(productImages.productId, id))
        .orderBy(productImages.sortOrder)
    }

    return mapProductRow(row, imageRows)
  })
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

// --- Internal helpers ---

type TxClient = Parameters<Parameters<typeof db.transaction>[0]>[0]

async function insertImages(tx: TxClient, productId: string, urls: string[]): Promise<ProductImage[]> {
  if (urls.length === 0) return []
  return tx
    .insert(productImages)
    .values(urls.map((url, i) => ({ productId, url, sortOrder: i })))
    .returning()
}
