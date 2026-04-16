'use client'
import { Select, Space } from 'antd'
import { OrderStatus } from '@/types/order'
import { STATUS_LABEL } from './OrderStatusTag'

interface OrderFiltersProps { status?: OrderStatus; onStatusChange: (v?: OrderStatus) => void }

export function OrderFilters({ status, onStatusChange }: OrderFiltersProps) {
  return (
    <Space wrap>
      <Select placeholder="Loc trang thai" allowClear value={status}
        onChange={(v) => onStatusChange(v as OrderStatus | undefined)}
        style={{ width: 160 }}
        options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
      />
    </Space>
  )
}