'use client'

import { useState } from 'react'
import { Button, Card } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/shared/PageHeader'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { OrderFilters } from '@/components/orders/OrderFilters'
import { CreateOrderModal } from '@/components/orders/CreateOrderModal'
import { useOrders } from '@/hooks/useOrders'
import { OrderStatus } from '@/types/order'

export default function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | undefined>()
  const [from, setFrom] = useState<string | undefined>()
  const [to, setTo] = useState<string | undefined>()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createOpen, setCreateOpen] = useState(false)
  const { orders, total, refresh } = useOrders({ status, from, to, page, pageSize })

  function handleDateFilterChange(f?: string, t?: string) {
    setFrom(f)
    setTo(t)
    setPage(1)
  }

  return (
    <div>
      <PageHeader
        title="Đơn hàng"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Tạo đơn hàng
          </Button>
        }
      />
      <Card>
        <div className="mb-4">
          <OrderFilters
            status={status}
            onStatusChange={(v) => { setStatus(v); setPage(1) }}
            onDateFilterChange={handleDateFilterChange}
          />
        </div>
        <OrdersTable
          orders={orders}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={(p, ps) => { setPage(p); setPageSize(ps) }}
          onRefresh={refresh}
        />
      </Card>

      <CreateOrderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => { refresh(); setCreateOpen(false) }}
      />
    </div>
  )
}
