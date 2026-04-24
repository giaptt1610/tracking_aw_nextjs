# tracking_aw — Client (Next.js)

Ứng dụng web quản lý và thống kê đơn hàng: theo dõi sản phẩm, doanh thu, chi phí mua-bán theo biểu đồ và bảng.

---

## Môi trường & Công nghệ

| Thành phần | Công nghệ | Phiên bản |
| --- | --- | --- |
| Framework | Next.js (App Router) | 16.x |
| Ngôn ngữ | TypeScript | 5.x |
| UI Component | Ant Design | 6.x |
| CSS | Tailwind CSS | 3.x |
| Database ORM | Drizzle ORM (PostgreSQL) | 0.45.x |
| Charts | Recharts | 3.x |
| Testing | Vitest | 2.x |
| Package manager | pnpm | — |
| Runtime scripts | tsx | 4.x |

---

## Cài đặt & Chạy

```bash
# 1. Cài dependencies
pnpm install

# 2. Tạo file biến môi trường
cp .env.example .env.local   # chỉnh DATABASE_URL trỏ vào PostgreSQL local

# 3. Đẩy schema lên DB local
pnpm db:push-local

# 4. Seed dữ liệu mẫu (tuỳ chọn)
pnpm db:seed-local

# 5. Chạy dev server
pnpm dev
# → http://localhost:3000
```

### Biến môi trường

| Biến           | Mô tả                       | Ví dụ                                            |
| -------------- | --------------------------- | ------------------------------------------------ |
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://user:pass@localhost:5432/tracking` |

Tạo `.env.local` cho local, `.env.prod` cho production.

---

## Scripts

```bash
pnpm dev              # Dev server (hot reload)
pnpm build            # Build production
pnpm start            # Chạy production build
pnpm lint             # ESLint
pnpm test             # Chạy tests (Vitest)
pnpm test:watch       # Tests chế độ watch
pnpm test:coverage    # Báo cáo coverage

pnpm db:push-local    # Đẩy schema → DB local (.env.local)
pnpm db:push-prod     # Đẩy schema → DB production (.env.prod)
pnpm db:seed-local    # Seed dữ liệu → DB local
pnpm db:seed-prod     # Seed dữ liệu → DB production
pnpm db:test-local    # Kiểm tra kết nối DB local
pnpm db:test          # Kiểm tra kết nối DB production
```

---

## Cấu trúc thư mục

```text
client_nextjs/
│
├── app/                              # Next.js App Router
│   ├── (main)/                       # Route group — layout chính (sidebar + header)
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx        # Trang tổng quan
│   │   ├── orders/
│   │   │   ├── page.tsx              # Danh sách đơn hàng
│   │   │   └── [id]/page.tsx         # Chi tiết đơn hàng
│   │   ├── products/page.tsx         # Quản lý sản phẩm
│   │   ├── statistics/page.tsx       # Thống kê biểu đồ
│   │   └── api-test/page.tsx         # Test API (dev only)
│   ├── api/                          # Route Handlers (REST API)
│   │   ├── orders/route.ts           # GET /api/orders  POST /api/orders
│   │   ├── orders/[id]/route.ts      # GET PUT DELETE /api/orders/:id
│   │   ├── products/route.ts         # GET /api/products  POST /api/products
│   │   └── statistics/route.ts       # GET /api/statistics
│   ├── antd-registry.tsx             # Ant Design CSS-in-JS cho SSR
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Redirect → /dashboard
│   └── globals.css
│
├── components/                       # React components (tổ chức theo feature)
│   ├── dashboard/
│   │   ├── DashboardStats.tsx        # Tổng quan số liệu
│   │   ├── DashboardStatRow.tsx
│   │   ├── RecentOrdersTable.tsx
│   │   └── RecentOrdersServerComponent.tsx
│   ├── orders/
│   │   ├── OrdersTable.tsx
│   │   ├── OrderFilters.tsx
│   │   ├── OrderStatusTag.tsx
│   │   ├── CreateOrderModal.tsx
│   │   ├── EditOrderModal.tsx
│   │   └── DeleteOrderButton.tsx
│   ├── products/
│   │   ├── ProductFormModal.tsx
│   │   └── DeleteProductButton.tsx
│   ├── layout/
│   │   ├── MainLayoutShell.tsx       # Sidebar + header + content
│   │   ├── AppSidebar.tsx
│   │   └── AppHeader.tsx
│   ├── providers/
│   │   └── AntdProvider.tsx
│   └── shared/
│       └── PageHeader.tsx
│
├── hooks/                            # Custom React hooks (data fetching)
│   ├── useOrders.ts
│   ├── useProducts.ts
│   ├── useStatistics.ts
│   └── useTrackedProducts.ts
│
├── lib/                              # Logic nghiệp vụ & tiện ích
│   ├── actions/                      # Next.js Server Actions
│   │   ├── orders.ts
│   │   └── products.ts
│   ├── api/                          # Client-side API fetcher functions
│   │   ├── orders.ts
│   │   ├── products.ts
│   │   └── statistics.ts
│   ├── db/
│   │   ├── index.ts                  # Drizzle ORM init + DB connection
│   │   └── schema.ts                 # Schema: products, orders, orderItems, ...
│   ├── mock/                         # Dữ liệu mock cho dev/test
│   ├── theme/
│   │   └── colors.ts
│   └── utils/
│       └── formatters.ts             # Format ngày, tiền tệ, số lượng
│
├── types/                            # TypeScript type definitions
│   ├── order.ts                      # Order, OrderStatus, PaymentType, OrderItem
│   ├── product.ts                    # Product, ProductFlavor, ProductImage
│   └── statistics.ts
│
├── scripts/                          # Utility scripts (chạy qua tsx)
│   ├── seed.ts / seed-local.ts
│   ├── test-db.ts / test-local-db.ts
│   ├── clear-orders-local.ts / clear-orders-prod.ts
│   └── clear-fashion-local.ts / clear-fashion-prod.ts
│
├── drizzle.config.ts                 # Drizzle Kit config
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.mts
```

