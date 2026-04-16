import { useMemo, useState } from 'react'
import { MOCK_PRODUCTS } from '@/lib/mock/products'
import { Product } from '@/types/product'

interface UseProductsReturn {
  products: Product[]
  isLoading: boolean
  error: string | null
}

export function useProducts(onlyTracked = false): UseProductsReturn {
  const products = useMemo(
    () => (onlyTracked ? MOCK_PRODUCTS.filter((p) => p.isTracked) : MOCK_PRODUCTS),
    [onlyTracked]
  )
  return { products, isLoading: false, error: null }
}
