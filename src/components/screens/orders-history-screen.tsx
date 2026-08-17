import { useState } from "react";
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";

type FilterType = "today" | "yesterday" | "lastWeek" | "lastMonth" | "custom";

export function OrdersHistoryScreen() {
  const { orders } = useStore();

  const [filterType, setFilterType] = useState<FilterType>("today");
  const [customDate, setCustomDate] = useState<string>("");

  // 1. तारीखों की गणना (Local Timezone में सटीक 'Start of Day')
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const startOf7DaysAgo = new Date(startOfToday);
  startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 7);

  const startOf30DaysAgo = new Date(startOfToday);
  startOf30DaysAgo.setDate(startOf30DaysAgo.getDate() - 30);

  // 2. फ़िल्टरिंग का अचूक लॉजिक
  const filteredOrders = orders.filter((o) => {
    if (!o.createdAt) return false;

    const orderDate = new Date(o.createdAt);
    if (isNaN(orderDate.getTime())) return false;

    if (filterType === "today") {
      return orderDate >= startOfToday;
    }

    if (filterType === "yesterday") {
      return orderDate >= startOfYesterday && orderDate < startOfToday;
    }

    if (filterType === "lastWeek") {
      return orderDate >= startOf7DaysAgo;
    }

    if (filterType === "lastMonth") {
      return orderDate >= startOf30DaysAgo;
    }

    if (filterType === "custom" && customDate) {
      // customDate HTML input से "YYYY-MM-DD" फॉर्मेट में आता है
      const [year, month, day] = customDate.split("-").map(Number);
      const startOfCustom = new Date(year, month - 1, day);
      const endOfCustom = new Date(year, month - 1, day + 1);
      return orderDate >= startOfCustom && orderDate < endOfCustom;
    }

    return true;
  });

  const totalOrdersCount = filteredOrders.length;
  const totalOrdersSales = filteredOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="pb-6 max-w-7xl mx-auto w-full">
      <AppHeader title="Orders History" subtitle="Track date-wise orders & total sales" showBack rounded />

      {/* Date & Timeframe Filter Chips */}
      <div className="bg-card px-4 sm:px-6 py-3 border-b border-black/5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2">
          {(["today", "yesterday", "lastWeek", "lastMonth"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setFilterType(type);
                setCustomDate("");
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer hover:opacity-90 ${
                filterType === type && !customDate
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted-foreground hover:bg-black/5"
              }`}
            >
              {type === "today"
                ? "Today"
                : type === "yesterday"
                ? "Yesterday"
                : type === "lastWeek"
                ? "Last Week"
                : "Last Month"}
            </button>
          ))}
        </div>

        {/* Calendar Picker - Native Input */}
        <div className="shrink-0 flex items-center">
          <input
            type="date"
            value={customDate}
            onChange={(e) => {
              if (e.target.value) {
                setCustomDate(e.target.value);
                setFilterType("custom");
              }
            }}
            className={`rounded-xl px-2 py-1.5 text-xs font-semibold outline-none transition-colors cursor-pointer border border-transparent focus:border-primary/50 hover:opacity-90 ${
              filterType === "custom" && customDate
                ? "bg-primary text-primary-foreground [color-scheme:dark]"
                : "bg-surface text-muted-foreground hover:bg-black/5"
            }`}
          />
        </div>
      </div>

      {/* Summary Dashboard Card */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-primary p-4 sm:p-5 text-primary-foreground shadow-sm">
          <div>
            <p className="text-xs sm:text-sm text-primary-foreground/80">Total Orders</p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold">{totalOrdersCount}</p>
          </div>
          <div className="text-right">
            <p className="text-xs sm:text-sm text-primary-foreground/80">Total Sales</p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold truncate">{formatINR(totalOrdersSales)}</p>
          </div>
        </div>
      </div>

      {/* Orders List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-4 sm:px-6 pt-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-10 text-center">
            <p className="text-muted-foreground">No orders found for this period.</p>
            <p className="mt-2 text-[11px] text-muted-foreground/70">
              (Note: Demo order is from Jan 2026. Try booking a new order to see it in 'Today')
            </p>
          </div>
        ) : (
          filteredOrders.map((o) => (
            <div key={o.id} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-foreground text-base truncate">{o.shopName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{o.beatName}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-primary">
                  {formatINR(o.total)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-black/5 pt-3">
                <span>{o.lines.length} items</span>
                <span className="capitalize font-semibold text-foreground">
                  Status: {o.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}