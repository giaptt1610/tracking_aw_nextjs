import { eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  products,
  productImages,
  productFlavors,
  orderItems,
} from "@/lib/db/schema"
import type { Product, ProductImage, ProductFlavor } from "@/types/product"

// --- Pure helpers (exported for testing) ---

export type ProductRow = {
  id: string
  name: string
  sku: string
  category: string
  refUrl: string | null
  tags: string[]
  defaultPurchaseCost: string | number
  defaultSellPrice: string | number
  createdAt: Date
  updatedAt: Date
}

export type FlavorRow = {
  id: string
  productId: string
  name: string
  purchaseCost: string | number
  sellPrice: string | number
  status: string
  sortOrder: number
}

export function mapFlavorRow(row: FlavorRow): ProductFlavor {
  return {
    id: row.id,
    productId: row.productId,
    name: row.name,
    purchaseCost: Number(row.purchaseCost),
    sellPrice: Number(row.sellPrice),
    status: row.status as ProductFlavor["status"],
    sortOrder: row.sortOrder,
  }
}

export function mapProductRow(
  row: ProductRow,
  images: ProductImage[] = [],
  flavors: ProductFlavor[] = [],
): Product {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    refUrl: row.refUrl,
    tags: row.tags,
    images,
    flavors,
    defaultPurchaseCost: Number(row.defaultPurchaseCost),
    defaultSellPrice: Number(row.defaultSellPrice),
    isTracked: false,
  }
}

// --- DB queries ---

export async function getProducts(): Promise<Product[]> {
  const rows = await db.query.products.findMany({
    with: {
      images: { orderBy: (i, { asc }) => [asc(i.sortOrder)] },
      flavors: { orderBy: (f, { asc }) => [asc(f.sortOrder), asc(f.name)] },
    },
  })
  return rows.map((row) =>
    mapProductRow(row, row.images, row.flavors.map(mapFlavorRow)),
  )
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      images: { orderBy: (i, { asc }) => [asc(i.sortOrder)] },
      flavors: { orderBy: (f, { asc }) => [asc(f.sortOrder), asc(f.name)] },
    },
  })
  if (!row) return null
  return mapProductRow(row, row.images, row.flavors.map(mapFlavorRow))
}

export async function getProductImages(
  productId: string,
): Promise<ProductImage[]> {
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(productImages.sortOrder)
}

export async function getProductImagesBySku(
  sku: string,
): Promise<ProductImage[]> {
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

export type FlavorInput = {
  id?: string
  name: string
  purchaseCost: number
  sellPrice: number
  status?: "active" | "out_of_stock"
  sortOrder?: number
}

export type ProductInput = {
  name: string
  sku: string
  category: string
  refUrl?: string | null
  tags?: string[]
  images?: string[]
  flavors?: FlavorInput[]
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
        tags: input.tags ?? [],
        defaultPurchaseCost: String(input.defaultPurchaseCost),
        defaultSellPrice: String(input.defaultSellPrice),
      })
      .returning()

    const imageRows = await insertImages(tx, row.id, input.images ?? [])
    const flavorRows = await insertFlavors(tx, row.id, input.flavors ?? [])
    return mapProductRow(row, imageRows, flavorRows.map(mapFlavorRow))
  })
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<Product | null> {
  return db.transaction(async (tx) => {
    const refUrl =
      input.refUrl !== undefined ? input.refUrl?.trim() || null : undefined

    const [row] = await tx
      .update(products)
      .set({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.sku !== undefined && { sku: input.sku }),
        ...(input.category !== undefined && { category: input.category }),
        ...(refUrl !== undefined && { refUrl }),
        ...(input.tags !== undefined && { tags: input.tags }),
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

    let flavorRows: FlavorRow[]
    if (input.flavors !== undefined) {
      flavorRows = await upsertFlavors(tx, id, input.flavors)
    } else {
      flavorRows = await tx
        .select()
        .from(productFlavors)
        .where(eq(productFlavors.productId, id))
        .orderBy(productFlavors.sortOrder, productFlavors.name)
    }

    return mapProductRow(row, imageRows, flavorRows.map(mapFlavorRow))
  })
}

export async function deleteProduct(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const usages = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .where(eq(orderItems.productId, id))
    .limit(1)

  if (usages.length > 0) {
    return {
      success: false,
      error: "Sản phẩm đang được dùng trong đơn hàng, không thể xóa",
    }
  }

  await db.delete(products).where(eq(products.id, id))
  return { success: true }
}

// --- Internal helpers ---

type TxClient = Parameters<Parameters<typeof db.transaction>[0]>[0]

async function insertImages(
  tx: TxClient,
  productId: string,
  urls: string[],
): Promise<ProductImage[]> {
  if (urls.length === 0) return []
  return tx
    .insert(productImages)
    .values(urls.map((url, i) => ({ productId, url, sortOrder: i })))
    .returning()
}

async function insertFlavors(
  tx: TxClient,
  productId: string,
  flavors: FlavorInput[],
): Promise<FlavorRow[]> {
  if (flavors.length === 0) return []
  return tx
    .insert(productFlavors)
    .values(
      flavors.map((f, i) => ({
        productId,
        name: f.name,
        purchaseCost: String(f.purchaseCost),
        sellPrice: String(f.sellPrice),
        status: f.status ?? "active",
        sortOrder: f.sortOrder ?? i,
      })),
    )
    .returning()
}

// Upsert flavors: update existing (by id), insert new, soft-delete removed ones
async function upsertFlavors(
  tx: TxClient,
  productId: string,
  flavors: FlavorInput[],
): Promise<FlavorRow[]> {
  const existing = await tx
    .select({ id: productFlavors.id })
    .from(productFlavors)
    .where(eq(productFlavors.productId, productId))

  const existingIds = new Set(existing.map((r) => r.id))
  const incomingIds = new Set(flavors.filter((f) => f.id).map((f) => f.id!))

  // Soft-delete existing flavors removed from the list
  const toSoftDelete = Array.from(existingIds).filter(
    (id) => !incomingIds.has(id),
  )
  if (toSoftDelete.length > 0) {
    await tx
      .update(productFlavors)
      .set({ status: "out_of_stock" })
      .where(inArray(productFlavors.id, toSoftDelete))
  }

  for (let i = 0; i < flavors.length; i++) {
    const flavor = flavors[i]
    if (flavor.id && existingIds.has(flavor.id)) {
      await tx
        .update(productFlavors)
        .set({
          name: flavor.name,
          purchaseCost: String(flavor.purchaseCost),
          sellPrice: String(flavor.sellPrice),
          status: flavor.status ?? "active",
          sortOrder: flavor.sortOrder ?? i,
        })
        .where(eq(productFlavors.id, flavor.id))
    } else {
      await tx.insert(productFlavors).values({
        productId,
        name: flavor.name,
        purchaseCost: String(flavor.purchaseCost),
        sellPrice: String(flavor.sellPrice),
        status: flavor.status ?? "active",
        sortOrder: flavor.sortOrder ?? i,
      })
    }
  }

  return tx
    .select()
    .from(productFlavors)
    .where(eq(productFlavors.productId, productId))
    .orderBy(productFlavors.sortOrder, productFlavors.name)
}
