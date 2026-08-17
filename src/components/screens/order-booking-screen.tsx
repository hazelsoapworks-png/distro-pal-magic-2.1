import { useState } from "react";
import { Minus, Plus, ShoppingCart, TrendingUp } from "lucide-react";
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
  // नया स्टेट: सेल्समैन द्वारा टाइप किया गया नया रेट सेव करने के लिए
  const [customPrices, setCustomPrices] = useState<Record<string, string>>({});

  const setValue = (id: string, v: number) =>
    setQty((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(999, v)),
    }));

  // ऑर्डर की लाइन्स कैलकुलेट करना (कस्टम रेट और मार्जिन के साथ)
  const lines = products
    .map((p) => {
      const q = qty[p.id] ?? 0;
      const lastPrice = shop?.lastSellingPrices?.[p.id];
      const defaultPriceVal = lastPrice !== undefined ? lastPrice : p.sellingPrice;
      
      const customVal = customPrices[p.id];
      const finalPrice = customVal !== undefined && customVal !== "" 
        ? Number(customVal) 
        : defaultPriceVal;

      // प्रॉफिट मार्जिन कैलकुलेशन (Selling Price - Purchase Price)
      // (अगर purchasePrice डेटाबेस में नहीं है, तो उसे 0 मानकर कैलकुलेट करेगा)
      const costPrice = (p as any).purchasePrice || 0; 
      const unitMargin = finalPrice - costPrice;
      const lineMargin = unitMargin * q;

      return {
        p,
        q,
        price: finalPrice,
        unitMargin,
        lineMargin,
      };
    })
    .filter((l) => l.q > 0);

  const total = lines.reduce((s, l) => s + l.q * l.price, 0);
  const items = lines.reduce((s, l) => s + l.q, 0);
  const totalMargin = lines.reduce((s, l) => s + l.lineMargin, 0);

  // WhatsApp मैसेज भेजने का फंक्शन
  const sendWhatsApp = (phone: string, text: string) => {
    if (!phone) return;
    const url = `https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const confirm = () => {
    if (!shop || lines.length === 0) return;

    // 1. डेटाबेस में ऑर्डर सेव करें
    placeOrder(
      shop.id,
      lines.map((l) => ({
        productId: l.p.id,
        qty: l.q,
        price: l.price,
      })),
      beat?.name ?? "Beat",
    );

    // 2. WhatsApp Auto-Draft Message तैयार करें
    let msg = `नमस्ते ${shop.name},\nआपका नया ऑर्डर बुक हो गया है:\n\n`;
    lines.forEach((l, index) => {
      msg += `${index + 1}. ${l.p.name} - ${l.q} ${l.p.unit} x ₹${l.price}\n`;
    });
    msg += `\nकुल राशि: ₹${total}\nधन्यवाद!`;

    const phone = (shop as any).whatsapp || shop.phone;
    if (phone) {
      sendWhatsApp(phone, msg);
    }

    // 3. वापस पिछली स्क्रीन पर जाएँ
    goBack();
  };

  return (
    <div className="pb-40 max-w-7xl mx-auto w-full">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-4 sm:px-6 pt-4">
        {products.map((p) => {
          const q = qty[p.id] ?? 0;
          const stock = stockFor(p.id);
          
          const lastPrice = shop?.lastSellingPrices?.[p.id];
          const defaultPriceVal = lastPrice !== undefined ? lastPrice : p.sellingPrice;
          const currentInputValue = customPrices[p.id] !== undefined ? customPrices[p.id] : defaultPriceVal.toString();
          
          // कार्ड पर दिखाने के लिए मार्जिन कैलकुलेशन
          const costPrice = (p as any).purchasePrice || 0;
          const currentUnitMargin = Number(currentInputValue || 0) - costPrice;

          return (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-2xl bg-card p-4 sm:p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow"
            >
              <div>
                {/* प्रोडक्ट की जानकारी */}
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <ProductThumb
                    src={p.imageUrl}
                    name={p.name}
                    className="size-[56px] sm:size-[64px] shrink-0"
                  />

                  <div className="min-w-0 flex-1 pr-1">
                    <p className="font-semibold text-foreground text-base sm:text-lg truncate">
                      {p.name}
                    </p>
                    <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground truncate">
                      {p.code} • per {p.unit}
                    </p>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground truncate">
                      Available Stock:{" "}
                      <span className="font-semibold text-foreground">
                        {stock.available}
                      </span>
                    </p>
                  </div>
                </div>

                {/* पुराने और बेसिक रेट का डिस्प्ले */}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-surface p-3 text-sm sm:text-base">
                  <div>
                    <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground font-medium">Basic Rate</p>
                    <p className="font-bold text-foreground mt-0.5">{formatINR(p.sellingPrice)}</p>
                  </div>
                  {lastPrice !== undefined && (
                    <div className="text-right">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground font-medium">Last Given</p>
                      <p className="font-bold text-primary mt-0.5">{formatINR(lastPrice)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* नया रेट बदलने का बॉक्स और क्वांटिटी */}
              <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
                <div className="flex flex-col">
                  <span className="mb-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Today's Rate (₹)
                  </span>
                  <div className="flex flex-col gap-1">
                    <input
                      inputMode="decimal"
                      type="number"
                      value={currentInputValue}
                      onChange={(e) =>
                        setCustomPrices((prev) => ({
                          ...prev,
                          [p.id]: e.target.value,
                        }))
                      }
                      className="h-9 sm:h-10 w-24 sm:w-28 rounded-lg bg-surface px-2 text-center text-sm sm:text-base font-bold text-foreground outline-none ring-1 ring-black/5 focus:ring-primary/40 transition-shadow"
                    />
                    {/* नया फीचर: हर पीस पर मार्जिन (प्रॉफिट) */}
                    {costPrice > 0 && (
                      <span className={`text-[10px] sm:text-[11px] font-bold ${currentUnitMargin >= 0 ? 'text-success' : 'text-destructive'}`}>
                        Margin: {formatINR(currentUnitMargin)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="mb-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Quantity
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setValue(p.id, q - 1)}
                      aria-label={`Decrease ${p.name}`}
                      className="flex size-9 sm:size-10 items-center justify-center rounded-lg bg-surface text-foreground disabled:opacity-40 cursor-pointer hover:bg-black/5 transition-colors"
                      disabled={q === 0}
                    >
                      <Minus className="size-4 sm:size-5" />
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
                      className="h-9 sm:h-10 w-12 sm:w-14 rounded-lg bg-surface text-center text-base sm:text-lg font-bold text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40 transition-shadow"
                    />

                    <button
                      type="button"
                      onClick={() => setValue(p.id, q + 1)}
                      aria-label={`Increase ${p.name}`}
                      className="flex size-9 sm:size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <Plus className="size-4 sm:size-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Bar */}
      <div className="fixed inset-x-0 bottom-[4.5rem] z-30 mx-auto max-w-2xl px-4 sm:px-6 pointer-events-none">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-card p-3 sm:p-4 shadow-2xl ring-1 ring-black/10 pointer-events-auto">
          <div className="flex flex-col min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">{items} items</p>
              {/* नया फीचर: टोटल मार्जिन */}
              {totalMargin > 0 && (
                <span className="flex items-center gap-1 rounded-md bg-success/10 px-1.5 py-0.5 text-[10px] sm:text-xs font-bold text-success">
                  <TrendingUp className="size-3" /> {formatINR(totalMargin)}
                </span>
              )}
            </div>
            <p className="text-lg sm:text-2xl font-bold text-foreground truncate mt-0.5">
              {formatINR(total)}
            </p>
          </div>

          <button
            type="button"
            onClick={confirm}
            disabled={items === 0}
            className="flex items-center shrink-0 gap-2 rounded-xl bg-primary px-5 py-3 sm:py-3.5 font-semibold text-primary-foreground disabled:opacity-40 cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="size-5" />
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}