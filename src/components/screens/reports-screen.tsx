import { TrendingUp, ArrowLeft } from "lucide-react";
import { useStore, formatINR } from "@/lib/store";

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
    <div className="pb-6 max-w-7xl mx-auto w-full">
      <header className="app-safe-top rounded-b-3xl bg-primary px-4 sm:px-6 pb-5 text-primary-foreground">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => {
              if (!goBack()) {
                navigate("home");
              }
            }}
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-5" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold truncate">
              Beat Performance & Reports
            </h1>
            <p className="mt-0.5 text-sm text-primary-foreground/85 truncate">
              Daily Analytics Summary
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 pt-4">
        {/* Target vs achievement */}
        <div className="rounded-2xl bg-card p-4 sm:p-5 shadow-sm ring-1 ring-black/5 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <TrendingUp className="size-5 text-primary shrink-0" />
              <h2 className="text-lg font-bold text-foreground truncate">Sales Target vs Achievement</h2>
            </div>
            <span className="text-xl font-bold text-primary shrink-0">{pct}%</span>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-surface">
            <div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-sm text-muted-foreground">
            <span className="truncate pr-2">Achieved: {formatINR(achievedToday)}</span>
            <span className="truncate font-medium text-foreground">Target: {formatINR(dailyTarget)}</span>
          </div>
        </div>

        <h2 className="mb-3.5 text-lg sm:text-xl font-bold text-foreground">Beat-wise Sales Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {beats.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => navigate("beatDetail", { beatId: b.id })}
              className="flex w-full items-start justify-between rounded-2xl bg-card p-4 sm:p-5 text-left shadow-sm ring-1 ring-black/5 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="min-w-0 flex-1 pr-3">
                <p className="font-bold text-primary text-base truncate">{b.name}</p>
                <p className="mt-1 text-sm text-muted-foreground truncate">
                  {shopsForBeat(b.id).length} Outlets in area
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-foreground text-sm sm:text-base whitespace-nowrap">
                  Sales: {formatINR(b.salesToday)}
                </p>
                <p className="mt-1 text-sm font-semibold text-warning whitespace-nowrap">
                  Dues: {formatINR(duesForBeat(b.id))}
                </p>
              </div>
            </button>
          ))}
          {beats.length === 0 && (
            <div className="col-span-full py-10 text-center text-muted-foreground">
              No beats found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}