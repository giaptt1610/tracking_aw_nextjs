import type { ProductImage } from '@/lib/db/schema'

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  refUrl: string | null
  images: ProductImage[]
  defaultPurchaseCost: number
  defaultSellPrice: number
  isTracked: boolean
}

export type { ProductImage }
