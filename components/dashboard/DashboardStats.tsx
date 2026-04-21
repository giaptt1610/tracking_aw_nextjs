

import { Card, Col, Row, Statistic } from 'antd'
import { ShoppingCartOutlined, RiseOutlined, FallOutlined, FileTextOutlined } from '@ant-design/icons'
import { BRAND_COLORS, profitColor } from '@/lib/theme/colors'
import { Suspense } from 'react'
import { getOrderTotals } from '@/lib/api/orders'
import DashboardStatRow from './DashboardStatRow'


export async function DashboardStats() {
  console.time("DashboardStats getTotals");

  const totals = await getOrderTotals()
  console.timeEnd("DashboardStats getTotals");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardStatRow totals={totals} />
    </Suspense>

  )
}
