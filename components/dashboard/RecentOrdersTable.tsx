"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { Order, OrderItem, OrderStatus } from "@/types/order"
import { formatVND, formatDateTime } from "@/lib/utils/formatters"
import { getOrderProductNames } from "@/lib/utils/orderHelpers"
import { STATUS_COLOR, STATUS_LABEL } from "@/components/orders/OrderStatusTag"
import { OrderDetailModal } from "@/components/orders/OrderDetailModal"

const columns: ColumnsType<Order> = [
  { title: "Mã đơn", dataIndex: "id", key: "id", width: 120 },
  {
    title: "Ngày tạo",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (v: string) => formatDateTime(v),
    width: 160,
  },
  {
    title: "Tên sản phẩm",
    dataIndex: "items",
    key: "productNames",
    render: (items: OrderItem[]) => getOrderProductNames(items),
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (v: OrderStatus) => (
      <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag>
    ),
    width: 130,
  },
  {
    title: "Giá nhập",
    dataIndex: "totalPurchaseCost",
    key: "totalPurchaseCost",
    render: (v: number) => formatVND(v),
    align: "right" as const,
  },
  {
    title: "Giá bán lẻ",
    dataIndex: "totalSellRevenue",
    key: "totalSellRevenue",
    render: (v: number) => formatVND(v),
    align: "right" as const,
  },
]

export function RecentOrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  return (
    <>
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
        onRow={(r) => ({ onClick: () => setSelectedOrder(r) })}
        rowClassName="cursor-pointer"
      />
      <OrderDetailModal
        open={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onSuccess={() => {
          router.refresh()
          setSelectedOrder(null)
        }}
      />
    </>
  )
}
