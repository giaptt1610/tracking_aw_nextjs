'use client'

import { Button, Popconfirm, message } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { deleteOrderAction } from '@/lib/actions/orders'

interface DeleteOrderButtonProps {
  orderId: string
  onSuccess: () => void
}

export function DeleteOrderButton({ orderId, onSuccess }: DeleteOrderButtonProps) {
  const handleConfirm = async () => {
    const result = await deleteOrderAction(orderId)
    if (result.success) {
      message.success('Đã xóa đơn hàng')
      onSuccess()
    } else {
      message.error(result.error)
    }
  }

  return (
    <Popconfirm
      title="Xóa đơn hàng"
      description="Xóa đơn hàng này? Hành động này không thể hoàn tác."
      onConfirm={handleConfirm}
      okText="Xóa"
      cancelText="Hủy"
      okButtonProps={{ danger: true }}
    >
      <Button size="small" danger icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
