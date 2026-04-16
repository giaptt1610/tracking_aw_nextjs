'use client'

import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'

dayjs.locale('vi')

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
        components: {
          Layout: { siderBg: '#001529' },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}
