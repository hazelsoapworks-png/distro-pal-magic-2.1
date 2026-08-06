import type {
  Order,
  Product,
  StockLevels,
  StockMovement,
} from "@/lib/types";

export function stockForProduct(
  productId: string,
  products: Product[],
  orders: Order[],
  stockMovements: StockMovement[],
): StockLevels {
  const product = products.find((item) => item.id === productId);
  const openingStock = product?.openingStock ?? 0;
  const lowStockThreshold = product?.lowStockThreshold ?? 0;

  const inward = stockMovements
    .filter(
      (movement) =>
        movement.productId === productId && movement.type === "inward",
    )
    .reduce((total, movement) => total + movement.qty, 0);

  const outward = stockMovements
    .filter(
      (movement) =>
        movement.productId === productId && movement.type === "outward",
    )
    .reduce((total, movement) => total + movement.qty, 0);

  const physical = openingStock + inward - outward;

  const reserved = orders
    .filter((order) => order.status !== "delivered")
    .flatMap((order) => order.lines)
    .filter((line) => line.productId === productId)
    .reduce(
      (total, line) =>
        total + Math.max(0, line.qty - (line.dispatchedQty ?? 0)),
      0,
    );

  const available = Math.max(0, physical - reserved);

  const status: StockLevels["status"] =
    physical <= 0 ? "out" : available <= lowStockThreshold ? "low" : "in";

  return {
    physical,
    reserved,
    available,
    status,
  };
}
