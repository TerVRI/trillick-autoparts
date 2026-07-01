import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";
import type { CartItem, OrderRecord, QuoteRequest, ShippingAddress } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(filename: string, fallback: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function writeJson<T>(filename: string, data: T) {
  ensureDataDir();
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

export function saveOrder(order: Omit<OrderRecord, "id" | "createdAt">): OrderRecord {
  const orders = readJson<OrderRecord[]>("orders.json", []);
  const record: OrderRecord = {
    ...order,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  orders.unshift(record);
  writeJson("orders.json", orders);
  return record;
}

export function updateOrderStatus(stripeSessionId: string, status: string): void {
  const orders = readJson<OrderRecord[]>("orders.json", []);
  const idx = orders.findIndex((o) => o.stripeSessionId === stripeSessionId);
  if (idx >= 0) {
    orders[idx].status = status;
    writeJson("orders.json", orders);
  }
}

export function getOrders(): OrderRecord[] {
  return readJson<OrderRecord[]>("orders.json", []);
}

export function saveQuote(data: {
  partNumbers: string[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message?: string;
  toolContext?: string;
}): string {
  const quotes = readJson<QuoteRequest[]>("quotes.json", []);
  const id = randomUUID();
  quotes.unshift({
    id,
    partNumbers: data.partNumbers,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    message: data.message,
    toolContext: data.toolContext,
    createdAt: new Date().toISOString(),
  });
  writeJson("quotes.json", quotes);
  return id;
}

export function getQuotes(): QuoteRequest[] {
  return readJson<QuoteRequest[]>("quotes.json", []);
}

export type { ShippingAddress };
