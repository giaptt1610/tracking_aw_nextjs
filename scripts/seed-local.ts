/**
 * Seed database with mock data
 * Usage: pnpm db:seed
 */
import { config } from 'dotenv'
import { resolve } from 'path'

// Load env before any DB imports
config({ path: resolve(process.cwd(), '.env.local') })

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../lib/db/schema'
import { MOCK_PRODUCTS } from '../lib/mock/products'
import { generateMockOrders } from '../lib/mock/orders'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL chưa được set trong .env.local')
  process.exit(1)
}

async function seed() {
  const client = postgres(DATABASE_URL!, { prepare: false })
  const db = drizzle(client, { schema })

  console.log('\n Bắt đầu seed database...\n')

  // Clear existing data in FK order
  console.log('Xóa dữ liệu cũ...')
  await db.delete(schema.orderItems)
  await db.delete(schema.orders)
  await db.delete(schema.products)

  // Insert products — DB generates real UUIDs
  console.log(`Inserting ${MOCK_PRODUCTS.length} products...`)
  const insertedProducts = await db
    .insert(schema.products)
    .values(
      MOCK_PRODUCTS.map((p) => ({
        name: p.name,
        sku: p.sku,
        category: p.category,
        defaultPurchaseCost: String(p.defaultPurchaseCost),
        defaultSellPrice: String(p.defaultSellPrice),
      }))
    )
    .returning()

  // Build mock-id -> real UUID map (mock IDs are p1..p15)
  const idMap = new Map<string, string>()
  MOCK_PRODUCTS.forEach((mockP, i) => {
    idMap.set(mockP.id, insertedProducts[i].id)
  })

  // Generate and insert orders
  const mockOrders = generateMockOrders(50)
  console.log(`Inserting ${mockOrders.length} orders with items...`)

  let insertedOrders = 0
  for (const mockOrder of mockOrders) {
    const validItems = mockOrder.items.filter((it) => idMap.has(it.productId))
    if (validItems.length === 0) continue

    const [inserted] = await db
      .insert(schema.orders)
      .values({
        status: mockOrder.status,
        totalPurchaseCost: String(mockOrder.totalPurchaseCost),
        totalSellRevenue: String(mockOrder.totalSellRevenue),
        note: mockOrder.note ?? null,
        createdAt: new Date(mockOrder.createdAt),
      })
      .returning()

    await db.insert(schema.orderItems).values(
      validItems.map((it) => ({
        orderId: inserted.id,
        productId: idMap.get(it.productId)!,
        productName: it.productName,
        quantity: it.quantity,
        purchaseCost: String(it.purchaseCost),
        sellPrice: String(it.sellPrice),
      }))
    )

    insertedOrders++
  }

  console.log(`\nSeed hoan tat!`)
  console.log(`   - ${insertedProducts.length} products`)
  console.log(`   - ${insertedOrders} orders`)

  await client.end()
}

seed().catch((err) => {
  console.error('Seed that bai:', err)
  process.exit(1)
})
