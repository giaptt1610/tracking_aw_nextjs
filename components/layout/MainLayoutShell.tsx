'use client'

import React from 'react'
import { Layout } from 'antd'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'

const { Sider, Header, Content } = Layout

export function MainLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <Layout className="min-h-screen">
      <Sider width={220} breakpoint="lg" collapsedWidth="0" style={{ background: "#001529" }}>
        <AppSidebar />
      </Sider>
      <Layout>
        <Header
          style={{ background: "#fff", padding: "0 24px", height: 56 }}
          className="sticky top-0 z-10 shadow-sm flex items-center"
        >
          <AppHeader />
        </Header>
        <Content className="m-6">{children}</Content>
      </Layout>
    </Layout>
  )
}