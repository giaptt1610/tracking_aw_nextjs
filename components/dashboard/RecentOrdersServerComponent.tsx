import { getOrders } from "@/lib/api/orders";
import { Suspense } from "react";
import { RecentOrdersTable } from "./RecentOrdersTable";

interface RecentOrdersServerComponentProps {
  fromDate?: string
  toDate?: string
}

export default async function RecentOrdersServerComponent({ fromDate, toDate }: RecentOrdersServerComponentProps = {}) {

    const { orders } = await getOrders({ pageSize: 10, from: fromDate, to: toDate });


    return (
        <Suspense fallback={<div>Loading Recent Orders</div>}>
            <RecentOrdersTable orders={orders} />
        </Suspense>
    )
}