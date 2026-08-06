import type {
  PurchaseBill,
  PurchaseBillLine,
  StockMovement,
} from "@/lib/types";

export type NewPurchaseBill = Omit<
  PurchaseBill,
  "id" | "createdAt" | "total"
>;

export type PurchaseResult = {
  purchaseBill: PurchaseBill;
  stockMovements: StockMovement[];
};

export function createPurchaseBill(
  bill: NewPurchaseBill,
  createdAt: string,
): PurchaseResult {
  const timestamp = Date.now();
  const total = bill.lines.reduce(
    (sum, line) => sum + line.qty * line.price,
    0,
  );

  const purchaseBill: PurchaseBill = {
    ...bill,
    id: `pb-${timestamp}`,
    createdAt,
    total,
  };

  const stockMovements: StockMovement[] = bill.lines.map(
    (line: PurchaseBillLine, index) => ({
      id: `mv-${timestamp}-${index}`,
      type: "inward",
      productId: line.productId,
      qty: line.qty,
      note: `Received from ${bill.supplier} • ${bill.invoiceNumber}`,
      at: createdAt,
    }),
  );

  return {
    purchaseBill,
    stockMovements,
  };
}
