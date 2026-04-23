import { Card } from 'antd'
import { getCostByPaymentType } from '@/lib/api/orders'
import PaymentTypeCostChartClient from './PaymentTypeCostChartClient'

interface Props {
  fromDate?: string
  toDate?: string
}

export default async function PaymentTypeCostChart({ fromDate, toDate }: Props) {
  const data = await getCostByPaymentType({ from: fromDate, to: toDate })

  return (
    <Card title="Chi phí theo hình thức thanh toán" className="mt-4">
      <PaymentTypeCostChartClient data={data} />
    </Card>
  )
}
