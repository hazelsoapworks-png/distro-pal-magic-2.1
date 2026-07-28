import { MapPin } from "lucide-react";
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";

export function DuesLedgerScreen() {
  const { beats, shopsForBeat, duesForBeat, totalOutstanding, navigate } = useStore();
  const beatsWithDues = beats.filter((b) => shopsForBeat(b.id).some((s) => s.dues > 0));

  return (
    <div className="pb-6">
      <AppHeader title="Dues Ledger" subtitle="Outstanding balances by outlet" showBack rounded />

      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-warning-soft p-4 ring-1 ring-warning/20">
          <p className="text-sm text-muted-foreground">Total Outstanding Dues</p>
          <p className="text-2xl font-bold text-warning">{formatINR(totalOutstanding)}</p>
        </div>

        <div className="mt-4 space-y-5">
          {beatsWithDues.map((b) => {
            const shops = shopsForBeat(b.id).filter((s) => s.dues > 0);
            return (
              <div key={b.id}>
                <div className="mb-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate("beatDetail", { beatId: b.id })}
                    className="flex items-center gap-1.5 font-bold text-primary"
                  >
                    <MapPin className="size-4" />
                    {b.name}
                  </button>
                  <span className="text-sm font-semibold text-warning">
                    {formatINR(duesForBeat(b.id))}
                  </span>
                </div>
                <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/5">
                  {shops.map((s, i) => (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between px-4 py-3 ${
                        i > 0 ? "border-t border-black/5" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{s.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{s.owner}</p>
                      </div>
                      <span className="shrink-0 font-bold text-warning">{formatINR(s.dues)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
