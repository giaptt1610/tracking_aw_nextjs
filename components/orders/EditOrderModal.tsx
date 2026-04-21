"use client"

import { useEffect } from "react"
import { Form, Input, Modal, Select, message } from "antd"
import { updateOrderAction } from "@/lib/actions/orders"
import type { Order, OrderStatus } from "@/types/order"

interface EditOrderModalProps {
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
]

export function EditOrderModal({
  open,
  order,
  onClose,
  onSuccess,
}: EditOrderModalProps) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (open && order) {
      form.setFieldsValue({ status: order.status, note: order.note ?? "" })
    }
  }, [open, order, form])

  const handleOk = async () => {
    if (!order) return
    const values = await form.validateFields()
    const result = await updateOrderAction(order.id, {
      status: values.status,
      note: values.note || undefined,
    })

    if (result.success) {
      message.success("Cập nhật đơn hàng thành công")
      onSuccess()
      onClose()
    } else {
      message.error(result.error)
    }
  }

  return (
    <Modal
      open={open}
      title="Sửa đơn hàng"
      okText="Lưu"
      cancelText="Hủy"
      onOk={handleOk}
      onCancel={onClose}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true }]}
        >
          <Select options={STATUS_OPTIONS} />
        </Form.Item>
        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={3} placeholder="Ghi chú (tùy chọn)" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
