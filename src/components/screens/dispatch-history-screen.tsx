import { FileText, ChevronRight } from "lucide-react";
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { ProductThumb } from "@/components/product-thumb";

export function DispatchHistoryScreen() {
  const { dispatches, products, navigate } = useStore();

  return (
    <div className="pb-6">
      <AppHeader title="Dispatch History" subtitle="All completed dispatches & invoices" showBack rounded />

      <div className="space-y-3 px-4 pt-4">
        {dispatches.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">No dispatches recorded yet.</p>
        )}
        {dispatches.map((d) => (
          <div key={d.id} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-foreground">{d.shopName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(d.at).toLocaleDateString("en-IN")} •{" "}
                  {new Date(d.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {d.executive} • {d.vehicle} • {d.invoiceNumber}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  d.status === "Fully Dispatched"
                    ? "bg-success-soft text-success"
                    : "bg-warning-soft text-warning"
                }`}
              >
                {d.status}
              </span>
            </div>

            <ul className="mt-3 space-y-2 rounded-xl bg-surface p-3">
              {d.lines.map((l) => {
                const p = products.find((x) => x.id === l.productId);
                return (
                  <li key={l.productId} className="flex items-center gap-3">
                    <ProductThumb src={p?.imageUrl} name={p?.name ?? "Item"} className="size-[36px]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{p?.name ?? "Item"}</p>
                      <p className="text-xs text-muted-foreground">
                        Ordered {l.orderedQty} • Dispatched {l.dispatchedQty} • Remaining {l.remainingQty}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={() => navigate("invoice", { dispatchId: d.id })}
              className="mt-3 flex w-full items-center justify-between rounded-xl bg-brand-soft px-4 py-2.5 font-semibold text-primary"
            >
              <span className="flex items-center gap-2">
                <FileText className="size-4" />
                View Invoice • {formatINR(d.grandTotal)}
              </span>
              <ChevronRight className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
