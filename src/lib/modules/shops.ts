import type { Shop } from "@/lib/types";

export type NewShop = Omit<Shop, "id" | "beatId" | "status">;

export function createShop(id: string, beatId: string, shop: NewShop): Shop {
  return {
    ...shop,
    id,
    beatId,
    status: "pending",
  };
}

export function shopsForBeat(shops: Shop[], beatId: string): Shop[] {
  return shops.filter((shop) => shop.beatId === beatId);
}

export function duesForBeat(shops: Shop[], beatId: string): number {
  return shopsForBeat(shops, beatId).reduce(
    (total, shop) => total + shop.dues,
    0,
  );
}

export function totalOutstanding(shops: Shop[]): number {
  return shops.reduce((total, shop) => total + shop.dues, 0);
}

export function deleteShop(shops: Shop[], shopId: string): Shop[] {
  return shops.filter((shop) => shop.id !== shopId);
}

export function applyOrderToShop(
  shops: Shop[],
  shopId: string,
  orderAmount: number,
  latestPrices: Record<string, number>,
): Shop[] {
  return shops.map((shop) =>
    shop.id === shopId
      ? {
          ...shop,
          status: "ordered",
          orderAmount,
          lastSellingPrices: latestPrices,
        }
      : shop,
  );
}

export function applyCollectionToShop(
  shops: Shop[],
  shopId: string,
  amount: number,
): Shop[] {
  return shops.map((shop) =>
    shop.id === shopId
      ? {
          ...shop,
          dues: Math.max(0, shop.dues - amount),
          status: "paid",
          paidAmount: amount,
        }
      : shop,
  );
}
