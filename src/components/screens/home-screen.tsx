import { useState } from "react";
import {
  Map,
  Package,
  ReceiptText,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  History,
  Truck // नया आइकॉन Delivery के लिए
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

  const [timeframe, setTimeframe] = useState("Today");
  const timeframes = ["Today", "Yesterday", "This Month", "This Year"];

  const baseCollections = transactions
    .filter((t) => t.type === "collection")
    .reduce((s, t) => s + t.amount, 0);

  let timeframeMultiplier = 1;
  if (timeframe === "Yesterday") timeframeMultiplier = 0.85;
  if (timeframe === "This Month") timeframeMultiplier = 22.5;
  if (timeframe === "This Year") timeframeMultiplier = 250;

  const displaySales = achievedToday * timeframeMultiplier;
  const displayCollections = baseCollections * timeframeMultiplier;

  const pct = Math.min(100, Math.round((achievedToday / dailyTarget) * 100));
  const activeBeats = beats.filter((b) => shopsForBeat(b.id).length > 0);

  return (
    <div className="pb-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <header className="app-safe-top rounded-b-3xl bg-primary px-4 sm:px-6 pb-6 text-primary-foreground shadow-sm">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <p className="text-sm text-primary-foreground/80 truncate">Welcome back,</p>
            <h1 className="text-xl sm:text-2xl font-bold truncate">{profile.name}</h1>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
            <span className="size-2 rounded-full bg-success shadow-[0_0_0_2px_rgba(255,255,255,0.35)]" />
            Online
          </span>
        </div>

        <div className="mt-5 rounded-2xl bg-white/10 p-4 sm:p-5">
          <div className="flex items-center justify-between text-sm sm:text-base">
            <span className="text-primary-foreground/85 font-medium">Daily Target Progress</span>
            <span className="font-bold">{pct}%</span>
          </div>
          <div className="mt-2.5 h-2.5 sm:h-3 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs sm:text-sm text-primary-foreground/90 font-medium">
            <span className="truncate pr-2">Achieved: {formatINR(achievedToday)}</span>
            <span className="truncate">Target: {formatINR(dailyTarget)}</span>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6">
        {/* Business Overview Header & Filter */}
        <div className="mb-4 mt-5 sm:mt-6 flex items-center justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">Overview</h2>
          <div className="relative shrink-0">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="appearance-none rounded-xl bg-card px-3 py-1.5 pr-8 text-sm font-bold text-primary shadow-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              {timeframes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-primary" />
          </div>
        </div>

        {/* Summary cards - Mobile: 2 cols, Tablet: 4 cols */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <SummaryCard
            label={`Sales ${timeframe === "Today" || timeframe === "Yesterday" ? timeframe : ""}`}
            value={formatINR(displaySales)}
            hint="Orders booked"
            icon={<TrendingUp className="size-5 sm:size-6 text-primary" />}
            tint="bg-brand-soft"
            onClick={() => navigate("reports")}
          />
          <SummaryCard
            label={`Collections ${timeframe === "Today" || timeframe === "Yesterday" ? timeframe : ""}`}
            value={formatINR(displayCollections)}
            hint="Payments received"
            icon={<CheckCircle2 className="size-5 sm:size-6 text-success" />}
            tint="bg-success-soft"
            onClick={() => navigate("reports")}
          />
          <SummaryCard
            label="Outstanding Dues"
            value={formatINR(totalOutstanding)}
            hint={`${totalShops} shops total`}
            icon={<ReceiptText className="size-5 sm:size-6 text-warning" />}
            tint="bg-warning-soft"
            onClick={() => navigate("duesLedger")}
          />
          <SummaryCard
            label="Total Beats"
            value={`${beats.length} Beats`}
            hint="Active field areas"
            icon={<Map className="size-5 sm:size-6 text-teal" />}
            tint="bg-brand-soft"
            onClick={() => switchTab("beat")}
          />
        </div>

        {/* Quick actions */}
        <h2 className="mb-3 sm:mb-4 mt-8 sm:mt-10 text-lg sm:text-xl font-bold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <QuickAction
            label="Orders"
            icon={<History className="size-6 sm:size-7" />}
            className="bg-primary text-primary-foreground"
            onClick={() => navigate("ordersHistory")} 
          />
          <QuickAction
            label="Products"
            icon={<Package className="size-6 sm:size-7" />}
            className="bg-teal-600 text-white"
            onClick={() => navigate("products")}
          />
          <QuickAction
            label="Delivery"
            icon={<Truck className="size-6 sm:size-7" />}
            className="bg-warning text-white"
            onClick={() => navigate("deliveryMenu")}
          />
        </div>

        {/* Active distribution beats */}
        <div className="mb-3 sm:mb-4 mt-8 sm:mt-10 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-foreground truncate pr-4">Active Distribution Beats</h2>
          <button
            type="button"
            onClick={() => switchTab("beat")}
            className="text-sm font-semibold text-primary shrink-0 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>
        <div className="-mx-4 sm:-mx-6 flex gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-6 pb-2 pt-1 scrollbar-hide">
          {activeBeats.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => navigate("beatDetail", { beatId: b.id })}
              className="w-56 sm:w-64 shrink-0 rounded-2xl bg-card p-4 sm:p-5 text-left shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md active:scale-95 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-primary text-base sm:text-lg truncate">{b.name}</span>
                  <ChevronRight className="size-5 shrink-0 text-primary" />
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground truncate">{b.area}</p>
              </div>
              <div className="mt-5 flex items-end justify-between border-t border-black/5 pt-3">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground font-medium">Outlets</p>
                  <p className="font-semibold text-foreground truncate mt-0.5">
                    {shopsForBeat(b.id).length} Shops
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground font-medium">Total Dues</p>
                  <p className="font-bold text-warning truncate mt-0.5">{formatINR(duesForBeat(b.id))}</p>
                </div>
              </div>
            </button>
          ))}
          {activeBeats.length === 0 && (
            <div className="w-full py-6 text-center text-sm text-muted-foreground bg-card rounded-2xl ring-1 ring-black/5">
              No active beats available.
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <h2 className="mb-3 sm:mb-4 mt-8 sm:mt-10 text-lg sm:text-xl font-bold text-foreground">
          Recent Transactions
        </h2>
        {/* Tablet: 2 cols */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 sm:gap-4 rounded-2xl bg-card p-4 sm:p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow"
            >
              <span
                className={`flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-full ${
                  t.type === "order" ? "bg-brand-soft text-primary" : "bg-success-soft text-success"
                }`}
              >
                {t.type === "order" ? (
                  <ArrowUpRight className="size-5 sm:size-6" />
                ) : (
                  <CheckCircle2 className="size-5 sm:size-6" />
                )}
              </span>
              <div className="min-w-0 flex-1 pr-2">
                <p className="font-bold text-foreground text-sm sm:text-base truncate">{t.title}</p>
                <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {t.subtitle}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className={`font-bold text-base sm:text-lg ${
                    t.type === "order" ? "text-primary" : "text-success"
                  }`}
                >
                  {formatINR(t.amount)}
                </p>
                <p className="mt-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground">{t.time}</p>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
              No recent transactions.
            </div>
          )}
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
  onClick,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col justify-between w-full text-left rounded-2xl bg-card p-4 sm:p-5 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md active:scale-95 cursor-pointer"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground line-clamp-2">{label}</span>
          <span className={`flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-full ${tint}`}>
            {icon}
          </span>
        </div>
        <p className="mt-3 text-lg sm:text-xl md:text-2xl font-bold leading-tight text-foreground truncate">{value}</p>
      </div>
      <p className="mt-1.5 text-[10px] sm:text-xs font-medium text-muted-foreground truncate">{hint}</p>
    </button>
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
      className={`flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-2xl px-2 py-4 sm:py-5 shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-95 cursor-pointer ${className}`}
    >
      {icon}
      <span className="text-center text-sm sm:text-base font-semibold leading-tight">{label}</span>
    </button>
  );
}