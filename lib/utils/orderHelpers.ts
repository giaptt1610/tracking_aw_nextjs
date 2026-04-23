import type { OrderItem } from "@/types/order"

export function getOrderProductNames(items: OrderItem[]): string {
  return items
    .map((item) =>
      item.flavorName
        ? `${item.productName} (${item.flavorName})`
        : item.productName,
    )
    .join(", ")
}
