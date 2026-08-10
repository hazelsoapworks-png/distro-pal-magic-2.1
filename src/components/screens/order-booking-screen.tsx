import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { ProductThumb } from "@/components/product-thumb";

export function OrderBookingScreen({
  shopId,
  beatId,
}: {
  shopId?: string;
  beatId?: string;
}) {
  const { shops, beats, products, placeOrder, goBack, stockFor } = useStore();

  const shop = shops.find((s) => s.id === shopId);
  const beat = beats.find((b) => b.id === beatId);

  const [qty, setQty] = useState<Record<string, number>>({});

  const setValue = (id: string, v: number) =>
    setQty((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(999, v)),
    }));

  const getSellingPrice = (productId: string, defaultPrice: number) => {
    return shop?.lastSellingPrices?.[productId] ?? defaultPrice;
  };

  const lines = products
    .map((p) => {
      const price = getSellingPrice(p.id, p.sellingPrice);
      return {
        p,
        q: qty[p.id] ?? 0,
        price,
      };
    })
    .filter((l) => l.q > 0);

  const total = lines.reduce((s, l) => s + l.q * l.price, 0);
  const items = lines.reduce((s, l) => s + l.q, 0);

  const confirm = () => {
    if (!shop || lines.length === 0) return;

    placeOrder(
      shop.id,
      lines.map((l) => ({
        productId: l.p.id,
        qty: l.q,
        price: l.price,
        buyingPrice: l.p.buyingPrice,
      })),
      beat?.name ?? "Beat",
    );

    goBack();
  };

  return (
    <div className="pb-40">
      <AppHeader
        title="Book Order"
        subtitle={
          shop
            ? `${shop.name}${beat ? ` • ${beat.name}` : ""}`
            : "Order booking"
        }
        showBack
        rounded
      />

      <div className="space-y-3 px-4 pt-4">
        {products.map((p) => {
          const q = qty[p.id] ?? 0;
          const stock = stockFor(p.id);
          const currentPrice = getSellingPrice(p.id, p.sellingPrice);
          const lastPrice = shop?.lastSellingPrices?.[p.id];

          // Profit in Rupees calculation based on selected quantity
          const buyingPrice = p.buyingPrice || 0;
          const profitPerItem = currentPrice - buyingPrice;
          const totalProfitForProduct = q > 0 ? profitPerItem * q : profitPerItem; // Shows item unit profit or total if quantity selected

          return (
            <div
              key={p.id}
              className="relative rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5"
            >
              {/* Direct Profit Badge in Rupees (No header, clean figure) */}
              {buyingPrice > 0 && (
                <div className="absolute right-4 top-4 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-bold text-success">
                  {formatINR(totalProfitForProduct)}
                  {q === 0 ? " /pc" : ""}
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3 flex-1">
                  <ProductThumb
                    src={p.imageUrl}
                    name={p.name}
                    className="size-[56px] shrink-0"
                  />

                  <div className="min-w-0 flex-1 pr-16">
                    <p className="font-semibold text-foreground text-base">
                      {p.name}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-bold text-primary">
                        {formatINR(currentPrice)} / {p.unit}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • {p.code}
                      </span>
                    </div>

                    {lastPrice !== undefined && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Last given price:{" "}
                        <span className="font-medium text-foreground">
                          {formatINR(lastPrice)}
                        </span>
                      </p>
                    )}

                    <p className="mt-1 text-xs text-muted-foreground">
                      Available Stock:{" "}
                      <span className="font-semibold text-foreground">
                        {stock.available}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantity Selector Section */}
              <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Quantity
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setValue(p.id, q - 1)}
                    aria-label={`Decrease ${p.name}`}
                    className="flex size-9 items-center justify-center rounded-xl bg-surface text-foreground disabled:opacity-40"
                    disabled={q === 0}
                  >
                    <Minus className="size-4" />
                  </button>

                  <input
                    inputMode="numeric"
                    value={q}
                    onChange={(e) =>
                      setValue(
                        p.id,
                        Number(e.target.value.replace(/\D/g, "")) || 0,
                      )
                    }
                    aria-label={`${p.name} quantity`}
                    className="h-9 w-14 rounded-xl bg-surface text-center text-base font-bold text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40"
                  />

                  <button
                    type="button"
                    onClick={() => setValue(p.id, q + 1)}
                    aria-label={`Increase ${p.name}`}
                    className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-[4.5rem] z-30 mx-auto max-w-md px-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-card p-3 shadow-lg ring-1 ring-black/5">
          <div>
            <p className="text-xs text-muted-foreground">{items} items</p>
            <p className="text-lg font-bold text-foreground">
              {formatINR(total)}
            </p>
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
