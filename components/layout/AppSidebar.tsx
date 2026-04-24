"use client"

import { usePathname, useRouter } from "next/navigation"
import { Menu } from "antd"
import {
  DashboardOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  ApiOutlined,
} from "@ant-design/icons"

const allMenuItems = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "Tổng quan" },
  { key: "/orders", icon: <UnorderedListOutlined />, label: "Đơn hàng" },
  { key: "/products", icon: <AppstoreOutlined />, label: "Sản phẩm" },
  { key: "/statistics", icon: <BarChartOutlined />, label: "Thống kê" },
  ...(process.env.NODE_ENV === "development"
    ? [{ key: "/api-test", icon: <ApiOutlined />, label: "API Test" }]
    : []),
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const selectedKey =
    allMenuItems.find((item) => pathname.startsWith(item.key))?.key ??
    "/dashboard"

  return (
    <div className="h-full flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-white/10">
        <span className="text-white font-bold text-lg">Tracking AW</span>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={allMenuItems}
        onClick={({ key }) => router.push(key)}
        className="flex-1 border-r-0"
      />
    </div>
  )
}
