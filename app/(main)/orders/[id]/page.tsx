import { getOrderById } from '@/lib/api/orders'
import { Card, Descriptions, Table } from 'antd'
import { PageHeader } from '@/components/shared/PageHeader'
import { OrderStatusTag } from '@/components/orders/OrderStatusTag'
import { formatVND, formatDate } from '@/lib/utils/formatters'
import { notFound } from 'next/navigation'
import { OrderItem } from '@/types/order'
import { profitColor } from '@/lib/theme/colors'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrderById(params.id)
  if (!order) notFound()

  return (
    <div>
      <PageHeader title={'Don hang ' + order.id} />
      <Card className="mb-4">
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Ma don">{order.id}</Descriptions.Item>
          <Descriptions.Item label="Ngay tao">{formatDate(order.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="Trang thai"><OrderStatusTag status={order.status} /></Descriptions.Item>
          <Descriptions.Item label="Loi nhuan">
            <span style={{ color: profitColor(order.profit) }}>{formatVND(order.profit)}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Doanh thu">{formatVND(order.totalSellRevenue)}</Descriptions.Item>
          <Descriptions.Item label="Chi phi">{formatVND(order.totalPurchaseCost)}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="San pham trong don">
        <Table dataSource={order.items} rowKey="productId" pagination={false} columns={[
          { title: 'San pham', dataIndex: 'productName', key: 'name' },
          { title: 'SL', dataIndex: 'quantity', key: 'qty', width: 80, align: 'center' as const },
          { title: 'Gia nhap', dataIndex: 'purchaseCost', key: 'cost', render: (v: number) => formatVND(v), align: 'right' as const },
          { title: 'Gia ban', dataIndex: 'sellPrice', key: 'sell', render: (v: number) => formatVND(v), align: 'right' as const },
          { title: 'Loi nhuan', key: 'profit', align: 'right' as const,
            render: (_: unknown, r: OrderItem) => { const p = (r.sellPrice - r.purchaseCost) * r.quantity; return <span style={{ color: profitColor(p) }}>{formatVND(p)}</span> } },
        ]} />
      </Card>
    </div>
  )
}