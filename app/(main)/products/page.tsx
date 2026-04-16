'use client'
import { Card, Checkbox, Col, Row } from 'antd'
import { PageHeader } from '@/components/shared/PageHeader'
import { MOCK_PRODUCTS } from '@/lib/mock/products'
import { useTrackedProducts } from '@/hooks/useTrackedProducts'
import { formatVND } from '@/lib/utils/formatters'

export default function ProductsPage() {
  const { trackedIds, toggleProduct } = useTrackedProducts()
  const categories = Array.from(new Set(MOCK_PRODUCTS.map((p) => p.category)))

  return (
    <div>
      <PageHeader title="San pham" subtitle={'Theo doi ' + trackedIds.length + '/' + MOCK_PRODUCTS.length} />
      {categories.map((cat) => (
        <Card key={cat} title={cat} className="mb-4">
          <Row gutter={[12, 12]}>
            {MOCK_PRODUCTS.filter((p) => p.category === cat).map((product) => (
              <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                <Card size="small"
                  className={'cursor-pointer ' + (trackedIds.includes(product.id) ? 'border-blue-400 bg-blue-50' : '')}
                  onClick={() => toggleProduct(product.id)}
                  extra={<Checkbox checked={trackedIds.includes(product.id)} onChange={() => toggleProduct(product.id)} />}
                >
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
    </div>
  )
}