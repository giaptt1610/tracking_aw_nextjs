import { describe, it, expect } from "vitest"

describe("mapProductRow", () => {
  it("converts numeric strings to numbers", async () => {
    const { mapProductRow } = await import("@/lib/api/products")
    const row = {
      id: "prod-1",
      name: "Áo thun",
      sku: "AT-001",
      category: "Quần áo",
      refUrl: null,
      tags: [],
      defaultPurchaseCost: "150000.00",
      defaultSellPrice: "250000.00",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = mapProductRow(row)
    expect(result.id).toBe("prod-1")
    expect(result.name).toBe("Áo thun")
    expect(result.defaultPurchaseCost).toBe(150000)
    expect(result.defaultSellPrice).toBe(250000)
    expect(result.isTracked).toBe(false)
  })

  it("sets all fields correctly", async () => {
    const { mapProductRow } = await import("@/lib/api/products")
    const row = {
      id: "prod-2",
      name: "Giày Nike",
      sku: "GN-001",
      category: "Giày dép",
      refUrl: null,
      tags: [],
      defaultPurchaseCost: "500000.00",
      defaultSellPrice: "800000.00",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = mapProductRow(row)
    expect(result.sku).toBe("GN-001")
    expect(result.category).toBe("Giày dép")
  })
})
