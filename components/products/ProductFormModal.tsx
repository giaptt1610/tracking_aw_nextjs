'use client'

import { useEffect } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Space, Tag, message } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { createProductAction, updateProductAction } from '@/lib/actions/products'
import type { Product } from '@/types/product'

interface ProductFormModalProps {
  open: boolean
  product?: Product | null
  onClose: () => void
  onSuccess: () => void
}

interface FlavorFormValue {
  id?: string
  name: string
  purchaseCost: number
  sellPrice: number
  status: 'active' | 'out_of_stock'
}

interface FormValues {
  name: string
  sku: string
  category: string
  refUrl?: string
  tags: string[]
  images: string[]
  defaultPurchaseCost: number
  defaultSellPrice: number
  flavors: FlavorFormValue[]
}

const numberFormatter = (v: number | string | undefined) =>
  String(v ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')

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
              refUrl: product.refUrl ?? undefined,
              tags: product.tags,
              images: product.images.map((i) => i.url),
              defaultPurchaseCost: product.defaultPurchaseCost,
              defaultSellPrice: product.defaultSellPrice,
              flavors: product.flavors.map((f) => ({
                id: f.id,
                name: f.name,
                purchaseCost: f.purchaseCost,
                sellPrice: f.sellPrice,
                status: f.status,
              })),
            }
          : {
              name: '',
              sku: '',
              category: '',
              refUrl: undefined,
              tags: [],
              images: [],
              defaultPurchaseCost: undefined,
              defaultSellPrice: undefined,
              flavors: [],
            }
      )
    }
  }, [open, product, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    const payload = {
      ...values,
      refUrl: values.refUrl?.trim() || undefined,
      tags: values.tags ?? [],
      images: values.images ?? [],
      flavors: (values.flavors ?? []).map((f, i) => ({
        ...(f.id ? { id: f.id } : {}),
        name: f.name,
        purchaseCost: f.purchaseCost,
        sellPrice: f.sellPrice,
        status: f.status ?? 'active',
        sortOrder: i,
      })),
    }
    const result = isEdit
      ? await updateProductAction(product!.id, payload)
      : await createProductAction(payload)

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
      width={680}
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
        <Form.Item
          name="refUrl"
          label="Link sản phẩm"
          rules={[{ type: 'url', message: 'URL không hợp lệ' }]}
        >
          <Input placeholder="https://shopee.vn/..." />
        </Form.Item>
        <Form.Item
          name="tags"
          label="Từ khóa tìm kiếm"
          tooltip="Nhập từ khóa rồi nhấn Enter — công dụng, thành phần, nhóm bệnh, ..."
        >
          <Select
            mode="tags"
            placeholder="VD: xương, khớp, glucosamine, canxi"
            tokenSeparators={[',']}
          />
        </Form.Item>
        <Form.Item label="Ảnh sản phẩm">
          <Form.List name="images">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" className="mb-2 w-full">
                    <Form.Item
                      {...field}
                      noStyle
                      rules={[{ type: 'url', message: 'URL không hợp lệ' }]}
                    >
                      <Input placeholder="https://..." style={{ width: 360 }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} className="text-red-400" />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                  Thêm ảnh
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>
        <Form.Item
          name="defaultPurchaseCost"
          label="Giá nhập mặc định (VNĐ)"
          rules={[{ required: true, message: 'Nhập giá nhập' }]}
        >
          <InputNumber className="w-full" min={0} formatter={numberFormatter} />
        </Form.Item>
        <Form.Item
          name="defaultSellPrice"
          label="Giá bán mặc định (VNĐ)"
          rules={[{ required: true, message: 'Nhập giá bán' }]}
        >
          <InputNumber className="w-full" min={0} formatter={numberFormatter} />
        </Form.Item>

        <Form.Item
          label="Phiên bản / Hương vị"
          tooltip="Mỗi phiên bản có giá riêng. Khi tạo đơn hàng, người dùng chọn phiên bản và giá tự động điền (không được sửa thủ công)."
        >
          <Form.List name="flavors">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => {
                  const isExisting = !!form.getFieldValue(['flavors', field.name, 'id'])
                  return (
                    <div key={field.key} className="border rounded p-3 mb-2 bg-gray-50">
                      <Form.Item name={[field.name, 'id']} hidden noStyle>
                        <Input />
                      </Form.Item>
                      <Space align="start" wrap>
                        <Form.Item
                          name={[field.name, 'name']}
                          rules={[{ required: true, message: 'Nhập tên' }]}
                          noStyle
                        >
                          <Input placeholder="Tên phiên bản" style={{ width: 160 }} />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, 'purchaseCost']}
                          rules={[{ required: true, message: 'Nhập giá nhập' }]}
                          noStyle
                        >
                          <InputNumber
                            min={0}
                            placeholder="Giá nhập"
                            formatter={numberFormatter}
                            style={{ width: 130 }}
                          />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, 'sellPrice']}
                          rules={[{ required: true, message: 'Nhập giá bán' }]}
                          noStyle
                        >
                          <InputNumber
                            min={0}
                            placeholder="Giá bán"
                            formatter={numberFormatter}
                            style={{ width: 130 }}
                          />
                        </Form.Item>
                        <Form.Item name={[field.name, 'status']} noStyle initialValue="active">
                          <Select
                            style={{ width: 120 }}
                            options={[
                              { label: 'Còn hàng', value: 'active' },
                              { label: 'Hết hàng', value: 'out_of_stock' },
                            ]}
                          />
                        </Form.Item>
                        {isExisting ? (
                          <Tag color="blue" className="mt-1">Đã lưu</Tag>
                        ) : (
                          <MinusCircleOutlined
                            onClick={() => remove(field.name)}
                            className="text-red-400 mt-1"
                          />
                        )}
                      </Space>
                    </div>
                  )
                })}
                <Button
                  type="dashed"
                  onClick={() => add({ status: 'active' })}
                  icon={<PlusOutlined />}
                  block
                >
                  Thêm phiên bản
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Modal>
  )
}
