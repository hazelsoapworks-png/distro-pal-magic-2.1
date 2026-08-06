import type {
  Order,
  OrderLine,
  OrderStatus,
  Product,
  Shop,
  StockMovement,
} from "@/lib/types";
import { productName } from "@/lib/modules/products";

export function createOrder(
  id: string,
  shop: Shop,
  lines: OrderLine[],
  beatName: string,
  products: Product[],
  createdAt: string,
): Order | undefined {
  if (lines.length === 0) {
    return undefined;
  }

  const total = lines.reduce((sum, line) => sum + line.qty * line.price, 0);

  const summary = lines
    .map((line) => `${line.qty}x ${productName(products, line.productId)}`)
    .join(", ");

  return {
    id,
    shopId: shop.id,
    shopName: shop.name,
    beatName,
    lines,
    total,
    summary,
    status: "pending",
    createdAt,
  };
}

export function latestSellingPrices(
  lines: OrderLine[],
  previousPrices: Record<string, number> = {},
): Record<string, number> {
  const prices = { ...previousPrices };

  lines.forEach((line) => {
    prices[line.productId] = line.price;
  });

  return prices;
}

export function pendingOrders(orders: Order[]): Order[] {
  return orders.filter((order) => order.status !== "delivered");
}

export function setOrderStatus(
  orders: Order[],
  orderId: string,
  status: OrderStatus,
): Order[] {
  return orders.map((order) =>
    order.id === orderId ? { ...order, status } : order,
  );
}

export function remainingOrderQuantity(line: OrderLine): number {
  return Math.max(0, line.qty - (line.dispatchedQty ?? 0));
}

export type DeliveryResult = {
  orders: Order[];
  stockMovements: StockMovement[];
};

export function deliverOrder(
  orders: Order[],
  orderId: string,
  deliveredAt: string,
): DeliveryResult {
  const order = orders.find((item) => item.id === orderId);

  if (!order || order.status === "delivered") {
    return {
      orders,
      stockMovements: [],
    };
  }

  const stockMovements = order.lines
    .map((line, index) => ({
      id: `mv-${Date.now()}-${index}`,
      type: "outward" as const,
      productId: line.productId,
      qty: remainingOrderQuantity(line),
      note: `Delivered to ${order.shopName}`,
      at: deliveredAt,
    }))
    .filter((movement) => movement.qty > 0);

  return {
    orders: orders.map((item) =>
      item.id === orderId
        ? {
            ...item,
            status: "delivered",
            deliveredAt,
          }
        : item,
    ),
    stockMovements,
  };
}
