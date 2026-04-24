"use client"

import { useEffect, useState } from "react"
import { Descriptions, Form, Input, Modal, Select, Table, message } from "antd"
import type { ColumnsType } from "antd/es/table"
import { updateOrderAction } from "@/lib/actions/orders"
import type { Order, OrderItem, OrderStatus, PaymentType } from "@/types/order"
import { formatVND, formatDateTime } from "@/lib/utils/formatters"

interface OrderDetailModalProps {
  open: boolean
  order: Order | null
  onClose: () => void
  onSuccess: () => void
}

const STATUS_OPTIONS: { label: string; value: OrderStatus }[] = [
  { label: "Chờ xử lý", value: "pending" },
  { label: "Đã xác nhận", value: "confirmed" },
  { label: "Đang giao", value: "shipping" },
  { label: "Đã giao", value: "delivered" },
  { label: "Đã hủy", value: "cancelled" },
  { label: "Không hợp lệ", value: "invalid" },
]

const PAYMENT_TYPE_OPTIONS: { label: string; value: PaymentType }[] = [
  { label: "Tiền mặt", value: "cash" },
  { label: "Thẻ Visa", value: "visa" },
]

const itemColumns: ColumnsType<OrderItem> = [
  {
    title: "Sản phẩm",
    key: "product",
    render: (_: unknown, r: OrderItem) =>
      r.flavorName ? `${r.productName} — ${r.flavorName}` : r.productName,
  },
  {
    title: "SL",
    dataIndex: "quantity",
    key: "quantity",
    align: "center" as const,
    width: 55,
  },
  {
    title: "Giá nhập",
    dataIndex: "purchaseCost",
    key: "purchaseCost",
    render: (v: number) => formatVND(v),
    align: "right" as const,
    width: 110,
  },
  {
    title: "Giá bán",
    dataIndex: "sellPrice",
    key: "sellPrice",
    render: (v: number) => formatVND(v),
    align: "right" as const,
    width: 110,
  },
  {
    title: "Doanh thu",
    key: "revenue",
    render: (_: unknown, r: OrderItem) => formatVND(r.quantity * r.sellPrice),
    align: "right" as const,
    width: 110,
  },
  {
    title: "Lợi nhuận",
    key: "profit",
    render: (_: unknown, r: OrderItem) => {
      const profit = (r.sellPrice - r.purchaseCost) * r.quantity
      return (
        <span className={profit >= 0 ? "text-green-600" : "text-red-500"}>
          {formatVND(profit)}
        </span>
      )
    },
    align: "right" as const,
    width: 110,
  },
]

export function OrderDetailModal({
  open,
  order,
  onClose,
  onSuccess,
}: OrderDetailModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && order) {
      form.setFieldsValue({
        status: order.status,
        paymentType: order.paymentType ?? null,
        note: order.note ?? "",
      })
    }
  }, [open, order, form])

  const handleOk = async () => {
    if (!order) return
    const values = await form.validateFields()
    setLoading(true)
    try {
      const result = await updateOrderAction(order.id, {
        status: values.status,
        note: values.note || undefined,
        paymentType: values.paymentType ?? null,
      })
      if (result.success) {
        message.success("Cập nhật đơn hàng thành công")
        onSuccess()
        onClose()
      } else {
        message.error(result.error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      title={order ? `Chi tiết đơn hàng — ${order.id}` : "Chi tiết đơn hàng"}
      okText="Lưu"
      cancelText="Hủy"
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      destroyOnHidden
      width={780}
    >
      {order && (
        <div className="mt-3 space-y-5">
          <Descriptions size="small" column={2} bordered>
            <Descriptions.Item label="Ngày tạo">
              {formatDateTime(order.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Lợi nhuận">
              <span
                className={
                  order.profit >= 0
                    ? "font-medium text-green-600"
                    : "font-medium text-red-500"
                }
              >
                {formatVND(order.profit)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng giá nhập">
              {formatVND(order.totalPurchaseCost)}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng giá bán">
              {formatVND(order.totalSellRevenue)}
            </Descriptions.Item>
          </Descriptions>

          <Table
            dataSource={order.items}
            columns={itemColumns}
            rowKey={(r) => `${r.productId}-${r.flavorId ?? "none"}`}
            pagination={false}
            size="small"
          />

          <Form form={form} layout="vertical">
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true }]}
              >
                <Select options={STATUS_OPTIONS} />
              </Form.Item>
              <Form.Item name="paymentType" label="Hình thức thanh toán">
                <Select
                  allowClear
                  placeholder="Không chọn"
                  options={PAYMENT_TYPE_OPTIONS}
                />
              </Form.Item>
            </div>
            <Form.Item name="note" label="Ghi chú">
              <Input.TextArea rows={3} placeholder="Ghi chú (tùy chọn)" />
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  )
}
