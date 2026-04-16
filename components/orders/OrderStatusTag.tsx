import { Tag } from 'antd'
import { OrderStatus } from '@/types/order'

export const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'default', confirmed: 'blue', shipping: 'orange', delivered: 'green', cancelled: 'red',
}
export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Cho xu ly', confirmed: 'Da xac nhan', shipping: 'Dang giao', delivered: 'Da giao', cancelled: 'Da huy',
}

export function OrderStatusTag({ status }: { status: OrderStatus }) {
  return <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Tag>
}