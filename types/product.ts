import type { ProductImage } from '@/lib/db/schema'

export type FlavorStatus = 'active' | 'out_of_stock'

export interface ProductFlavor {
  id: string
  productId: string
  name: string
  purchaseCost: number
  sellPrice: number
  status: FlavorStatus
  sortOrder: number
}

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  refUrl: string | null
  tags: string[]
  images: ProductImage[]
  flavors: ProductFlavor[]
  defaultPurchaseCost: number
  defaultSellPrice: number
  isTracked: boolean
}

export type { ProductImage }
