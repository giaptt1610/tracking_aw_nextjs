import { Card } from 'antd'
import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import RecentOrdersServerComponent from '@/components/dashboard/RecentOrdersServerComponent'
import DashboardTimeFilter from '@/components/dashboard/DashboardTimeFilter'
import { getDateRange, todayDateStr, type FilterType } from '@/lib/utils/dateRange'

interface DashboardPageProps {
  searchParams: { filterType?: string; date?: string }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const filterType = (searchParams.filterType as FilterType | undefined) ?? 'month'
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const currentMonthStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
  const dateStr = searchParams.date ?? currentMonthStr
  const { from, to } = getDateRange(filterType, dateStr)

  return (
    <div>
      <PageHeader
        title="Tổng quan"
        extra={
          <Suspense>
            <DashboardTimeFilter />
          </Suspense>
        }
      />
      <DashboardStats fromDate={from} toDate={to} />
      <Card title="Đơn hàng gần đây" className="mt-4">
        <RecentOrdersServerComponent fromDate={from} toDate={to} />
      </Card>
    </div>
  )
}