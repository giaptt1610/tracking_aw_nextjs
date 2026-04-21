import { Card } from 'antd'
import { PageHeader } from '@/components/shared/PageHeader'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { RecentOrdersTable } from '@/components/dashboard/RecentOrdersTable'
import { getOrderTotals, getOrders } from '@/lib/api/orders'
import RecentOrdersServerComponent from '@/components/dashboard/RecentOrdersServerComponent'

export default async function DashboardPage() {
  // const [totals, { orders: recentOrders }] = await Promise.all([
  //   getOrderTotals(),
  //   getOrders({ pageSize: 5 }),
  // ])

  return (
    <div>
      <PageHeader title="Tổng quan" />
      <DashboardStats />
      <Card title="Đơn hàng gần đây">
        {/* <RecentOrdersTable orders={recentOrders} /> */}
        <RecentOrdersServerComponent />
      </Card>
    </div>
  )
}