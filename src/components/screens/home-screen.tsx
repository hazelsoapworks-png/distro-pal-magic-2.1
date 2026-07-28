import {
  Map,
  Package,
  ReceiptText,
  TrendingUp,
  Wallet,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { useStore, formatINR } from "@/lib/store";

export function HomeScreen() {
  const {
    profile,
    achievedToday,
    dailyTarget,
    totalOutstanding,
    totalShops,
    beats,
    transactions,
    navigate,
    switchTab,
    duesForBeat,
    shopsForBeat,
  } = useStore();

  const collectionsToday = transactions
    .filter((t) => t.type === "collection")
    .reduce((s, t) => s + t.amount, 0);
  const pct = Math.min(100, Math.round((achievedToday / dailyTarget) * 100));
  const activeBeats = beats.filter((b) => shopsForBeat(b.id).length > 0);

  return (
    <div className="pb-6">
      {/* Header */}
      <header className="rounded-b-3xl bg-primary px-4 pb-6 pt-5 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-foreground/80">Welcome back,</p>
            <h1 className="text-xl font-bold">{profile.name}</h1>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
            <span className="size-2 rounded-full bg-success shadow-[0_0_0_2px_rgba(255,255,255,0.35)]" />
            Online
          </span>
        </div>

        <div className="mt-4 rounded-2xl bg-white/10 p-3.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-primary-foreground/85">Daily Target Progress</span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-success"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-primary-foreground/85">
            <span>Achieved: {formatINR(achievedToday)}</span>
            <span>Target: {formatINR(dailyTarget)}</span>
          </div>
        </div>
      </header>

      <div className="px-4">
        {/* Summary cards */}
        <div className="-mt-4 grid grid-cols-2 gap-3">
          <SummaryCard
            label="Sales Today"
            value={formatINR(achievedToday)}
            hint="Orders booked"
            icon={<TrendingUp className="size-5 text-primary" />}
            tint="bg-brand-soft"
          />
          <SummaryCard
            label="Collections Today"
            value={formatINR(collectionsToday)}
            hint="Payments received"
            icon={<CheckCircle2 className="size-5 text-success" />}
            tint="bg-success-soft"
          />
          <SummaryCard
            label="Outstanding Dues"
            value={formatINR(totalOutstanding)}
            hint={`${totalShops} shops total`}
            icon={<ReceiptText className="size-5 text-warning" />}
            tint="bg-warning-soft"
          />
          <SummaryCard
            label="Total Beats"
            value={`${beats.length} Beats`}
            hint="Active field areas"
            icon={<Map className="size-5 text-teal" />}
            tint="bg-brand-soft"
          />
        </div>

        {/* Quick actions */}
        <h2 className="mb-3 mt-6 text-lg font-bold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <QuickAction
            label="Manage Beats"
            icon={<Map className="size-6" />}
            className="bg-primary text-primary-foreground"
            onClick={() => switchTab("beat")}
          />
          <QuickAction
            label="Products"
            icon={<Package className="size-6" />}
            className="bg-teal text-white"
            onClick={() => navigate("products")}
          />
          <QuickAction
            label="Dues Ledger"
            icon={<ReceiptText className="size-6" />}
            className="bg-warning text-white"
            onClick={() => navigate("duesLedger")}
          />
        </div>

        {/* Active distribution beats */}
        <div className="mb-3 mt-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Active Distribution Beats</h2>
          <button
            type="button"
            onClick={() => switchTab("beat")}
            className="text-sm font-semibold text-primary"
          >
            View All
          </button>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {activeBeats.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => navigate("beatDetail", { beatId: b.id })}
              className="w-56 shrink-0 rounded-2xl bg-card p-4 text-left shadow-sm ring-1 ring-black/5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">{b.name}</span>
                <ChevronRight className="size-5 text-primary" />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{b.area}</p>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Outlets</p>
                  <p className="font-semibold text-foreground">
                    {shopsForBeat(b.id).length} Shops
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Dues</p>
                  <p className="font-bold text-warning">{formatINR(duesForBeat(b.id))}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Recent transactions */}
        <h2 className="mb-3 mt-6 text-lg font-bold text-foreground">
          Recent Transactions Today
        </h2>
        <div className="space-y-3">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5"
            >
              <span
                className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full ${
                  t.type === "order" ? "bg-brand-soft text-primary" : "bg-success-soft text-success"
                }`}
              >
                {t.type === "order" ? (
                  <ArrowUpRight className="size-5" />
                ) : (
                  <CheckCircle2 className="size-5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{t.title}</p>
                <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                  {t.subtitle}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className={`font-bold ${
                    t.type === "order" ? "text-primary" : "text-success"
                  }`}
                >
                  {formatINR(t.amount)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  icon,
  tint,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tint: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={`flex size-8 items-center justify-center rounded-full ${tint}`}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-lg font-bold leading-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function QuickAction({
  label,
  icon,
  className,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl px-2 py-4 shadow-sm transition-transform active:scale-95 ${className}`}
    >
      {icon}
      <span className="text-center text-sm font-semibold leading-tight">{label}</span>
    </button>
  );
}
