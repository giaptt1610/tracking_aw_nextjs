'use client'

import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { BRAND_COLORS } from '@/lib/theme/colors'

dayjs.locale('vi')

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: BRAND_COLORS.primary,
          borderRadius: 6,
        },
        components: {
          Layout: { siderBg: BRAND_COLORS.siderBg },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}
