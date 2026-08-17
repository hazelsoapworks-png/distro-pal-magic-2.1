import { MapPin } from "lucide-react";
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";

export function DuesLedgerScreen() {
  const { beats, shopsForBeat, duesForBeat, totalOutstanding, navigate } = useStore();
  const beatsWithDues = beats.filter((b) => shopsForBeat(b.id).some((s) => s.dues > 0));

  return (
    <div className="pb-6 max-w-7xl mx-auto w-full">
      <AppHeader title="Dues Ledger" subtitle="Outstanding balances by outlet" showBack rounded />

      <div className="px-4 sm:px-6 pt-4">
        {/* Total Dues Summary */}
        <div className="rounded-2xl bg-warning-soft p-4 sm:p-5 ring-1 ring-warning/20 shadow-sm">
          <p className="text-sm sm:text-base text-muted-foreground font-medium">Total Outstanding Dues</p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold text-warning truncate">{formatINR(totalOutstanding)}</p>
        </div>

        {/* Beats Grid */}
        <div className="mt-5 sm:mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
          {beatsWithDues.map((b) => {
            const shops = shopsForBeat(b.id).filter((s) => s.dues > 0);
            return (
              <div key={b.id} className="flex flex-col">
                <div className="mb-2.5 flex items-center justify-between gap-3 px-1">
                  <button
                    type="button"
                    onClick={() => navigate("beatDetail", { beatId: b.id })}
                    className="flex items-center gap-1.5 font-bold text-primary cursor-pointer hover:text-primary/80 hover:underline underline-offset-2 transition-all min-w-0"
                  >
                    <MapPin className="size-4 shrink-0" />
                    <span className="truncate">{b.name}</span>
                  </button>
                  <span className="text-sm font-semibold text-warning shrink-0 bg-warning/10 px-2 py-0.5 rounded-md">
                    {formatINR(duesForBeat(b.id))}
                  </span>
                </div>
                
                <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/5">
                  {shops.map((s, i) => (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between px-4 py-3 sm:p-4 hover:bg-surface transition-colors ${
                        i > 0 ? "border-t border-black/5" : ""
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <p className="truncate font-semibold text-foreground text-sm sm:text-base">{s.name}</p>
                        <p className="truncate text-xs sm:text-sm text-muted-foreground mt-0.5">{s.owner}</p>
                      </div>
                      <span className="shrink-0 font-bold text-warning">{formatINR(s.dues)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {beatsWithDues.length === 0 && (
            <div className="col-span-full py-10 text-center text-muted-foreground">
              No outstanding dues across any active beats! 🎉
            </div>
          )}
        </div>
      </div>
    </div>
  );
}