---

## Database Schema

```text
products          — sản phẩm (id, name, sku, category, defaultPurchaseCost, defaultSellPrice, ...)
  └── product_images   — ảnh sản phẩm
  └── product_flavors  — biến thể (tên, giá mua, giá bán, trạng thái)

orders            — đơn hàng (id, status, totalPurchaseCost, totalSellRevenue, paymentType, ...)
  └── order_items      — chi tiết đơn (productId, flavorId, quantity, purchaseCost, sellPrice)
```

**OrderStatus:** `pending` | `confirmed` | `shipping` | `delivered` | `cancelled` | `invalid`

**PaymentType:** `cash` | `visa`

---

## API Endpoints

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| GET | `/api/orders` | Danh sách đơn hàng (filter: status, from, to, page, pageSize) |
| POST | `/api/orders` | Tạo đơn hàng mới |
| GET | `/api/orders/:id` | Chi tiết đơn hàng |
| PUT | `/api/orders/:id` | Cập nhật đơn hàng |
| DELETE | `/api/orders/:id` | Xoá đơn hàng |
| GET | `/api/products` | Danh sách sản phẩm |
| POST | `/api/products` | Tạo sản phẩm mới |
| GET | `/api/statistics` | Dữ liệu thống kê tổng hợp |

---

## Quy trình thêm tính năng mới

### Bước 1 — Xác định phạm vi

Đặt câu hỏi:

- Tính năng thuộc domain nào? (orders / products / statistics / layout)
- Cần thêm route mới, API mới, hay chỉ component mới?
- Cần thay đổi schema DB không?

---

### Bước 2 — Schema DB (nếu cần)

Sửa [lib/db/schema.ts](lib/db/schema.ts), thêm bảng hoặc cột mới, rồi push lên DB:

```bash
pnpm db:push-local
```

---

### Bước 3 — Định nghĩa Types

Thêm hoặc mở rộng type trong `types/`:

```typescript
// types/order.ts
export type NewStatus = 'returned'
```

---

### Bước 4 — API Route Handler

Tạo file trong `app/api/<feature>/route.ts`:

```typescript
// app/api/returns/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ success: true, data: [] })
}
```

---

### Bước 5 — Server Action (nếu cần mutation)

Thêm action trong `lib/actions/<feature>.ts`:

```typescript
'use server'
import { revalidatePath } from 'next/cache'

export async function createReturn(data: NewReturn) {
  // insert vào DB
  revalidatePath('/orders')
}
```

---

### Bước 6 — Client-side API fetcher

Thêm hàm gọi API trong `lib/api/<feature>.ts`:

```typescript
export async function fetchReturns() {
  const res = await fetch('/api/returns')
  return res.json()
}
```

---

### Bước 7 — Custom Hook

Tạo hook trong `hooks/use<Feature>.ts`:

```typescript
export function useReturns() {
  const [data, setData] = useState([])
  // fetch + state logic
  return { data, loading, refetch }
}
```

---

### Bước 8 — Components

Tạo components trong `components/<feature>/`:

```text
components/
└── returns/
    ├── ReturnsTable.tsx
    └── CreateReturnModal.tsx
```

---

### Bước 9 — Page

Tạo page trong `app/(main)/<feature>/page.tsx`:

```typescript
import ReturnsTable from '@/components/returns/ReturnsTable'

export default function ReturnsPage() {
  return <ReturnsTable />
}
```

Thêm mục vào sidebar: [components/layout/AppSidebar.tsx](components/layout/AppSidebar.tsx).

---

### Bước 10 — Tests

Viết unit/integration tests trong `__tests__/` cạnh file tương ứng:

```bash
pnpm test
pnpm test:coverage   # đảm bảo coverage ≥ 80%
```

---

### Checklist trước khi commit

- [ ] Schema DB đã được push (`pnpm db:push-local`)
- [ ] Types đã định nghĩa trong `types/`
- [ ] API route có xử lý lỗi
- [ ] Tests đã viết và pass
- [ ] Không có `console.log` trong code
- [ ] Build pass: `pnpm build`
- [ ] Không có lỗi TypeScript: `pnpm lint`
