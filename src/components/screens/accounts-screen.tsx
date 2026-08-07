import {
  ReceiptText,
  CheckCircle2,
  ArrowUpRight,
  ChevronRight,
  Package,
  Truck,
  FileText,
  ArrowLeft,
} from "lucide-react";                                                         
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";

export function AccountsScreen() {
  const {
  transactions,
  totalOutstanding,
  navigate,
  pendingOrders,
  dispatches,
  goBack,
} = useStore();

  const collectedToday = transactions
    .filter((t) => t.type === "collection")
    .reduce((s, t) => s + t.amount, 0);
  const orderedToday = transactions
    .filter((t) => t.type === "order")
    .reduce((s, t) => s + t.amount, 0);

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
      <h1 className="text-2xl font-bold">Accounts</h1>
      <p className="mt-0.5 text-sm text-primary-foreground/85">
        Collections & order activity
      </p>
    </div>
  </div>
</header>

      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
            <span className="flex size-8 items-center justify-center rounded-full bg-success-soft">
              <CheckCircle2 className="size-5 text-success" />
            </span>
            <p className="mt-2 text-sm text-muted-foreground">Collected Today</p>
            <p className="text-lg font-bold text-success">{formatINR(collectedToday)}</p>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft">
              <ArrowUpRight className="size-5 text-primary" />
            </span>
            <p className="mt-2 text-sm text-muted-foreground">Orders Booked</p>
            <p className="text-lg font-bold text-primary">{formatINR(orderedToday)}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("duesLedger")}
          className="mt-3 flex w-full items-center justify-between rounded-2xl bg-warning-soft p-4 text-left ring-1 ring-warning/20"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-warning/15">
              <ReceiptText className="size-5 text-warning" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Total Outstanding Dues</p>
              <p className="text-lg font-bold text-warning">{formatINR(totalOutstanding)}</p>
            </div>
          </div>
          <ChevronRight className="size-5 text-warning" />
        </button>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate("inventory")}
            className="flex items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-sm ring-1 ring-black/5"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-primary">
              <Package className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Stock & Inventory</p>
              <p className="text-xs text-muted-foreground">Godown levels</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate("pendingOrders")}
            className="flex items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-sm ring-1 ring-black/5"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-warning-soft text-warning">
              <Truck className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Pending Orders</p>
              <p className="text-xs text-muted-foreground">{pendingOrders.length} to deliver</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate("dispatchHistory")}
            className="flex items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-sm ring-1 ring-black/5"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-success-soft text-success">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Dispatch History</p>
              <p className="text-xs text-muted-foreground">{dispatches.length} invoices</p>
            </div>
          </button>
        </div>

        <h2 className="mb-3 mt-6 text-lg font-bold text-foreground">Transaction History</h2>
        <div className="space-y-3">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5"
            >
              <span
                className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full ${
                  t.type === "order"
                    ? "bg-brand-soft text-primary"
                    : "bg-success-soft text-success"
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
                <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{t.subtitle}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`font-bold ${t.type === "order" ? "text-primary" : "text-success"}`}>
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
