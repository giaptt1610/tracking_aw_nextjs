'use client'

import { Button, Popconfirm, message } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { deleteProductAction } from '@/lib/actions/products'

interface DeleteProductButtonProps {
  productId: string
  productName: string
  onSuccess: () => void
}

export function DeleteProductButton({ productId, productName, onSuccess }: DeleteProductButtonProps) {
  const handleConfirm = async () => {
    const result = await deleteProductAction(productId)
    if (result.success) {
      message.success('Đã xóa sản phẩm')
      onSuccess()
    } else {
      message.error(result.error)
    }
  }

  return (
    <Popconfirm
      title="Xóa sản phẩm"
      description={`Xóa "${productName}"? Hành động này không thể hoàn tác.`}
      onConfirm={handleConfirm}
      okText="Xóa"
      cancelText="Hủy"
      okButtonProps={{ danger: true }}
    >
      <Button size="small" danger icon={<DeleteOutlined />} />
    </Popconfirm>
  )
}
