import { Package, PackagePlus, ArrowDownToLine, ArrowUpFromLine, Camera } from "lucide-react";
import { useStore, formatINR, type StockLevels } from "@/lib/store";
import { AppHeader } from "@/components/app-header";

const STATUS_META: Record<StockLevels["status"], { label: string; cls: string }> = {
  in: { label: "In Stock", cls: "bg-success-soft text-success" },
  low: { label: "Low Stock", cls: "bg-warning-soft text-warning" },
  out: { label: "Out of Stock", cls: "bg-destructive/10 text-destructive" },
};

export function InventoryScreen() {
  const { products, stockFor, stockMovements, navigate } = useStore();

  const totals = products.reduce(
    (acc, p) => {
      const s = stockFor(p.id);
      acc.physical += s.physical;
      acc.reserved += s.reserved;
      acc.available += s.available;
      if (s.status === "low") acc.low += 1;
      if (s.status === "out") acc.out += 1;
      return acc;
    },
    { physical: 0, reserved: 0, available: 0, low: 0, out: 0 },
  );

  return (
    <div className="pb-6 max-w-7xl mx-auto w-full">
      <AppHeader
        title="Stock & Inventory"
        subtitle="Godown-level stock management"
        showBack
        rounded
      />

      <div className="px-4 sm:px-6 pt-4">
        {/* Top Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Physical" value={totals.physical} tone="brand" icon={<Package className="size-4 sm:size-5" />} />
          <StatCard label="Reserved" value={totals.reserved} tone="warning" icon={<ArrowUpFromLine className="size-4 sm:size-5" />} />
          <StatCard label="Available" value={totals.available} tone="success" icon={<ArrowDownToLine className="size-4 sm:size-5" />} />
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => navigate("purchaseBill")}
          className="mt-4 sm:mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 sm:py-4 font-semibold text-primary-foreground shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
        >
          <PackagePlus className="size-5" />
          Receive New Stock / Purchase Bill
        </button>

        {/* Alerts */}
        {(totals.low > 0 || totals.out > 0) && (
          <div className="mt-4 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning font-medium">
            {totals.out} out of stock • {totals.low} low stock — reorder soon.
          </div>
        )}

        {/* Products Grid */}
        <h2 className="mb-3 mt-8 text-lg sm:text-xl font-bold text-foreground">Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {products.map((p) => {
            const s = stockFor(p.id);
            const meta = STATUS_META[s.status];
            return (
              <div key={p.id} className="flex flex-col justify-between rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-start gap-3">
                    <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-soft">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="size-full object-cover" />
                      ) : (
                        <Camera className="size-5 text-primary/60" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pr-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-foreground text-base truncate">{p.name}</p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-semibold ${meta.cls}`}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        {p.code} • per {p.unit} • {formatINR(p.sellingPrice)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface p-2.5 sm:p-3 text-center">
                    <StockCell label="Physical" value={s.physical} tone="text-foreground" />
                    <StockCell label="Reserved" value={s.reserved} tone="text-warning" />
                    <StockCell label="Available" value={s.available} tone="text-success" />
                  </div>
                  <p className="mt-2.5 text-[11px] sm:text-xs text-muted-foreground text-center">
                    Reorder threshold: <span className="font-medium">{p.lowStockThreshold} {p.unit}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stock Movement Log Grid */}
        <h2 className="mb-3 mt-8 text-lg sm:text-xl font-bold text-foreground">Stock Movement Log</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {stockMovements.length === 0 && (
            <div className="col-span-full rounded-xl bg-card p-4 text-center text-sm text-muted-foreground shadow-sm ring-1 ring-black/5">
              No movements yet. Add a purchase bill or deliver an order.
            </div>
          )}
          {stockMovements.map((m) => {
            const p = products.find((x) => x.id === m.productId);
            const inward = m.type === "inward";
            return (
              <div key={m.id} className="flex items-start gap-3 rounded-xl bg-card p-3.5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow">
                <span
                  className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${
                    inward ? "bg-success-soft text-success" : "bg-brand-soft text-primary"
                  }`}
                >
                  {inward ? <ArrowDownToLine className="size-4" /> : <ArrowUpFromLine className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {inward ? "+" : "−"}
                    {m.qty} {p?.name ?? "Item"}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{m.note}</p>
                </div>
                <span className="shrink-0 text-[10px] sm:text-xs font-medium text-muted-foreground">
                  {new Date(m.at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "brand" | "warning" | "success";
  icon: React.ReactNode;
}) {
  const toneCls =
    tone === "brand"
      ? "bg-brand-soft text-primary"
      : tone === "warning"
        ? "bg-warning-soft text-warning"
        : "bg-success-soft text-success";
  return (
    <div className="flex flex-col rounded-2xl bg-card p-3 sm:p-4 shadow-sm ring-1 ring-black/5">
      <span className={`flex size-8 sm:size-10 items-center justify-center rounded-full ${toneCls}`}>{icon}</span>
      <p className="mt-3 text-xs sm:text-sm text-muted-foreground font-medium truncate">{label}</p>
      <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{value}</p>
    </div>
  );
}

function StockCell({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className={`text-sm sm:text-base font-bold mt-0.5 truncate w-full ${tone}`}>{value}</p>
    </div>
  );
}