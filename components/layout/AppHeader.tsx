'use client'

import { Typography } from 'antd'
import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/orders': 'Đơn hàng',
  '/products': 'Sản phẩm',
  '/statistics': 'Thống kê',
}

export function AppHeader() {
  const pathname = usePathname()
  const title = Object.entries(titles).find(([key]) => pathname.startsWith(key))?.[1] ?? ''

  return (
    <div className="flex items-center gap-3">
      <Typography.Text strong className="text-base">{title}</Typography.Text>
    </div>
  )
}
