'use client'

import { useState } from 'react'
import { Card } from 'antd'
import { PageHeader } from '@/components/shared/PageHeader'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { OrderFilters } from '@/components/orders/OrderFilters'
import { useOrders } from '@/hooks/useOrders'
import { OrderStatus } from '@/types/order'

export default function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | undefined>()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { orders, total } = useOrders({ status, page, pageSize })

  return (
    <div>
      <PageHeader title="Don hang" />
      <Card>
        <div className="mb-4">
          <OrderFilters status={status} onStatusChange={(v) => { setStatus(v); setPage(1) }} />
        </div>
        <OrdersTable orders={orders} total={total} page={page} pageSize={pageSize}
          onPageChange={(p, ps) => { setPage(p); setPageSize(ps) }} />
      </Card>
    </div>
  )
}