"use client"
import { useState } from "react"
import { Space, Table } from "antd"
import type { ColumnsType } from "antd/es/table"
import { Order, PaymentType } from "@/types/order"
import { OrderStatusTag } from "./OrderStatusTag"
import { OrderDetailModal } from "./OrderDetailModal"
import { DeleteOrderButton } from "./DeleteOrderButton"
import { formatVND, formatDateTime } from "@/lib/utils/formatters"

interface OrdersTableProps {
  orders: Order[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number, pageSize: number) => void
  onRefresh: () => void
}

export function OrdersTable({
  orders,
  total,
  page,
  pageSize,
  onPageChange,
  onRefresh,
}: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const columns: ColumnsType<Order> = [
    { title: "Mã đơn", dataIndex: "id", key: "id", width: 130 },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => formatDateTime(v),
      width: 160,
    },
    {
      title: "Sản phẩm",
      key: "items",
      render: (_: unknown, r: Order) =>
        r.items
          .map((it) =>
            it.flavorName
              ? `${it.productName} — ${it.flavorName}`
              : it.productName,
          )
          .join(", "),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentType",
      key: "paymentType",
      width: 110,
      render: (v: PaymentType | null | undefined) => {
        if (v === "visa") return "Thẻ Visa"
        if (v === "cash") return "Tiền mặt"
        return <span className="text-gray-400">—</span>
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v: Order["status"]) => <OrderStatusTag status={v} />,
      width: 130,
    },
    {
      title: "Giá nhập",
      dataIndex: "totalPurchaseCost",
      key: "totalPurchaseCost",
      render: (v: number) => formatVND(v),
      align: "right" as const,
      width: 130,
    },
    {
      title: "Giá bán",
      dataIndex: "totalSellRevenue",
      key: "totalSellRevenue",
      render: (v: number) => formatVND(v),
      align: "right" as const,
      width: 130,
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: (_: unknown, r: Order) => (
        <Space onClick={(e) => e.stopPropagation()}>
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
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => "Tổng " + t + " đơn",
        }}
        onChange={(p) => onPageChange(p.current ?? 1, p.pageSize ?? pageSize)}
        onRow={(r) => ({ onClick: () => setSelectedOrder(r) })}
        rowClassName="cursor-pointer"
        size="middle"
      />
      <OrderDetailModal
        open={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onSuccess={() => {
          onRefresh()
          setSelectedOrder(null)
        }}
      />
    </>
  )
}
