import { describe, it, expect } from "vitest"
import {
  formatVND,
  formatNumber,
  formatDate,
  formatDateTime,
} from "@/lib/utils/formatters"

describe("formatVND", () => {
  it("formats a whole number as VND currency", () => {
    const result = formatVND(150000)
    expect(result).toContain("150")
    expect(result).toMatch(/₫|VND/i)
  })

  it("formats zero as VND currency", () => {
    const result = formatVND(0)
    expect(result).toContain("0")
  })

  it("formats large numbers with thousand separators", () => {
    const result = formatVND(1000000)
    expect(result).toContain("1")
    expect(result).toContain("000")
  })
})

describe("formatNumber", () => {
  it("formats zero", () => {
    const result = formatNumber(0)
    expect(result).toBe("0")
  })

  it("formats a positive integer in vi-VN locale", () => {
    const result = formatNumber(1000)
    expect(result).toContain("1")
    expect(result).toContain("000")
  })

  it("formats large number", () => {
    const result = formatNumber(1500000)
    expect(result).toContain("1")
    expect(result).toContain("500")
  })
})

describe("formatDate", () => {
  it("formats an ISO date string with day, month, year components", () => {
    const result = formatDate("2024-01-15")
    expect(result).toContain("15")
    expect(result).toContain("01")
    expect(result).toContain("2024")
  })

  it("formats end-of-year date correctly", () => {
    const result = formatDate("2024-12-31")
    expect(result).toContain("31")
    expect(result).toContain("12")
    expect(result).toContain("2024")
  })
})

describe("formatDateTime", () => {
  it("includes day, month, year in the output", () => {
    const result = formatDateTime("2024-03-20T14:30:00")
    expect(result).toContain("20")
    expect(result).toContain("03")
    expect(result).toContain("2024")
  })

  it("includes hour and minute in the output", () => {
    const result = formatDateTime("2024-03-20T14:30:00")
    expect(result).toContain("14")
    expect(result).toContain("30")
  })

  it("formats midnight correctly", () => {
    const result = formatDateTime("2024-06-01T00:00:00")
    expect(result).toContain("01")
    expect(result).toContain("06")
    expect(result).toContain("2024")
    expect(result).toContain("00")
  })
})
