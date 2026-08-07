import { TrendingUp, ArrowLeft } from "lucide-react";
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";

export function ReportsScreen() {
  const {
  beats,
  achievedToday,
  dailyTarget,
  shopsForBeat,
  duesForBeat,
  navigate,
  goBack,
} = useStore();
  const pct = Math.min(100, Math.round((achievedToday / dailyTarget) * 100));

  return (
    <div className="pb-6">
      <header className="app-safe-top rounded-b-3xl bg-primary px-4 pb-5 text-primary-foreground">
  <div className="flex items-start gap-3">
    <button
      type="button"
      onClick={() => {
        if (!goBack()) {
          navigate("home");
        }
      }}
      className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
    >
      <ArrowLeft className="size-5" />
    </button>

    <div>
      <h1 className="text-2xl font-bold">
        Beat Performance & Reports
      </h1>

      <p className="mt-0.5 text-sm text-primary-foreground/85">
        Daily Analytics Summary
      </p>
    </div>
  </div>
</header>

      <div className="px-4 pt-4">
        {/* Target vs achievement */}
        <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Sales Target vs Achievement</h2>
            </div>
            <span className="text-xl font-bold text-primary">{pct}%</span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-surface">
            <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>Achieved: {formatINR(achievedToday)}</span>
            <span>Target: {formatINR(dailyTarget)}</span>
          </div>
        </div>

        <h2 className="mb-3 mt-6 text-lg font-bold text-foreground">Beat-wise Sales Distribution</h2>
        <div className="space-y-3">
          {beats.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => navigate("beatDetail", { beatId: b.id })}
              className="flex w-full items-start justify-between rounded-2xl bg-card p-4 text-left shadow-sm ring-1 ring-black/5"
            >
              <div>
                <p className="font-bold text-primary">{b.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {shopsForBeat(b.id).length} Outlets in area
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  Sales Today: {formatINR(b.salesToday)}
                </p>
                <p className="mt-1 text-sm font-semibold text-warning">
                  Dues: {formatINR(duesForBeat(b.id))}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
