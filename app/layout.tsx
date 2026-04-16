import type { Metadata } from 'next'
import './globals.css'
import AntdRegistry from './antd-registry'
import { AntdProvider } from '@/components/providers/AntdProvider'

export const metadata: Metadata = {
  title: 'Tracking AW - Thống kê đơn hàng',
  description: 'Hệ thống thống kê các đơn đặt hàng',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body id="__next">
        <AntdRegistry>
          <AntdProvider>
            {children}
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}
