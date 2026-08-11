import type {
  DispatchLine,
  DispatchRecord,
  Order,
  OrderLine,
  OrderStatus,
  Product,
  Profile,
  StockMovement,
} from "@/lib/types";
import { productName } from "@/lib/modules/products";

export type DispatchInput = {
  executive: string;
  vehicle: string;
  quantities: Record<string, number>;
  remainingAction?: "cancel" | "backorder";
};

export type DispatchResult = {
  dispatchId: string;
  orders: Order[];
  dispatch: DispatchRecord;
  stockMovements: StockMovement[];
};

export function createDispatch(
  order: Order,
  input: DispatchInput,
  profile: Profile,
  products: Product[],
  existingDispatches: DispatchRecord[],
  createdAt: string,
): DispatchResult | undefined {
  const timestamp = Date.now();
  const dispatchId = `dsp-${timestamp}`;
  const backOrderId = `ord-bo-${timestamp}`;

  const lines: DispatchLine[] = order.lines.map((line) => {
    const alreadyDispatched = line.dispatchedQty ?? 0;
    const pendingQuantity = Math.max(0, line.qty - alreadyDispatched);
    const requestedQuantity = Math.floor(
      input.quantities[line.productId] ?? 0,
    );
    const dispatchedQty = Math.max(
      0,
      Math.min(pendingQuantity, requestedQuantity),
    );

    return {
      productId: line.productId,
      orderedQty: pendingQuantity,
      dispatchedQty,
      remainingQty: pendingQuantity - dispatchedQty,
      price: line.price,
    };
  });

  const totalDispatched = lines.reduce(
    (total, line) => total + line.dispatchedQty,
    0,
  );

  if (totalDispatched <= 0) {
    return undefined;
  }

  const remainingLines = lines.filter((line) => line.remainingQty > 0);
  const fullyDispatched = remainingLines.length === 0;
  const subTotal = lines.reduce(
    (total, line) => total + line.dispatchedQty * line.price,
    0,
  );
  const tax = Math.round(subTotal * 0.18 * 100) / 100;
  const grandTotal = subTotal + tax;

  const dispatch: DispatchRecord = {
    id: dispatchId,
    orderId: order.id,
    shopId: order.shopId,
    shopName: order.shopName,
    beatName: order.beatName,
    executive: input.executive || profile.name,
    vehicle: input.vehicle || "—",
    invoiceNumber: `INV-${new Date(createdAt).getFullYear()}-${String(
      existingDispatches.length + 1,
    ).padStart(4, "0")}`,
    at: createdAt,
    lines,
    subTotal,
    tax,
    grandTotal,
    status: fullyDispatched
      ? "Fully Dispatched"
      : "Partially Dispatched",
    backOrderId: fullyDispatched ? undefined : backOrderId,
  };

  const stockMovements: StockMovement[] = lines
    .filter((line) => line.dispatchedQty > 0)
    .map((line, index) => ({
      id: `mv-${timestamp}-${index}`,
      type: "outward" as const,
      productId: line.productId,
      qty: line.dispatchedQty,
      note: `Dispatched to ${order.shopName} • ${dispatch.invoiceNumber}`,
      at: createdAt,
    }));

  const updatedOrder: Order = {
    ...order,
    status: (fullyDispatched ? "dispatched" : "partial") as OrderStatus,
    dispatchIds: [...(order.dispatchIds ?? []), dispatchId],
    lines: order.lines.map((line) => {
      const dispatchLine = lines.find(
        (item) => item.productId === line.productId,
      );

      return dispatchLine
        ? {
            ...line,
            dispatchedQty:
              (line.dispatchedQty ?? 0) + dispatchLine.dispatchedQty,
          }
        : line;
    }),
  };

  const nextOrders = fullyDispatched
    ? [updatedOrder]
    : [
        {
          id: backOrderId,
          shopId: order.shopId,
          shopName: order.shopName,
          beatName: order.beatName,
          lines: remainingLines.map<OrderLine>((line) => ({
            productId: line.productId,
            qty: line.remainingQty,
            price: line.price,
          })),
          total: remainingLines.reduce(
            (total, line) => total + line.remainingQty * line.price,
            0,
          ),
          summary: remainingLines
            .map(
              (line) =>
                `${line.remainingQty}x ${productName(
                  products,
                  line.productId,
                )}`,
            )
            .join(", "),
          status: "pending",
          createdAt,
          backOrderOf: order.id,
        },
        updatedOrder,
      ];

  return {
    dispatchId,
    orders: nextOrders,
    dispatch,
    stockMovements,
  };
}

export function replaceOrderAfterDispatch(
  allOrders: Order[],
  originalOrderId: string,
  resultOrders: Order[],
): Order[] {
  const remainingOrders = allOrders.filter(
    (order) => order.id !== originalOrderId,
  );

  return [
    ...resultOrders.filter((order) => order.id !== originalOrderId),
    ...remainingOrders.map((order) =>
      order.id === originalOrderId
        ? resultOrders.find((item) => item.id === originalOrderId) ?? order
        : order,
    ),
  ];
}
