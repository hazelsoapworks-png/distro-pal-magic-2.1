import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";

export function OrderBookingScreen({ shopId, beatId }: { shopId?: string; beatId?: string }) {
  const { shops, beats, products, placeOrder, goBack } = useStore();
  const shop = shops.find((s) => s.id === shopId);
  const beat = beats.find((b) => b.id === beatId);

  const [qty, setQty] = useState<Record<string, number>>({});

  const setValue = (id: string, v: number) =>
    setQty((prev) => ({ ...prev, [id]: Math.max(0, Math.min(999, v)) }));

  const lines = products
    .map((p) => ({ p, q: qty[p.id] ?? 0 }))
    .filter((l) => l.q > 0);
  const total = lines.reduce((s, l) => s + l.q * l.p.sellingPrice, 0);
  const items = lines.reduce((s, l) => s + l.q, 0);

  const confirm = () => {
    if (!shop || lines.length === 0) return;
    placeOrder(
      shop.id,
      lines.map((l) => ({ productId: l.p.id, qty: l.q, price: l.p.sellingPrice })),
      beat?.name ?? "Beat",
    );
    goBack();
  };

  return (
    <div className="pb-40">
      <AppHeader
        title="Book Order"
        subtitle={shop ? `${shop.name}${beat ? ` • ${beat.name}` : ""}` : "Order booking"}
        showBack
        rounded
      />

      <div className="space-y-3 px-4 pt-4">
        {products.map((p) => {
          const q = qty[p.id] ?? 0;
          const stock = stockFor(p.id);
          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <ProductThumb src={p.imageUrl} name={p.name} className="size-[48px]" />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatINR(p.sellingPrice)} / {p.unit} • {p.code}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Available Stock: <span className="font-semibold text-foreground">{stock.available}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setValue(p.id, q - 1)}
                  aria-label={`Decrease ${p.name}`}
                  className="flex size-9 items-center justify-center rounded-lg bg-surface text-foreground disabled:opacity-40"
                  disabled={q === 0}
                >
                  <Minus className="size-4" />
                </button>
                <input
                  inputMode="numeric"
                  value={q}
                  onChange={(e) => setValue(p.id, Number(e.target.value.replace(/\D/g, "")) || 0)}
                  aria-label={`${p.name} quantity`}
                  className="h-9 w-12 rounded-lg bg-surface text-center text-base font-semibold text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40"
                />
                <button
                  type="button"
                  onClick={() => setValue(p.id, q + 1)}
                  aria-label={`Increase ${p.name}`}
                  className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order summary bar */}
      <div className="fixed inset-x-0 bottom-[4.5rem] z-30 mx-auto max-w-md px-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-card p-3 shadow-lg ring-1 ring-black/5">
          <div>
            <p className="text-xs text-muted-foreground">{items} items</p>
            <p className="text-lg font-bold text-foreground">{formatINR(total)}</p>
          </div>
          <button
            type="button"
            onClick={confirm}
            disabled={items === 0}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-40"
          >
            <ShoppingCart className="size-5" />
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}
