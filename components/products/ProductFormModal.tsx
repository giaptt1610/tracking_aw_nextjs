'use client'

import { useEffect } from 'react'
import { Form, Input, InputNumber, Modal, message } from 'antd'
import { createProductAction, updateProductAction } from '@/lib/actions/products'
import type { Product } from '@/types/product'

interface ProductFormModalProps {
  open: boolean
  product?: Product | null
  onClose: () => void
  onSuccess: () => void
}

interface FormValues {
  name: string
  sku: string
  category: string
  defaultPurchaseCost: number
  defaultSellPrice: number
}

export function ProductFormModal({ open, product, onClose, onSuccess }: ProductFormModalProps) {
  const [form] = Form.useForm<FormValues>()
  const isEdit = !!product

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        product
          ? {
              name: product.name,
              sku: product.sku,
              category: product.category,
              defaultPurchaseCost: product.defaultPurchaseCost,
              defaultSellPrice: product.defaultSellPrice,
            }
          : { name: '', sku: '', category: '', defaultPurchaseCost: undefined, defaultSellPrice: undefined }
      )
    }
  }, [open, product, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    const result = isEdit
      ? await updateProductAction(product!.id, values)
      : await createProductAction(values)

    if (result.success) {
      message.success(isEdit ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công')
      onSuccess()
      onClose()
    } else {
      message.error(result.error)
    }
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
      okText={isEdit ? 'Lưu' : 'Thêm'}
      cancelText="Hủy"
      onOk={handleOk}
      onCancel={onClose}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}>
          <Input placeholder="VD: Áo thun basic" />
        </Form.Item>
        <Form.Item name="sku" label="SKU" rules={[{ required: true, message: 'Nhập SKU' }]}>
          <Input placeholder="VD: AT-001" />
        </Form.Item>
        <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Nhập danh mục' }]}>
          <Input placeholder="VD: Quần áo" />
        </Form.Item>
        <Form.Item name="defaultPurchaseCost" label="Giá nhập (VNĐ)" rules={[{ required: true, message: 'Nhập giá nhập' }]}>
          <InputNumber className="w-full" min={0} formatter={(v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
        </Form.Item>
        <Form.Item name="defaultSellPrice" label="Giá bán (VNĐ)" rules={[{ required: true, message: 'Nhập giá bán' }]}>
          <InputNumber className="w-full" min={0} formatter={(v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
