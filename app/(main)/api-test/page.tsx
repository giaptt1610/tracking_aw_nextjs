'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  Collapse,
  DatePicker,
  Input,
  InputNumber,
  Select,
  Spin,
  Tag,
  Typography,
  Tabs,
} from 'antd'
import { SendOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Text, Title } = Typography

type ParamType = 'string' | 'number' | 'date' | 'select'

type ParamDef = {
  name: string
  type: ParamType
  options?: string[]
  placeholder?: string
  required?: boolean
  inPath?: boolean
}

type EndpointDef = {
  method: 'GET'
  path: string
  description: string
  params: ParamDef[]
}

type EndpointGroup = {
  tab: string
  endpoints: EndpointDef[]
}

const ENDPOINT_GROUPS: EndpointGroup[] = [
  {
    tab: 'Products',
    endpoints: [
      {
        method: 'GET',
        path: '/api/products',
        description: 'Lấy danh sách tất cả sản phẩm',
        params: [],
      },
    ],
  },
  {
    tab: 'Orders',
    endpoints: [
      {
        method: 'GET',
        path: '/api/orders',
        description: 'Lấy danh sách đơn hàng (có filter và phân trang)',
        params: [
          {
            name: 'status',
            type: 'select',
            options: ['pending', 'completed', 'cancelled'],
            placeholder: 'Tất cả',
          },
          { name: 'from', type: 'date', placeholder: 'Từ ngày' },
          { name: 'to', type: 'date', placeholder: 'Đến ngày' },
          { name: 'page', type: 'number', placeholder: '1' },
          { name: 'pageSize', type: 'number', placeholder: '10' },
        ],
      },
      {
        method: 'GET',
        path: '/api/orders/{id}',
        description: 'Lấy chi tiết một đơn hàng theo ID',
        params: [
          {
            name: 'id',
            type: 'string',
            required: true,
            inPath: true,
            placeholder: 'UUID của đơn hàng',
          },
        ],
      },
    ],
  },
  {
    tab: 'Statistics',
    endpoints: [
      {
        method: 'GET',
        path: '/api/statistics',
        description: 'Thống kê tổng hợp doanh thu, chi phí, lợi nhuận',
        params: [
          { name: 'fromDate', type: 'date', placeholder: 'Từ ngày' },
          { name: 'toDate', type: 'date', placeholder: 'Đến ngày' },
        ],
      },
    ],
  },
]

function buildUrl(path: string, params: ParamDef[], values: Record<string, string>): string {
  let url = path
  const query = new URLSearchParams()

  for (const param of params) {
    const val = values[param.name]
    if (!val) continue
    if (param.inPath) {
      url = url.replace(`{${param.name}}`, encodeURIComponent(val))
    } else {
      query.set(param.name, val)
    }
  }

  const qs = query.toString()
  return qs ? `${url}?${qs}` : url
}

function ParamInput({
  param,
  value,
  onChange,
}: {
  param: ParamDef
  value: string
  onChange: (val: string) => void
}) {
  if (param.type === 'select') {
    return (
      <Select
        allowClear
        placeholder={param.placeholder ?? param.name}
        value={value || undefined}
        onChange={(v) => onChange(v ?? '')}
        style={{ minWidth: 160 }}
        options={param.options?.map((o) => ({ label: o, value: o }))}
      />
    )
  }
  if (param.type === 'date') {
    return (
      <DatePicker
        placeholder={param.placeholder ?? param.name}
        value={value ? dayjs(value) : null}
        onChange={(d) => onChange(d ? d.format('YYYY-MM-DD') : '')}
        style={{ minWidth: 160 }}
      />
    )
  }
  if (param.type === 'number') {
    return (
      <InputNumber
        placeholder={param.placeholder ?? param.name}
        value={value ? Number(value) : undefined}
        onChange={(v) => onChange(v != null ? String(v) : '')}
        style={{ minWidth: 100 }}
        min={1}
      />
    )
  }
  return (
    <Input
      placeholder={param.placeholder ?? param.name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ minWidth: 280 }}
    />
  )
}

type ResponseState = { status: number; body: unknown } | null

function EndpointCard({ endpoint }: { endpoint: EndpointDef }) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [response, setResponse] = useState<ResponseState>(null)
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    setLoading(true)
    setResponse(null)
    try {
      const url = buildUrl(endpoint.path, endpoint.params, values)
      const res = await fetch(url)
      const body = await res.json()
      setResponse({ status: res.status, body })
    } catch (err) {
      setResponse({ status: 0, body: { error: String(err) } })
    } finally {
      setLoading(false)
    }
  }

  const statusColor =
    response === null
      ? undefined
      : response.status >= 200 && response.status < 300
      ? 'green'
      : 'red'

  return (
    <div className="space-y-4">
      {endpoint.params.length > 0 && (
        <div>
          <Text type="secondary" className="block mb-2 text-xs uppercase tracking-wide">
            Parameters
          </Text>
          <div className="flex flex-wrap gap-3">
            {endpoint.params.map((param) => (
              <div key={param.name} className="flex flex-col gap-1">
                <Text className="text-xs text-gray-500">
                  {param.name}
                  {param.required && <span className="text-red-500 ml-0.5">*</span>}
                </Text>
                <ParamInput
                  param={param}
                  value={values[param.name] ?? ''}
                  onChange={(v) => setValues((prev) => ({ ...prev, [param.name]: v }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="primary" icon={<SendOutlined />} loading={loading} onClick={handleSend}>
        Send Request
      </Button>

      {loading && <Spin />}

      {response && (
        <div className="border rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b">
            <Tag color={statusColor}>
              {response.status === 0 ? 'ERROR' : response.status}
            </Tag>
            <Text type="secondary" className="text-xs">
              Response
            </Text>
          </div>
          <pre
            className="p-4 text-xs overflow-auto bg-gray-900 text-green-400 m-0"
            style={{ maxHeight: 400 }}
          >
            {JSON.stringify(response.body, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function ApiTestPage() {
  const tabItems = ENDPOINT_GROUPS.map((group) => ({
    key: group.tab,
    label: group.tab,
    children: (
      <Collapse
        items={group.endpoints.map((ep, idx) => ({
          key: idx,
          label: (
            <div className="flex items-center gap-3">
              <Tag color="blue" className="font-mono font-bold">
                {ep.method}
              </Tag>
              <Text code className="text-sm">
                {ep.path}
              </Text>
              <Text type="secondary" className="text-sm hidden sm:inline">
                {ep.description}
              </Text>
            </div>
          ),
          children: <EndpointCard endpoint={ep} />,
        }))}
      />
    ),
  }))

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Title level={3} className="!mb-1">
          API Explorer
        </Title>
        <Text type="secondary">Test các API endpoints — tương tự Swagger UI</Text>
      </div>
      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  )
}
