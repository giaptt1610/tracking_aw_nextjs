import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

vi.mock("@/lib/api/products", () => ({
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}))

const mockProduct = {
  id: "prod-uuid-1",
  name: "Áo thun",
  sku: "AT-001",
  category: "Quần áo",
  refUrl: null,
  tags: [],
  images: [],
  flavors: [],
  defaultPurchaseCost: 150000,
  defaultSellPrice: 250000,
  isTracked: false,
}

describe("createProductAction", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns success with product data on valid input", async () => {
    const { createProduct } = await import("@/lib/api/products")
    vi.mocked(createProduct).mockResolvedValueOnce(mockProduct)

    const { createProductAction } = await import("@/lib/actions/products")
    const result = await createProductAction({
      name: "Áo thun",
      sku: "AT-001",
      category: "Quần áo",
      defaultPurchaseCost: 150000,
      defaultSellPrice: 250000,
    })

    expect(result.success).toBe(true)
    expect((result as Extract<typeof result, { success: true }>).data).toEqual(
      mockProduct,
    )
  })

  it("calls revalidatePath /products after create", async () => {
    const { createProduct } = await import("@/lib/api/products")
    vi.mocked(createProduct).mockResolvedValueOnce(mockProduct)
    const { revalidatePath } = await import("next/cache")

    const { createProductAction } = await import("@/lib/actions/products")
    await createProductAction({
      name: "Áo thun",
      sku: "AT-001",
      category: "Quần áo",
      defaultPurchaseCost: 150000,
      defaultSellPrice: 250000,
    })

    expect(revalidatePath).toHaveBeenCalledWith("/products")
  })

  it("returns error on exception", async () => {
    const { createProduct } = await import("@/lib/api/products")
    vi.mocked(createProduct).mockRejectedValueOnce(new Error("DB error"))

    const { createProductAction } = await import("@/lib/actions/products")
    const result = await createProductAction({
      name: "Áo thun",
      sku: "AT-001",
      category: "Quần áo",
      defaultPurchaseCost: 150000,
      defaultSellPrice: 250000,
    })

    expect(result.success).toBe(false)
    expect((result as Extract<typeof result, { success: false }>).error).toBe(
      "DB error",
    )
  })
})

describe("updateProductAction", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns success with updated product", async () => {
    const { updateProduct } = await import("@/lib/api/products")
    const updated = { ...mockProduct, name: "Áo thun mới" }
    vi.mocked(updateProduct).mockResolvedValueOnce(updated)

    const { updateProductAction } = await import("@/lib/actions/products")
    const result = await updateProductAction("prod-uuid-1", {
      name: "Áo thun mới",
    })

    expect(result.success).toBe(true)
    expect(
      (result as Extract<typeof result, { success: true }>).data.name,
    ).toBe("Áo thun mới")
  })

  it("returns error when product not found", async () => {
    const { updateProduct } = await import("@/lib/api/products")
    vi.mocked(updateProduct).mockResolvedValueOnce(null)

    const { updateProductAction } = await import("@/lib/actions/products")
    const result = await updateProductAction("non-existent", { name: "X" })

    expect(result.success).toBe(false)
    expect(
      (result as Extract<typeof result, { success: false }>).error,
    ).toBeTruthy()
  })

  it("calls revalidatePath /products after update", async () => {
    const { updateProduct } = await import("@/lib/api/products")
    vi.mocked(updateProduct).mockResolvedValueOnce(mockProduct)
    const { revalidatePath } = await import("next/cache")

    const { updateProductAction } = await import("@/lib/actions/products")
    await updateProductAction("prod-uuid-1", { name: "X" })

    expect(revalidatePath).toHaveBeenCalledWith("/products")
  })
})

describe("deleteProductAction", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns success when product deleted", async () => {
    const { deleteProduct } = await import("@/lib/api/products")
    vi.mocked(deleteProduct).mockResolvedValueOnce({ success: true })

    const { deleteProductAction } = await import("@/lib/actions/products")
    const result = await deleteProductAction("prod-uuid-1")

    expect(result.success).toBe(true)
  })

  it("returns error when product is used in orders", async () => {
    const { deleteProduct } = await import("@/lib/api/products")
    vi.mocked(deleteProduct).mockResolvedValueOnce({
      success: false,
      error: "Sản phẩm đang được dùng trong đơn hàng, không thể xóa",
    })

    const { deleteProductAction } = await import("@/lib/actions/products")
    const result = await deleteProductAction("prod-uuid-1")

    expect(result.success).toBe(false)
    expect(
      (result as Extract<typeof result, { success: false }>).error,
    ).toContain("đơn hàng")
  })

  it("calls revalidatePath /products after delete", async () => {
    const { deleteProduct } = await import("@/lib/api/products")
    vi.mocked(deleteProduct).mockResolvedValueOnce({ success: true })
    const { revalidatePath } = await import("next/cache")

    const { deleteProductAction } = await import("@/lib/actions/products")
    await deleteProductAction("prod-uuid-1")

    expect(revalidatePath).toHaveBeenCalledWith("/products")
  })
})
