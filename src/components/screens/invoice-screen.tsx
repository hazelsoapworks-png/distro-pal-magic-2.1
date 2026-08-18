import { useStore, formatINR, TAX_RATE } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { ProductThumb } from "@/components/product-thumb";

export function InvoiceScreen({ dispatchId }: { dispatchId?: string }) {
  const { dispatches, products, shops, profile } = useStore();
  const d = dispatches.find((x) => x.id === dispatchId);

  if (!d) {
    return (
      <div className="pb-6 max-w-4xl mx-auto w-full">
        <AppHeader title="Invoice" subtitle="Not found" showBack rounded />
        <p className="px-4 py-10 text-center text-muted-foreground">This invoice is not available.</p>
      </div>
    );
  }

  const shop = shops.find((s) => s.id === d.shopId);
  const billed = d.lines.filter((l) => l.dispatchedQty > 0);

  return (
    <div className="pb-8 max-w-4xl mx-auto w-full">
      <AppHeader title="Tax Invoice" subtitle={d.invoiceNumber} showBack rounded />

      <div className="px-4 sm:px-6 pt-4">
        {/* Top Details Card */}
        <div className="rounded-2xl bg-card p-4 sm:p-6 shadow-sm ring-1 ring-black/5">
          <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-8">
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-bold text-foreground truncate">{profile.companyName}</p>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground line-clamp-2">{profile.address}</p>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                GSTIN: <span className="font-medium text-foreground">{profile.gstin}</span>
              </p>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                Proprietor: <span className="font-medium text-foreground">{profile.name}</span> ({profile.phone})
              </p>
            </div>

            {/* Divider for Desktop */}
            <div className="hidden md:block w-px bg-black/5" />

            <div className="flex-1 border-t border-black/5 pt-3 md:border-t-0 md:pt-0 min-w-0">
              <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Billed To</p>
              <p className="text-sm sm:text-base font-bold text-foreground truncate">{d.shopName}</p>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground truncate">{shop?.address ?? d.beatName}</p>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                GSTIN: <span className="font-medium text-foreground">27AAOCS{d.shopId.toUpperCase()}1Z5</span>
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-black/5 pt-4 text-xs sm:text-sm text-muted-foreground">
            <p className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-wide">Date</span>
              <span className="mt-0.5 font-medium text-foreground truncate">{new Date(d.at).toLocaleDateString("en-IN")}</span>
            </p>
            <p className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-wide">Time</span>
              <span className="mt-0.5 font-medium text-foreground truncate">{new Date(d.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            </p>
            <p className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-wide">Executive</span>
              <span className="mt-0.5 font-medium text-foreground truncate">{d.executive}</span>
            </p>
            <p className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-wide">Vehicle</span>
              <span className="mt-0.5 font-medium text-foreground truncate">{d.vehicle}</span>
            </p>
          </div>
        </div>

        {/* Items Grid */}
        <h3 className="mt-6 mb-3 text-lg font-bold text-foreground">Billed Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {billed.map((l) => {
            const p = products.find((x) => x.id === l.productId);
            return (
              <div
                key={l.productId}
                className="flex items-center gap-3 rounded-2xl bg-card p-3 sm:p-4 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow"
              >
                <ProductThumb src={p?.imageUrl} name={p?.name ?? "Item"} className="size-[48px] sm:size-[56px] shrink-0" />
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-sm sm:text-base font-semibold text-foreground truncate">{p?.name ?? "Item"}</p>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground truncate">
                    Qty: {l.dispatchedQty} / {l.orderedQty} • Rate: {formatINR(l.price)}
                  </p>
                </div>
                <p className="shrink-0 text-sm sm:text-base font-bold text-foreground self-center">
                  {formatINR(l.dispatchedQty * l.price)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Totals Section */}
        <div className="mt-4 sm:mt-6 flex flex-col md:items-end">
          <div className="w-full md:w-1/2 lg:w-1/3 rounded-2xl bg-card p-4 sm:p-6 shadow-sm ring-1 ring-black/5">
            <Row label="Sub Total" value={formatINR(d.subTotal)} />
            <Row label={`GST (${Math.round(TAX_RATE * 100)}%)`} value={formatINR(d.tax)} />
            <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
              <p className="font-semibold text-foreground text-sm sm:text-base">Grand Total</p>
              <p className="text-xl sm:text-2xl font-bold text-primary">{formatINR(d.grandTotal)}</p>
            </div>
            <div className="mt-4 text-center">
              <span className={`inline-block rounded-full px-3 py-1.5 text-xs font-semibold ${
                d.status === "Fully Dispatched" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
              }`}>
                {d.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm sm:text-base">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}