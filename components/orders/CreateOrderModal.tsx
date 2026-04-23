"use client"

import { useEffect, useState } from "react"
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  TimePicker,
  Tooltip,
  message,
} from "antd"
import dayjs from "dayjs"
import {
  PlusOutlined,
  DeleteOutlined,
  WarningOutlined,
} from "@ant-design/icons"
import { createOrderAction } from "@/lib/actions/orders"
import type { Product, ProductFlavor } from "@/types/product"
import type { OrderStatus, PaymentType } from "@/types/order"

interface CreateOrderModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface OrderItemRow {
  key: string
  productId: string
  productName: string
  flavorId: string | null
  flavorName: string | null
  quantity: number
  purchaseCost: number
  sellPrice: number
}

const PAYMENT_TYPE_OPTIONS: { label: string; value: PaymentType }[] = [
  { label: "Tiền mặt", value: "cash" },
  { label: "Thẻ Visa", value: "visa" },
]

const STATUS_OPTIONS: { label: string; value: OrderStatus }[] = [
  { label: "Chờ xử lý", value: "pending" },
  { label: "Đã xác nhận", value: "confirmed" },
  { label: "Đang giao", value: "shipping" },
  { label: "Đã giao", value: "delivered" },
  { label: "Đã hủy", value: "cancelled" },
]

