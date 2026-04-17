'use client'

import { useEffect, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Table, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { createOrderAction } from '@/lib/actions/orders'
import type { Product } from '@/types/product'
import type { OrderStatus } from '@/types/order'

interface CreateOrderModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface OrderItemRow {
  key: string
  productId: string
  productName: string
  quantity: number
  purchaseCost: number
  sellPrice: number
}

const STATUS_OPTIONS: { label: string; value: OrderStatus }[] = [
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đã hủy', value: 'cancelled' },
]

export function CreateOrderModal({ open, onClose, onSuccess }: CreateOrderModalProps) {
  const [form] = Form.useForm()
  const [products, setProducts] = useState<Product[]>([])
  const [items, setItems] = useState<OrderItemRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetch('/api/products')
        .then((r) => r.json())
        .then((json) => { if (json.success) setProducts(json.data) })
    }
  }, [open])

  const handleReset = () => {
    form.resetFields()
    setItems([])
  }

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { key: String(Date.now()), productId: '', productName: '', quantity: 1, purchaseCost: 0, sellPrice: 0 },
    ])
  }

  const updateItem = (key: string, field: keyof OrderItemRow, value: unknown) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item
        if (field === 'productId') {
          const product = products.find((p) => p.id === value)
          return {
            ...item,
            productId: product?.id ?? '',
            productName: product?.name ?? '',
            purchaseCost: product?.defaultPurchaseCost ?? 0,
            sellPrice: product?.defaultSellPrice ?? 0,
          }
        }
        return { ...item, [field]: value }
      })
    )
  }

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key))
  }

  const handleOk = async () => {
    const values = await form.validateFields()
    if (items.length === 0) {
      message.warning('Thêm ít nhất 1 sản phẩm vào đơn hàng')
      return
    }
    if (items.some((it) => !it.productId || it.quantity < 1)) {
      message.warning('Kiểm tra lại thông tin sản phẩm trong đơn hàng')
      return
    }

    setLoading(true)
    const result = await createOrderAction({
      status: values.status,
      note: values.note || undefined,
      items: items.map(({ productId, productName, quantity, purchaseCost, sellPrice }) => ({
        productId, productName, quantity, purchaseCost, sellPrice,
      })),
    })
    setLoading(false)

    if (result.success) {
      message.success('Tạo đơn hàng thành công')
      handleReset()
      onSuccess()
      onClose()
    } else {
      message.error(result.error)
    }
  }

  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: unknown, row: OrderItemRow) => (
        <Select
          className="w-full"
          placeholder="Chọn sản phẩm"
          value={row.productId || undefined}
          onChange={(v) => updateItem(row.key, 'productId', v)}
          options={products.map((p) => ({ label: p.name, value: p.id }))}
          showSearch
          filterOption={(input, opt) =>
            (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      ),
    },
    {
      title: 'SL',
      key: 'quantity',
      width: 80,
      render: (_: unknown, row: OrderItemRow) => (
        <InputNumber
          min={1}
          value={row.quantity}
          onChange={(v) => updateItem(row.key, 'quantity', v ?? 1)}
          className="w-full"
        />
      ),
    },
    {
      title: 'Giá nhập',
      key: 'purchaseCost',
      width: 120,
      render: (_: unknown, row: OrderItemRow) => (
        <InputNumber
          min={0}
          value={row.purchaseCost}
          onChange={(v) => updateItem(row.key, 'purchaseCost', v ?? 0)}
          className="w-full"
        />
      ),
    },
    {
      title: 'Giá bán',
      key: 'sellPrice',
      width: 120,
      render: (_: unknown, row: OrderItemRow) => (
        <InputNumber
          min={0}
          value={row.sellPrice}
          onChange={(v) => updateItem(row.key, 'sellPrice', v ?? 0)}
          className="w-full"
        />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 40,
      render: (_: unknown, row: OrderItemRow) => (
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeItem(row.key)} />
      ),
    },
  ]

  return (
    <Modal
      open={open}
      title="Tạo đơn hàng"
      okText="Tạo"
      cancelText="Hủy"
      onOk={handleOk}
      onCancel={() => { handleReset(); onClose() }}
      confirmLoading={loading}
      width={700}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4" initialValues={{ status: 'pending' }}>
        <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
          <Select options={STATUS_OPTIONS} />
        </Form.Item>
        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} placeholder="Ghi chú (tùy chọn)" />
        </Form.Item>
      </Form>

      <div className="mb-2 font-medium">Sản phẩm trong đơn</div>
      <Table dataSource={items} columns={columns} rowKey="key" pagination={false} size="small" />
      <Button icon={<PlusOutlined />} onClick={addItem} className="mt-2" type="dashed" block>
        Thêm sản phẩm
      </Button>
    </Modal>
  )
}
