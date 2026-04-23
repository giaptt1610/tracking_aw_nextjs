import { Tag } from "antd"
import { OrderStatus } from "@/types/order"

export const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "default",
  confirmed: "blue",
  shipping: "orange",
  delivered: "green",
  cancelled: "red",
  invalid: "volcano",
}
export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  invalid: "Không hợp lệ",
}

export function OrderStatusTag({ status }: { status: OrderStatus }) {
  return <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Tag>
}
