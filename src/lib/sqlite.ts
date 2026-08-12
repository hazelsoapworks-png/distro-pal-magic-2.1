import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

class DatabaseService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private dbName: string = 'dpas_sales_data.db';

  async initializeDatabase(): Promise<void> {
    if (this.db) return;
    try {
      const isConnected = await this.sqlite.isConnection(this.dbName, false);
      if (isConnected.result) {
        this.db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1, false);
      } else {
        this.db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1, false);
      }

      await this.db.open();
      await this.createTables();
      console.log('SQLite Database initialized successfully!');
    } catch (error) {
      console.error('Error initializing SQLite database:', error);
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    const schema = `
      CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT);
      CREATE TABLE IF NOT EXISTS beats (id TEXT PRIMARY KEY, data TEXT);
      CREATE TABLE IF NOT EXISTS shops (id TEXT PRIMARY KEY, data TEXT);
      CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, data TEXT);
      CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, data TEXT);
      CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, data TEXT);
      CREATE TABLE IF NOT EXISTS purchase_bills (id TEXT PRIMARY KEY, data TEXT);
      CREATE TABLE IF NOT EXISTS stock_movements (id TEXT PRIMARY KEY, data TEXT);
      CREATE TABLE IF NOT EXISTS dispatches (id TEXT PRIMARY KEY, data TEXT);
    `;
    await this.db.execute(schema);
  }

  // Generic Save / Get methods
  async getTableData(tableName: string): Promise<any[]> {
    if (!this.db) await this.initializeDatabase();
    try {
      const res = await this.db?.query(`SELECT data FROM ${tableName}`);
      return res?.values?.map(row => JSON.parse(row.data)) || [];
    } catch (e) {
      console.error(`Error reading ${tableName}:`, e);
      return [];
    }
  }

  async saveTableData(tableName: string, items: { id: string; [key: string]: any }[]): Promise<void> {
    if (!this.db) await this.initializeDatabase();
    try {
      // Clear and insert or upsert
      await this.db?.run(`DELETE FROM ${tableName}`);
      for (const item of items) {
        const id = item.id;
        const dataStr = JSON.stringify(item);
        await this.db?.run(
          `INSERT OR REPLACE INTO ${tableName} (id, data) VALUES (?, ?)`,
          [id, dataStr]
        );
      }
    } catch (e) {
      console.error(`Error saving ${tableName}:`, e);
    }
  }

  async getMeta(key: string, defaultValue: any): Promise<any> {
    if (!this.db) await this.initializeDatabase();
    try {
      const res = await this.db?.query(`SELECT value FROM kv_store WHERE key = ?`, [key]);
      if (res?.values && res.values.length > 0) {
        return JSON.parse(res.values[0].value);
      }
    } catch (e) {
      console.error(`Error getting meta ${key}:`, e);
    }
    return defaultValue;
  }

  async setMeta(key: string, value: any): Promise<void> {
    if (!this.db) await this.initializeDatabase();
    try {
      const valStr = JSON.stringify(value);
      await this.db?.run(
        `INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)`,
        [key, valStr]
      );
    } catch (e) {
      console.error(`Error setting meta ${key}:`, e);
    }
  }
}

export const dbService = new DatabaseService();