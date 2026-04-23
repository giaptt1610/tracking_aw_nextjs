'use client'
import { useState } from 'react'
import { Button, Space, Table } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { Order } from '@/types/order'
import { OrderStatusTag } from './OrderStatusTag'
import { EditOrderModal } from './EditOrderModal'
import { DeleteOrderButton } from './DeleteOrderButton'
import { formatVND, formatDate } from '@/lib/utils/formatters'

interface OrdersTableProps {
  orders: Order[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number, pageSize: number) => void
  onRefresh: () => void
}

export function OrdersTable({ orders, total, page, pageSize, onPageChange, onRefresh }: OrdersTableProps) {
  const [editOrder, setEditOrder] = useState<Order | null>(null)

  const columns: ColumnsType<Order> = [
    { title: 'Mã đơn', dataIndex: 'id', key: 'id', width: 130 },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => formatDate(v), width: 120 },
    {
      title: 'Sản phẩm',
      key: 'items',
      render: (_: unknown, r: Order) =>
        r.items
          .map((it) => (it.flavorName ? `${it.productName} — ${it.flavorName}` : it.productName))
          .join(', '),
    },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (v: Order['status']) => <OrderStatusTag status={v} />, width: 130 },
    { title: 'Doanh thu', dataIndex: 'totalSellRevenue', key: 'revenue', render: (v: number) => formatVND(v), align: 'right' as const, width: 140 },
    {
      title: 'Lợi nhuận', dataIndex: 'profit', key: 'profit', align: 'right' as const, width: 130,
      render: (v: number) => <span style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f' }}>{formatVND(v)}</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, r: Order) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button size="small" icon={<EditOutlined />} onClick={() => setEditOrder(r)} />
          <DeleteOrderButton orderId={r.id} onSuccess={onRefresh} />
        </Space>
      ),
    },
  ]

  return (
    <>
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: (t) => 'Tổng ' + t + ' đơn' }}
        onChange={(p) => onPageChange(p.current ?? 1, p.pageSize ?? pageSize)}
        rowClassName="cursor-pointer"
        size="middle"
      />
      <EditOrderModal
        open={!!editOrder}
        order={editOrder}
        onClose={() => setEditOrder(null)}
        onSuccess={() => { onRefresh(); setEditOrder(null) }}
      />
    </>
  )
}
