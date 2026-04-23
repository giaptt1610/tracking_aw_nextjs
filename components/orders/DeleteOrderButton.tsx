"use client"

import { Button, Popconfirm, message } from "antd"
import { DeleteOutlined } from "@ant-design/icons"
import { deleteOrderAction } from "@/lib/actions/orders"

interface DeleteOrderButtonProps {
  orderId: string
  onSuccess: () => void
}

export function DeleteOrderButton({
  orderId,
  onSuccess,
}: DeleteOrderButtonProps) {
  const handleConfirm = async () => {
    const result = await deleteOrderAction(orderId)
    if (result.success) {
      message.success("Đã vô hiệu hóa đơn hàng")
      onSuccess()
    } else {
      message.error(result.error)
    }
  }

  return (
    <Popconfirm
      title="Vô hiệu hóa đơn hàng"
      description="Đơn hàng sẽ được đánh dấu Không hợp lệ và không tính vào thống kê."
      onConfirm={handleConfirm}
      okText="Xác nhận"
      cancelText="Hủy"
      okButtonProps={{ danger: true }}
    >
      <Button size="small" danger icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
