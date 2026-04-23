import { describe, it, expect } from "vitest"
import { getOrderProductNames } from "@/lib/utils/orderHelpers"
import type { OrderItem } from "@/types/order"

const makeItem = (
  productName: string,
  flavorName: string | null = null,
): OrderItem => ({
  productId: "1",
  productName,
  flavorId: null,
  flavorName,
  quantity: 1,
  purchaseCost: 100,
  sellPrice: 150,
})

describe("getOrderProductNames", () => {
  it("returns product name for a single item without flavor", () => {
    const result = getOrderProductNames([makeItem("Cà phê sữa")])
    expect(result).toBe("Cà phê sữa")
  })

  it("appends flavor name in parentheses when present", () => {
    const result = getOrderProductNames([makeItem("Trà", "Đào")])
    expect(result).toBe("Trà (Đào)")
  })

  it("joins multiple items with comma", () => {
    const result = getOrderProductNames([
      makeItem("Cà phê sữa"),
      makeItem("Trà đen"),
    ])
    expect(result).toBe("Cà phê sữa, Trà đen")
  })

  it("handles multiple items with mixed flavors", () => {
    const result = getOrderProductNames([
      makeItem("Cà phê", "Sữa"),
      makeItem("Trà"),
    ])
    expect(result).toBe("Cà phê (Sữa), Trà")
  })

  it("returns empty string for empty items array", () => {
    const result = getOrderProductNames([])
    expect(result).toBe("")
  })
})
