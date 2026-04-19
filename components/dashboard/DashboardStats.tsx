'use client'

import { Card, Col, Row, Statistic } from 'antd'
import { ShoppingCartOutlined, RiseOutlined, FallOutlined, FileTextOutlined } from '@ant-design/icons'
import { BRAND_COLORS, profitColor } from '@/lib/theme/colors'

type Totals = {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  orderCount: number
}

export function DashboardStats({ totals }: { totals: Totals }) {
  return (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Tổng đơn"
            value={totals.orderCount}
            prefix={<FileTextOutlined />}
            styles={{ content: { color: BRAND_COLORS.primary } }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Doanh thu"
            value={totals.totalRevenue}
            suffix="VND"
            formatter={(v) => Number(v).toLocaleString('vi-VN')}
            prefix={<RiseOutlined />}
            styles={{ content: { color: BRAND_COLORS.success } }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Chi phí"
            value={totals.totalCost}
            suffix="VND"
            formatter={(v) => Number(v).toLocaleString('vi-VN')}
            prefix={<FallOutlined />}
            styles={{ content: { color: BRAND_COLORS.error } }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Lợi nhuận"
            value={totals.totalProfit}
            suffix="VND"
            formatter={(v) => Number(v).toLocaleString('vi-VN')}
            prefix={<ShoppingCartOutlined />}
            styles={{ content: { color: profitColor(totals.totalProfit) } }}
          />
        </Card>
      </Col>
    </Row>
  )
}
