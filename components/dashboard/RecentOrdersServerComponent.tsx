import { getOrders } from "@/lib/api/orders";
import { Suspense } from "react";
import { RecentOrdersTable } from "./RecentOrdersTable";

export default async function RecentOrdersServerComponent() {

    const { orders, total } = await getOrders({ pageSize: 10 });


    return (
        <Suspense fallback={<div>Loading Recent Orders</div>}>
            <RecentOrdersTable orders={orders} />
        </Suspense>
    )
}