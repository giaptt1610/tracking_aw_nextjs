'use client'

import { Segmented, DatePicker } from 'antd'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import dayjs, { Dayjs } from 'dayjs'
import type { FilterType } from '@/lib/utils/dateRange'

const SEGMENT_OPTIONS = [
  { label: 'Ngày', value: 'day' },
  { label: 'Tháng', value: 'month' },
  { label: 'Năm', value: 'year' },
]

const PICKER_MAP: Record<FilterType, 'date' | 'month' | 'year'> = {
  day: 'date',
  month: 'month',
  year: 'year',
}

const FORMAT_MAP: Record<FilterType, string> = {
  day: 'DD/MM/YYYY',
  month: 'MM/YYYY',
  year: 'YYYY',
}

function todayStr(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function parseDateValue(type: FilterType, str: string): Dayjs {
  if (type === 'day') return dayjs(str, 'YYYY-MM-DD')
  if (type === 'month') return dayjs(str + '-01', 'YYYY-MM-DD')
  return dayjs(str + '-01-01', 'YYYY-MM-DD')
}

function formatDateStr(type: FilterType, date: Dayjs): string {
  if (type === 'day') return date.format('YYYY-MM-DD')
  if (type === 'month') return date.format('YYYY-MM')
  return date.format('YYYY')
}

export default function DashboardTimeFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filterType = (searchParams.get('filterType') as FilterType | null) ?? 'day'
  const dateStr = searchParams.get('date') ?? todayStr()

  function navigate(type: FilterType, date: Dayjs | null) {
    if (!date) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('filterType', type)
    params.set('date', formatDateStr(type, date))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      <Segmented
        options={SEGMENT_OPTIONS}
        value={filterType}
        onChange={(value) => navigate(value as FilterType, dayjs())}
      />
      <DatePicker
        picker={PICKER_MAP[filterType]}
        value={parseDateValue(filterType, dateStr)}
        format={FORMAT_MAP[filterType]}
        onChange={(date) => navigate(filterType, date)}
        allowClear={false}
      />
    </div>
  )
}
