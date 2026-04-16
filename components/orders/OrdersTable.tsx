'use client'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Order } from '@/types/order'
import { OrderStatusTag } from './OrderStatusTag'
import { formatVND, formatDate } from '@/lib/utils/formatters'
import { useRouter } from 'next/navigation'

const columns: ColumnsType<Order> = [
  { title: 'Ma don', dataIndex: 'id', key: 'id', width: 130 },
  { title: 'Ngay tao', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => formatDate(v), width: 120 },
  { title: 'San pham', key: 'items', render: (_: unknown, r: Order) => r.items.map((it) => it.productName).join(', ') },
  { title: 'Trang thai', dataIndex: 'status', key: 'status', render: (v: Order['status']) => <OrderStatusTag status={v} />, width: 130 },
  { title: 'Doanh thu', dataIndex: 'totalSellRevenue', key: 'revenue', render: (v: number) => formatVND(v), align: 'right' as const, width: 140 },
  { title: 'Loi nhuan', dataIndex: 'profit', key: 'profit', align: 'right' as const, width: 130,
    render: (v: number) => <span style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f' }}>{formatVND(v)}</span> },
]

interface OrdersTableProps {
  orders: Order[]; total: number; page: number; pageSize: number
  onPageChange: (page: number, pageSize: number) => void
}

export function OrdersTable({ orders, total, page, pageSize, onPageChange }: OrdersTableProps) {
  const router = useRouter()
  return (
    <Table dataSource={orders} columns={columns} rowKey="id"
      pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: (t) => 'Tong ' + t + ' don' }}
      onChange={(p) => onPageChange(p.current ?? 1, p.pageSize ?? pageSize)}
      onRow={(r) => ({ onClick: () => router.push('/orders/' + r.id) })}
      rowClassName="cursor-pointer" size="middle" />
  )
}