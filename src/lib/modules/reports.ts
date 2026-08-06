import type { Beat, Order, Shop } from "@/lib/types";

export function achievedToday(beats: Beat[]): number {
  return beats.reduce((total, beat) => total + beat.salesToday, 0);
}

export function totalOutstanding(shops: Shop[]): number {
  return shops.reduce((total, shop) => total + shop.dues, 0);
}

export function totalOrderValue(orders: Order[]): number {
  return orders.reduce((total, order) => total + order.total, 0);
}

export function deliveredOrderValue(orders: Order[]): number {
  return orders
    .filter((order) => order.status === "delivered")
    .reduce((total, order) => total + order.total, 0);
}

export function targetProgress(
  achieved: number,
  dailyTarget: number,
): number {
  if (dailyTarget <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((achieved / dailyTarget) * 100));
}
