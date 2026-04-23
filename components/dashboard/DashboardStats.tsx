

import { Card, Col, Row, Statistic } from 'antd'
import { ShoppingCartOutlined, RiseOutlined, FallOutlined, FileTextOutlined } from '@ant-design/icons'
import { BRAND_COLORS, profitColor } from '@/lib/theme/colors'
import { Suspense } from 'react'
import { getOrderTotals } from '@/lib/api/orders'
import DashboardStatRow from './DashboardStatRow'


interface DashboardStatsProps {
  fromDate?: string
  toDate?: string
}

export async function DashboardStats({ fromDate, toDate }: DashboardStatsProps = {}) {

  const totals = await getOrderTotals({ from: fromDate, to: toDate })

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardStatRow totals={totals} />
    </Suspense>

  )
}
