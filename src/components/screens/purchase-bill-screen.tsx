import { useMemo, useState } from "react";
import { Minus, Plus, Save } from "lucide-react";
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";

export function PurchaseBillScreen() {
  const { products, addPurchaseBill, goBack } = useStore();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [supplier, setSupplier] = useState("");
  const [invoice, setInvoice] = useState("");
  const [date, setDate] = useState(today);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [price, setPrice] = useState<Record<string, string>>({});

  const setQ = (id: string, v: number) =>
    setQty((prev) => ({ ...prev, [id]: Math.max(0, Math.min(9999, v)) }));

  const lines = products
    .map((p) => ({
      p,
      q: qty[p.id] ?? 0,
      pr: Number(price[p.id] ?? p.buyingPrice) || 0,
    }))
    .filter((l) => l.q > 0);
  const total = lines.reduce((s, l) => s + l.q * l.pr, 0);

  const save = () => {
    if (!supplier.trim() || lines.length === 0) return;
    addPurchaseBill({
      supplier: supplier.trim(),
      invoiceNumber: invoice.trim() || `INV-${Date.now()}`,
      invoiceDate: date,
      lines: lines.map((l) => ({ productId: l.p.id, qty: l.q, price: l.pr })),
    });
    goBack();
  };

  return (
    <div className="pb-48 max-w-7xl mx-auto w-full">
      <AppHeader title="Purchase Bill" subtitle="Receive stock from supplier" showBack rounded />

      <div className="px-4 sm:px-6 pt-4">
        {/* Supplier & Invoice Form Card */}
        <div className="rounded-2xl bg-card p-4 sm:p-5 shadow-sm ring-1 ring-black/5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="sm:col-span-2">
            <Field label="Supplier / Company Name" value={supplier} onChange={setSupplier} placeholder="e.g. Glow Cosmetics Pvt Ltd" />
          </div>
          <Field label="Invoice Number" value={invoice} onChange={setInvoice} placeholder="INV-2026-001" />
          <Field label="Invoice Date" value={date} onChange={setDate} type="date" />
        </div>

        <h2 className="mt-6 sm:mt-8 mb-3 text-lg sm:text-xl font-bold text-foreground">Select Products</h2>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {products.map((p) => {
            const q = qty[p.id] ?? 0;
            return (
              <div key={p.id} className="flex flex-col justify-between rounded-2xl bg-card p-4 sm:p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-foreground text-base sm:text-lg truncate">{p.name}</p>
                    <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground truncate">
                      {p.code} • per {p.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQ(p.id, q - 1)}
                      aria-label={`Decrease ${p.name}`}
                      className="flex size-9 sm:size-10 items-center justify-center rounded-lg bg-surface text-foreground disabled:opacity-40 cursor-pointer hover:bg-black/5 transition-colors"
                      disabled={q === 0}
                    >
                      <Minus className="size-4 sm:size-5" />
                    </button>
                    <input
                      inputMode="numeric"
                      value={q}
                      onChange={(e) => setQ(p.id, Number(e.target.value.replace(/\D/g, "")) || 0)}
                      aria-label={`${p.name} quantity`}
                      className="h-9 sm:h-10 w-14 sm:w-16 rounded-lg bg-surface text-center text-base sm:text-lg font-semibold text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40 transition-shadow"
                    />
                    <button
                      type="button"
                      onClick={() => setQ(p.id, q + 1)}
                      aria-label={`Increase ${p.name}`}
                      className="flex size-9 sm:size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <Plus className="size-4 sm:size-5" />
                    </button>
                  </div>
                </div>

                {q > 0 && (
                  <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground">Price ₹</span>
                      <input
                        inputMode="decimal"
                        value={price[p.id] ?? String(p.buyingPrice)}
                        onChange={(e) => setPrice((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        className="w-20 sm:w-24 rounded-lg bg-surface px-2.5 py-1.5 text-sm sm:text-base font-semibold text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40 transition-shadow"
                      />
                    </div>
                    <span className="text-base sm:text-lg font-bold text-primary truncate">
                      {formatINR(q * (Number(price[p.id] ?? p.buyingPrice) || 0))}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Sticky Bar */}
      <div className="fixed inset-x-0 bottom-[4.5rem] z-30 mx-auto max-w-2xl px-4 sm:px-6 pointer-events-none">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-card p-3 sm:p-4 shadow-2xl ring-1 ring-black/10 pointer-events-auto">
          <div className="min-w-0 pr-2">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Bill Total</p>
            <p className="mt-0.5 text-lg sm:text-2xl font-bold text-foreground truncate">{formatINR(total)}</p>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={!supplier.trim() || lines.length === 0}
            className="flex items-center shrink-0 gap-2 rounded-xl bg-primary px-5 py-3 sm:py-3.5 font-semibold text-primary-foreground disabled:opacity-40 cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <Save className="size-5" />
            Save Bill
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-surface px-3.5 py-3 sm:py-3.5 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40 placeholder:text-muted-foreground transition-shadow"
      />
    </label>
  );
}