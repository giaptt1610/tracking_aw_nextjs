'use client'

import { useState } from 'react'
import { Button, Card, Checkbox, Col, Image, Input, Row, Spin, Tooltip, Typography } from 'antd'
import { PlusOutlined, EditOutlined, LinkOutlined, PictureOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/shared/PageHeader'
import { useProducts } from '@/hooks/useProducts'
import { useTrackedProducts } from '@/hooks/useTrackedProducts'
import { ProductFormModal } from '@/components/products/ProductFormModal'
import { DeleteProductButton } from '@/components/products/DeleteProductButton'
import { formatVND } from '@/lib/utils/formatters'
import type { Product } from '@/types/product'

const { Text } = Typography

function ProductCover({ product }: { product: Product }) {
  const images = product.images.slice().sort((a, b) => a.sortOrder - b.sortOrder)
  const coverUrl = images[0]?.url

  if (!coverUrl) {
    return (
      <div className="flex items-center justify-center bg-gray-100" style={{ height: 160 }}>
        <PictureOutlined style={{ fontSize: 36, color: '#d9d9d9' }} />
      </div>
    )
  }

  return (
    <div style={{ height: 160, overflow: 'hidden', background: '#f5f5f5' }} onClick={(e) => e.stopPropagation()}>
      <Image
        src={coverUrl}
        alt={product.name}
        width="100%"
        height={160}
        style={{ objectFit: 'cover', display: 'block' }}
        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg=="
      />
    </div>
  )
}

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
              {filteredProducts.filter((p) => p.category === cat).map((product) => {
                const isTracked = trackedIds.includes(product.id)
                return (
                  <Col key={product.id} xs={12} sm={8} md={6} lg={4}>
                    <Card
                      size="small"
                      hoverable
                      className={'cursor-pointer transition-all ' + (isTracked ? 'border-blue-400' : '')}
                      style={isTracked ? { background: '#eff6ff' } : undefined}
                      cover={<ProductCover product={product} />}
                      onClick={() => toggleProduct(product.id)}
                      styles={{ body: { padding: '8px 10px' } }}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <Text strong className="text-xs leading-tight flex-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {product.name}
                        </Text>
                        <Checkbox
                          checked={isTracked}
                          onChange={() => toggleProduct(product.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5 flex-shrink-0"
                        />
                      </div>

                      <div className="text-xs text-gray-400 mb-1">{product.sku}</div>

                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-red-500">Nhập: {formatVND(product.defaultPurchaseCost)}</span>
                        <span className="text-green-600">Bán: {formatVND(product.defaultSellPrice)}</span>
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {product.refUrl && (
                          <Tooltip title="Xem trang bán">
                            <a href={product.refUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="small" icon={<LinkOutlined />} type="text" />
                            </a>
                          </Tooltip>
                        )}
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          type="text"
                          onClick={() => openEdit(product)}
                        />
                        <DeleteProductButton
                          productId={product.id}
                          productName={product.name}
                          onSuccess={refresh}
                        />
                      </div>
                    </Card>
                  </Col>
                )
              })}
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
