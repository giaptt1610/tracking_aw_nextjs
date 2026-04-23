"use client"
import { useState } from "react"
import { DatePicker, Select, Space } from "antd"
import type { Dayjs } from "dayjs"
import { OrderStatus } from "@/types/order"
import { STATUS_LABEL } from "./OrderStatusTag"

type DateMode = "date" | "month" | "year"

interface OrderFiltersProps {
  status?: OrderStatus
  onStatusChange: (v?: OrderStatus) => void
  onDateFilterChange: (from?: string, to?: string) => void
}

const DATE_MODE_OPTIONS: { value: DateMode; label: string }[] = [
  { value: "date", label: "Ngày" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
]

const DATE_PLACEHOLDER: Record<DateMode, string> = {
  date: "Chọn ngày",
  month: "Chọn tháng",
  year: "Chọn năm",
}

function computeRange(
  value: Dayjs,
  mode: DateMode,
): { from: string; to: string } {
  return {
    from: value.startOf(mode).toISOString(),
    to: value.endOf(mode).toISOString(),
  }
}

export function OrderFilters({
  status,
  onStatusChange,
  onDateFilterChange,
}: OrderFiltersProps) {
  const [dateMode, setDateMode] = useState<DateMode>("date")
  const [dateValue, setDateValue] = useState<Dayjs | null>(null)

  function handleDateChange(val: Dayjs | null) {
    setDateValue(val)
    if (!val) {
      onDateFilterChange(undefined, undefined)
      return
    }
    const { from, to } = computeRange(val, dateMode)
    onDateFilterChange(from, to)
  }

  function handleModeChange(mode: DateMode) {
    setDateMode(mode)
    setDateValue(null)
    onDateFilterChange(undefined, undefined)
  }

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
  ]

  return (
    <Space wrap>
      <Select
        value={status ?? "all"}
        onChange={(v) =>
          onStatusChange(v === "all" ? undefined : (v as OrderStatus))
        }
        style={{ width: 160 }}
        options={statusOptions}
      />
      <Select
        value={dateMode}
        onChange={handleModeChange}
        options={DATE_MODE_OPTIONS}
        style={{ width: 90 }}
      />
      <DatePicker
        picker={dateMode}
        value={dateValue}
        onChange={handleDateChange}
        allowClear
        placeholder={DATE_PLACEHOLDER[dateMode]}
      />
    </Space>
  )
}
