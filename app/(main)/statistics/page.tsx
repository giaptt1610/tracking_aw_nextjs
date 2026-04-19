'use client'
import { useState } from 'react'
import { Card, Col, DatePicker, Row, Statistic, Table } from 'antd'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { useStatistics } from '@/hooks/useStatistics'
import { formatVND } from '@/lib/utils/formatters'
import { ProductStat } from '@/types/statistics'

const { RangePicker } = DatePicker
const PIE_COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2']

export default function StatisticsPage() {
  const [dateRange, setDateRange] = useState<[string, string] | undefined>()
  const { productStats, periodStats, totals } = useStatistics(dateRange?.[0], dateRange?.[1])
  const top5 = productStats.slice(0, 5)

  return (
    <div>
      <PageHeader title="Thong ke"
        extra={
          <RangePicker onChange={(dates) => {
            if (dates?.[0] && dates?.[1]) setDateRange([dates[0].toISOString(), dates[1].toISOString()])
            else setDateRange(undefined)
          }} placeholder={['Tu ngay', 'Den ngay']} />
        }
      />
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}><Card><Statistic title="Doanh thu" value={totals.totalRevenue} suffix="VND" formatter={(v) => Number(v).toLocaleString('vi-VN')} styles={{ content: { color: '#52c41a' } }} /></Card></Col>
        <Col xs={24} sm={8}><Card><Statistic title="Chi phi" value={totals.totalCost} suffix="VND" formatter={(v) => Number(v).toLocaleString('vi-VN')} styles={{ content: { color: '#ff4d4f' } }} /></Card></Col>
        <Col xs={24} sm={8}><Card><Statistic title="Loi nhuan" value={totals.totalProfit} suffix="VND" formatter={(v) => Number(v).toLocaleString('vi-VN')} styles={{ content: { color: totals.totalProfit >= 0 ? '#1677ff' : '#ff4d4f' } }} /></Card></Col>
      </Row>
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card title="Doanh thu theo thang">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={periodStats}>
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(v: number) => (v / 1000000).toFixed(0) + 'M'} />
                <Tooltip formatter={(v) => [formatVND(Number(v ?? 0))]} />
                <Bar dataKey="revenue" name="Doanh thu" fill="#1677ff" />
                <Bar dataKey="profit" name="Loi nhuan" fill="#52c41a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Top 5 san pham">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={top5} dataKey="totalProfit" nameKey="productName" cx="50%" cy="50%" outerRadius={90} label={false}>
                  {top5.map((_: ProductStat, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip formatter={(v) => [formatVND(Number(v ?? 0))]} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      <Card title="Chi tiet san pham">
        <Table dataSource={productStats} rowKey="productId" size="middle" pagination={{ pageSize: 10 }} columns={[
          { title: 'San pham', dataIndex: 'productName', key: 'name' },
          { title: 'So don', dataIndex: 'orderCount', key: 'orders', align: 'center' as const, width: 80 },
          { title: 'SL', dataIndex: 'totalQuantity', key: 'qty', align: 'center' as const, width: 80 },
          { title: 'Doanh thu', dataIndex: 'totalSellRevenue', key: 'revenue', render: (v: number) => formatVND(v), align: 'right' as const, sorter: (a: ProductStat, b: ProductStat) => a.totalSellRevenue - b.totalSellRevenue },
          { title: 'Loi nhuan', dataIndex: 'totalProfit', key: 'profit', align: 'right' as const, defaultSortOrder: 'descend' as const,
            sorter: (a: ProductStat, b: ProductStat) => a.totalProfit - b.totalProfit,
            render: (v: number) => <span style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f' }}>{formatVND(v)}</span> },
        ]} />
      </Card>
    </div>
  )
}