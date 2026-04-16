'use client'
import { Card, Col, Row, Statistic } from 'antd'
import { ShoppingCartOutlined, RiseOutlined, FallOutlined, FileTextOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/shared/PageHeader'
import { useStatistics } from '@/hooks/useStatistics'
import { RecentOrdersTable } from '@/components/dashboard/RecentOrdersTable'

export default function DashboardPage() {
  const { totals } = useStatistics()
  return (
    <div>
      <PageHeader title="Tong quan" />
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Tong don" value={totals.orderCount} prefix={<FileTextOutlined />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Doanh thu" value={totals.totalRevenue} suffix="VND" formatter={(v) => Number(v).toLocaleString('vi-VN')} prefix={<RiseOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Chi phi" value={totals.totalCost} suffix="VND" formatter={(v) => Number(v).toLocaleString('vi-VN')} prefix={<FallOutlined />} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Loi nhuan" value={totals.totalProfit} suffix="VND" formatter={(v) => Number(v).toLocaleString('vi-VN')} prefix={<ShoppingCartOutlined />} valueStyle={{ color: totals.totalProfit >= 0 ? '#52c41a' : '#ff4d4f' }} /></Card></Col>
      </Row>
      <Card title="Don hang gan day"><RecentOrdersTable /></Card>
    </div>
  )
}