import { useState } from "react";
import { Calendar } from "lucide-react";
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";

export function OrdersHistoryScreen() {
  const { orders } = useStore();
  
  const [filterType, setFilterType] = useState<"today" | "yesterday" | "lastWeek" | "lastMonth" | "custom">("today");
  const [customDate, setCustomDate] = useState<string>("");

  // फ़िल्टरिंग लॉजिक
  const filteredOrders = orders.filter((o) => {
    // अगर आप चाहें तो यहाँ तारीख के हिसाब से असली लॉजिक लगा सकते हैं
    return true; 
  });

  const totalOrdersCount = filteredOrders.length;
  const totalOrdersSales = filteredOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="pb-6">
      <AppHeader title="Orders History" subtitle="Track date-wise orders & total sales" showBack rounded />

      {/* Date & Timeframe Filter Chips */}
      <div className="bg-card px-4 py-3 border-b border-black/5 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          {(["today", "yesterday", "lastWeek", "lastMonth"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { setFilterType(type); setCustomDate(""); }}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filterType === type && !customDate
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted-foreground"
              }`}
            >
              {type === "today" ? "Today" : type === "yesterday" ? "Yesterday" : type === "lastWeek" ? "Last Week" : "Last Month"}
            </button>
          ))}
        </div>

        {/* Calendar Picker Button */}
        <div className="relative shrink-0 flex items-center">
          <input
            type="date"
            value={customDate}
            onChange={(e) => {
              setCustomDate(e.target.value);
              setFilterType("custom");
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <button
            type="button"
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${
              filterType === "custom" && customDate ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"
            }`}
          >
            <Calendar className="size-4" />
            {customDate ? customDate : "Date"}
          </button>
        </div>
      </div>

      {/* Summary Dashboard Card */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-primary p-4 text-primary-foreground shadow-sm">
          <div>
            <p className="text-xs text-primary-foreground/80">Total Orders</p>
            <p className="mt-1 text-2xl font-bold">{totalOrdersCount}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-primary-foreground/80">Total Sales</p>
            <p className="mt-1 text-2xl font-bold">{formatINR(totalOrdersSales)}</p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3 px-4 pt-4">
        {filteredOrders.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">No orders found for this period.</p>
        ) : (
          filteredOrders.map((o) => (
            <div key={o.id} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-foreground">{o.shopName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{o.beatName}</p>
                </div>
                <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-primary">
                  {formatINR(o.total)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-black/5 pt-2">
                <span>{o.lines.length} items</span>
                <span className="capitalize font-semibold text-foreground">Status: {o.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}