'use client'

import { Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useOrders } from '@/hooks/useOrders'
import { Order, OrderStatus } from '@/types/order'
import { formatVND, formatDate } from '@/lib/utils/formatters'

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'default', confirmed: 'blue', shipping: 'orange', delivered: 'green', cancelled: 'red',
}
const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Cho xu ly', confirmed: 'Da xac nhan', shipping: 'Dang giao', delivered: 'Da giao', cancelled: 'Da huy',
}

const columns: ColumnsType<Order> = [
  { title: 'Ma don', dataIndex: 'id', key: 'id', width: 120 },
  { title: 'Ngay tao', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => formatDate(v), width: 120 },
  { title: 'Trang thai', dataIndex: 'status', key: 'status', render: (v: OrderStatus) => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag>, width: 130 },
  { title: 'Doanh thu', dataIndex: 'totalSellRevenue', key: 'totalSellRevenue', render: (v: number) => formatVND(v), align: 'right' as const },
  { title: 'Loi nhuan', dataIndex: 'profit', key: 'profit', render: (v: number) => <span style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f' }}>{formatVND(v)}</span>, align: 'right' as const },
]

export function RecentOrdersTable() {
  const { orders } = useOrders({ pageSize: 5 })
  return <Table dataSource={orders} columns={columns} rowKey="id" pagination={false} size="small" />
}
