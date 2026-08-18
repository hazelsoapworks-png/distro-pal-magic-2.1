import { dbService } from "./sqlite";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import type { Profile, Beat, Shop, Product, Transaction, Order, PurchaseBill, StockMovement, DispatchRecord } from "./types";

export interface AppStateData {
  profile: Profile;
  dailyTarget: number;
  beats: Beat[];
  shops: Shop[];
  products: Product[];
  transactions: Transaction[];
  orders: Order[];
  purchaseBills: PurchaseBill[];
  stockMovements: StockMovement[];
  dispatches: DispatchRecord[];
  syncEnabled: boolean;
  googleEmail?: string;
}

export async function loadState(defaults: AppStateData): Promise<AppStateData> {
  try {
    await dbService.initializeDatabase();

    const beats = await dbService.getTableData("beats");
    const shops = await dbService.getTableData("shops");
    const products = await dbService.getTableData("products");
    const transactions = await dbService.getTableData("transactions");
    const orders = await dbService.getTableData("orders");
    const purchaseBills = await dbService.getTableData("purchase_bills");
    const stockMovements = await dbService.getTableData("stock_movements");
    const dispatches = await dbService.getTableData("dispatches");

    const profile = await dbService.getMeta("profile", defaults.profile);
    const dailyTarget = await dbService.getMeta("dailyTarget", defaults.dailyTarget);
    const syncEnabled = await dbService.getMeta("syncEnabled", defaults.syncEnabled);
    const googleEmail = await dbService.getMeta("googleEmail", defaults.googleEmail ?? "");

    if (beats.length === 0 && shops.length === 0 && products.length === 0) {
      await saveState(defaults);
      return defaults;
    }

    return {
      profile,
      dailyTarget,
      beats: beats.length > 0 ? beats : defaults.beats,
      shops: shops.length > 0 ? shops : defaults.shops,
      products: products.length > 0 ? products : defaults.products,
      transactions: transactions.length > 0 ? transactions : defaults.transactions,
      orders: orders.length > 0 ? orders : defaults.orders,
      purchaseBills: purchaseBills.length > 0 ? purchaseBills : defaults.purchaseBills,
      stockMovements: stockMovements.length > 0 ? stockMovements : defaults.stockMovements,
      dispatches: dispatches.length > 0 ? dispatches : defaults.dispatches,
      syncEnabled,
      googleEmail,
    };
  } catch (error) {
    console.error("Failed to load state from SQLite, falling back to defaults:", error);
    return defaults;
  }
}

export async function saveState(state: AppStateData): Promise<void> {
  try {
    await dbService.initializeDatabase();

    // 1. SQLite डेटाबेस में सेव करें
    await Promise.all([
      dbService.saveTableData("beats", state.beats),
      dbService.saveTableData("shops", state.shops),
      dbService.saveTableData("products", state.products),
      dbService.saveTableData("transactions", state.transactions),
      dbService.saveTableData("orders", state.orders),
      dbService.saveTableData("purchase_bills", state.purchaseBills),
      dbService.saveTableData("stock_movements", state.stockMovements),
      dbService.saveTableData("dispatches", state.dispatches),
      dbService.setMeta("profile", state.profile),
      dbService.setMeta("dailyTarget", state.dailyTarget),
      dbService.setMeta("syncEnabled", state.syncEnabled),
      dbService.setMeta("googleEmail", state.googleEmail),
    ]);

    // 2. फोन के फाइल मैनेजर (Documents/DPAS/data.json) में भी बैकअप फाइल सेव करें
    try {
      await Filesystem.writeFile({
        path: "DPAS/data.json",
        data: JSON.stringify(state, null, 2),
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
        recursive: true,
      });
    } catch (fsError) {
      console.error("Failed to write DPAS backup file to filesystem:", fsError);
    }

  } catch (error) {
    console.error("Failed to save state to SQLite:", error);
  }
}