export function CreateOrderModal({
  open,
  onClose,
  onSuccess,
}: CreateOrderModalProps) {
  const [form] = Form.useForm()
  const [products, setProducts] = useState<Product[]>([])
  const [items, setItems] = useState<OrderItemRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetch("/api/products")
        .then((r) => r.json())
        .then((json) => {
          if (json.success) setProducts(json.data)
        })
    }
  }, [open])

  const handleReset = () => {
    form.resetFields()
    setItems([])
  }

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        key: String(Date.now()),
        productId: "",
        productName: "",
        flavorId: null,
        flavorName: null,
        quantity: 1,
        purchaseCost: 0,
        sellPrice: 0,
      },
    ])
  }

  const updateItem = (key: string, patch: Partial<OrderItemRow>) => {
    setItems((prev) =>
      prev.map((item) => (item.key !== key ? item : { ...item, ...patch })),
    )
  }

  const handleProductChange = (key: string, productId: string) => {
    const product = products.find((p) => p.id === productId)
    updateItem(key, {
      productId: product?.id ?? "",
      productName: product?.name ?? "",
      flavorId: null,
      flavorName: null,
      purchaseCost: product?.defaultPurchaseCost ?? 0,
      sellPrice: product?.defaultSellPrice ?? 0,
    })
  }

  const handleFlavorChange = (
    key: string,
    flavorId: string,
    flavors: ProductFlavor[],
  ) => {
    const flavor = flavors.find((f) => f.id === flavorId)
    if (!flavor) return
    updateItem(key, {
      flavorId: flavor.id,
      flavorName: flavor.name,
      purchaseCost: flavor.purchaseCost,
      sellPrice: flavor.sellPrice,
    })
  }

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key))
  }

  const handleOk = async () => {
    const values = await form.validateFields()
    if (items.length === 0) {
      message.warning("Thêm ít nhất 1 sản phẩm vào đơn hàng")
      return
    }
    if (items.some((it) => !it.productId || it.quantity < 1)) {
      message.warning("Kiểm tra lại thông tin sản phẩm trong đơn hàng")
      return
    }
    const missingFlavor = items.find((it) => {
      const product = products.find((p) => p.id === it.productId)
      return product && product.flavors.length > 0 && !it.flavorId
    })
    if (missingFlavor) {
      message.warning(
        "Vui lòng chọn phiên bản cho tất cả sản phẩm có phiên bản",
      )
      return
    }

    setLoading(true)
    const result = await createOrderAction({
      status: values.status,
      note: values.note || undefined,
      paymentType: values.paymentType ?? null,
      createdAt: values.createdAt
        .hour((values.createdAtTime ?? dayjs()).hour())
        .minute((values.createdAtTime ?? dayjs()).minute())
        .second(0)
        .millisecond(0)
        .toISOString(),
      items: items.map(
        ({
          productId,
          productName,
          flavorId,
          quantity,
          purchaseCost,
          sellPrice,
        }) => ({
          productId,
          productName,
          flavorId: flavorId ?? null,
          quantity,
          purchaseCost,
          sellPrice,
        }),
      ),
    })
    setLoading(false)

    if (result.success) {
      message.success("Tạo đơn hàng thành công")
      handleReset()
      onSuccess()
      onClose()
    } else {
      message.error(result.error)
    }
  }

  const columns = [
    {
      title: "Sản phẩm",
      key: "product",
      width: 190,
      render: (_: unknown, row: OrderItemRow) => (
        <Select
          className="w-full"
          placeholder="Chọn sản phẩm"
          value={row.productId || undefined}
          onChange={(v) => handleProductChange(row.key, v)}
          options={products.map((p) => ({ label: p.name, value: p.id }))}
          showSearch
          filterOption={(input, opt) =>
            (opt?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          labelRender={({ label }) => (
            <span className="whitespace-normal break-words leading-tight block py-0.5">
              {label}
            </span>
          )}
          optionRender={(option) => (
            <span className="whitespace-normal break-words">
              {option.label}
            </span>
          )}
        />
      ),
    },
    {
      title: "Phiên bản",
      key: "flavor",
      width: 155,
      render: (_: unknown, row: OrderItemRow) => {
        const product = products.find((p) => p.id === row.productId)
        if (!product || product.flavors.length === 0) {
          return <span className="text-gray-400 text-sm pl-1">—</span>
        }
        return (
          <Select
            className="w-full"
            placeholder="Chọn phiên bản"
            value={row.flavorId || undefined}
            onChange={(v) => handleFlavorChange(row.key, v, product.flavors)}
            options={product.flavors.map((f) => ({
              label:
                f.status === "out_of_stock" ? (
                  <Tooltip title="Phiên bản này hiện không còn hàng">
                    <span className="text-gray-400">
                      <WarningOutlined className="mr-1 text-orange-400" />
                      {f.name}
                    </span>
                  </Tooltip>
                ) : (
                  f.name
                ),
              value: f.id,
              disabled: f.status === "out_of_stock",
            }))}
          />
        )
      },
    },
    {
      title: "SL",
      key: "quantity",
      width: 70,
      render: (_: unknown, row: OrderItemRow) => (
        <InputNumber
          min={1}
          value={row.quantity}
          onChange={(v) => updateItem(row.key, { quantity: v ?? 1 })}
          className="w-full"
        />
      ),
    },
    {
      title: "Giá nhập",
      key: "purchaseCost",
      width: 110,
      render: (_: unknown, row: OrderItemRow) => {
        const product = products.find((p) => p.id === row.productId)
        const lockedByFlavor =
          !!product && product.flavors.length > 0 && !!row.flavorId
        return (
          <InputNumber
            min={0}
            value={row.purchaseCost}
            onChange={(v) => updateItem(row.key, { purchaseCost: v ?? 0 })}
            className="w-full"
            disabled={lockedByFlavor}
          />
        )
      },
    },
    {
      title: "Giá bán",
      key: "sellPrice",
      width: 110,
      render: (_: unknown, row: OrderItemRow) => {
        const product = products.find((p) => p.id === row.productId)
        const lockedByFlavor =
          !!product && product.flavors.length > 0 && !!row.flavorId
        return (
          <InputNumber
            min={0}
            value={row.sellPrice}
            onChange={(v) => updateItem(row.key, { sellPrice: v ?? 0 })}
            className="w-full"
            disabled={lockedByFlavor}
          />
        )
      },
    },
    {
      title: "",
      key: "action",
      width: 40,
      render: (_: unknown, row: OrderItemRow) => (
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(row.key)}
        />
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
      onCancel={() => {
        handleReset()
        onClose()
      }}
      confirmLoading={loading}
      width={840}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        initialValues={{
          status: "pending",
          paymentType: null,
          createdAt: dayjs().startOf("day"),
          createdAtTime: dayjs(),
        }}
      >
        <div className="flex gap-4">
          <Form.Item
            name="createdAt"
            label="Ngày đặt hàng"
            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
            className="flex-1"
          >
            <DatePicker
              format="DD/MM/YYYY"
              className="w-full"
              allowClear={false}
              disabledDate={(d) => d.isAfter(dayjs(), "day")}
            />
          </Form.Item>
          <Form.Item
            name="createdAtTime"
            label="Giờ đặt hàng"
            rules={[{ required: true, message: "Vui lòng chọn giờ" }]}
            className="flex-1"
          >
            <TimePicker format="HH:mm" className="w-full" allowClear={false} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
            className="flex-1"
          >
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </div>
        <Form.Item name="paymentType" label="Hình thức thanh toán">
          <Select
            allowClear
            placeholder="Không chọn"
            options={PAYMENT_TYPE_OPTIONS}
          />
        </Form.Item>
        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} placeholder="Ghi chú (tùy chọn)" />
        </Form.Item>
      </Form>

      <div className="mb-2 font-medium">Sản phẩm trong đơn</div>
      <Table
        dataSource={items}
        columns={columns}
        rowKey="key"
        pagination={false}
        size="small"
      />
      <Button
        icon={<PlusOutlined />}
        onClick={addItem}
        className="mt-2"
        type="dashed"
        block
      >
        Thêm sản phẩm
      </Button>
    </Modal>
  )
}
