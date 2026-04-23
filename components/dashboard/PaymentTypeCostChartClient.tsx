'use client'

import { Empty } from 'antd'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { BRAND_COLORS } from '@/lib/theme/colors'
import { formatVND } from '@/lib/utils/formatters'
import type { PaymentTypeCostRow } from '@/lib/api/orders'

const SLICE_CONFIG: Record<string, { label: string; color: string }> = {
  visa: { label: 'Thẻ Visa (nợ)', color: BRAND_COLORS.error },
  cash: { label: 'Tiền mặt', color: BRAND_COLORS.success },
  unknown: { label: 'Khác', color: '#d9d9d9' },
}

interface Props {
  data: PaymentTypeCostRow[]
}

export default function PaymentTypeCostChartClient({ data }: Props) {
  const chartData = data
    .filter((r) => r.totalCost > 0)
    .map((r) => ({
      name: SLICE_CONFIG[r.paymentType]?.label ?? r.paymentType,
      value: r.totalCost,
      paymentType: r.paymentType,
      orderCount: r.orderCount,
    }))

  if (chartData.length === 0) {
    return <Empty description="Chưa có dữ liệu" style={{ padding: '40px 0' }} />
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={false}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.paymentType}
              fill={SLICE_CONFIG[entry.paymentType]?.color ?? '#d9d9d9'}
            />
          ))}
        </Pie>
        <Legend />
        <Tooltip
          formatter={(value, _name, props) => [
            formatVND(Number(value)),
            `${props.payload.name} (${props.payload.orderCount} đơn)`,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
