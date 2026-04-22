'use client'

import { useState } from 'react'
import { Button, Card, Checkbox, Col, Image, Input, Row, Spin, Space, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/shared/PageHeader'
import { useProducts } from '@/hooks/useProducts'
import { useTrackedProducts } from '@/hooks/useTrackedProducts'
import { ProductFormModal } from '@/components/products/ProductFormModal'
import { DeleteProductButton } from '@/components/products/DeleteProductButton'
import { formatVND } from '@/lib/utils/formatters'
import type { Product } from '@/types/product'

export default function ProductsPage() {
  const { products, isLoading, refresh } = useProducts()
  const { trackedIds, toggleProduct } = useTrackedProducts()
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')

  const q = search.trim().toLowerCase()
  const filteredProducts = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    : products

  const categories = Array.from(new Set(filteredProducts.map((p) => p.category)))

  const openCreate = () => { setEditProduct(null); setModalOpen(true) }
  const openEdit = (p: Product) => { setEditProduct(p); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditProduct(null) }

  return (
    <div>
      <PageHeader
        title="Sản phẩm"
        subtitle={'Theo dõi ' + trackedIds.length + '/' + products.length}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm sản phẩm
          </Button>
        }
      />

      <Input.Search
        placeholder="Tìm theo tên, danh mục, từ khóa (VD: xương, vitamin C, ...)"
        allowClear
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      <Spin spinning={isLoading}>
        {categories.map((cat) => (
          <Card key={cat} title={cat} className="mb-4">
            <Row gutter={[12, 12]}>
              {filteredProducts.filter((p) => p.category === cat).map((product) => (
                <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    size="small"
                    className={'cursor-pointer ' + (trackedIds.includes(product.id) ? 'border-blue-400 bg-blue-50' : '')}
                    onClick={() => toggleProduct(product.id)}
                    extra={
                      <Space onClick={(e) => e.stopPropagation()}>
                        {product.refUrl && (
                          <Tooltip title="Xem trang bán">
                            <a href={product.refUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                              <LinkOutlined className="text-blue-400" />
                            </a>
                          </Tooltip>
                        )}
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => openEdit(product)}
                        />
                        <DeleteProductButton
                          productId={product.id}
                          productName={product.name}
                          onSuccess={refresh}
                        />
                        <Checkbox
                          checked={trackedIds.includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                        />
                      </Space>
                    }
                  >
                    {product.images[0]?.url && (
                      <div className="mb-2" onClick={(e) => e.stopPropagation()}>
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          width={60}
                          height={60}
                          style={{ objectFit: 'cover', borderRadius: 4 }}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAAi0lEQVRoge3BMQEAAADCoPVP7WsIoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAMBuAABHgAAAABJRU5ErkJggg=="
                        />
                      </div>
                    )}
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.sku}</div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-red-500">Nhap: {formatVND(product.defaultPurchaseCost)}</span>
                      <span className="text-green-600">Ban: {formatVND(product.defaultSellPrice)}</span>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        ))}
      </Spin>

      <ProductFormModal
        open={modalOpen}
        product={editProduct}
        onClose={closeModal}
        onSuccess={() => { refresh(); closeModal() }}
      />
    </div>
  )
}
