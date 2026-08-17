import {
  ReceiptText,
  CheckCircle2,
  ArrowUpRight,
  ArrowLeft,
} from "lucide-react";                                              
import { useStore, formatINR } from "@/lib/store";

export function AccountsScreen() {
  const {
    transactions,
    totalOutstanding,
    navigate,
    goBack,
  } = useStore();

  const collectedToday = transactions
    .filter((t) => t.type === "collection")
    .reduce((s, t) => s + t.amount, 0);
  const orderedToday = transactions
    .filter((t) => t.type === "order")
    .reduce((s, t) => s + t.amount, 0);

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
            <h1 className="text-2xl font-bold truncate">Accounts</h1>
            <p className="mt-0.5 text-sm text-primary-foreground/85 truncate">
              Collections & order activity
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 pt-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-card p-4 sm:p-5 shadow-sm ring-1 ring-black/5 flex flex-col items-start">
            <span className="flex size-10 items-center justify-center rounded-full bg-success-soft shrink-0">
              <CheckCircle2 className="size-5 text-success" />
            </span>
            <p className="mt-3 text-sm text-muted-foreground font-medium">Collected Today</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-success truncate w-full">{formatINR(collectedToday)}</p>
          </div>
          <div className="rounded-2xl bg-card p-4 sm:p-5 shadow-sm ring-1 ring-black/5 flex flex-col items-start">
            <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft shrink-0">
              <ArrowUpRight className="size-5 text-primary" />
            </span>
            <p className="mt-3 text-sm text-muted-foreground font-medium">Orders Booked</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-primary truncate w-full">{formatINR(orderedToday)}</p>
          </div>
        </div>

        {/* Total Outstanding Button */}
        <button
          type="button"
          onClick={() => navigate("duesLedger")}
          className="mt-4 sm:mt-5 flex w-full items-center justify-between rounded-2xl bg-warning-soft p-4 sm:p-5 text-left ring-1 ring-warning/20 cursor-pointer hover:bg-warning/20 transition-colors"
        >
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-warning/15">
              <ReceiptText className="size-6 text-warning" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm sm:text-base truncate">Total Outstanding Dues</p>
              <p className="text-xl sm:text-2xl font-bold text-warning truncate">{formatINR(totalOutstanding)}</p>
            </div>
          </div>
        </button>

        {/* Transaction History */}
        <h2 className="mb-3 mt-8 text-lg sm:text-xl font-bold text-foreground">Transaction History</h2>
        <div className="space-y-3 sm:space-y-4">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 sm:gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow"
            >
              <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-full ${
                  t.type === "order"
                    ? "bg-brand-soft text-primary"
                    : "bg-success-soft text-success"
                }`}
              >
                {t.type === "order" ? (
                  <ArrowUpRight className="size-6" />
                ) : (
                  <CheckCircle2 className="size-6" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground text-sm sm:text-base truncate">{t.title}</p>
                <p className="mt-0.5 text-sm leading-snug text-muted-foreground line-clamp-2">{t.subtitle}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`font-bold text-base sm:text-lg ${t.type === "order" ? "text-primary" : "text-success"}`}>
                  {formatINR(t.amount)}
                </p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">{t.time}</p>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">No transactions found.</p>
          )}
        </div>
      </div>
    </div>
  );
}