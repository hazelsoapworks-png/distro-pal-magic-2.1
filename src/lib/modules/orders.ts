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

  let total = 0;
  let totalMargin = 0;

  const enrichedLines = lines.map((line) => {
    const product = products.find(p => p.id === line.productId);
    const buyingPrice = line.buyingPrice ?? product?.buyingPrice ?? 0;
    
    // 18% GST Inclusive Reverse Calculation
    // line.price is inclusive of GST (e.g., ₹22)
    const inclusivePrice = line.price;
    const basePrice = inclusivePrice / 1.18; // Taxable value without GST
    const gstAmountPerItem = inclusivePrice - basePrice;

    // Margin calculation based on base price vs buying price
    const marginPerItem = basePrice - buyingPrice;

    total += line.qty * inclusivePrice;
    totalMargin += line.qty * marginPerItem;

    return { 
      ...line, 
      price: inclusivePrice, // Final inclusive price
      basePrice: Number(basePrice.toFixed(2)),
      gstAmount: Number(gstAmountPerItem.toFixed(2)),
      buyingPrice 
    };
  });

  const summary = enrichedLines
    .map((line) => `${line.qty}x ${productName(products, line.productId)}`)
    .join(", ");

  return {
    id,
    shopId: shop.id,
    shopName: shop.name,
    beatName,
    lines: enrichedLines,
    total: Number(total.toFixed(2)),
    totalMargin: Number(totalMargin.toFixed(2)),
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