import { NextResponse } from "next/server";
import { getOrders, getQuotes } from "@/lib/orders";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("key") || request.headers.get("x-admin-key");
  const adminPass = process.env.ADMIN_PASSWORD || "changeme";

  if (password !== adminPass) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    orders: getOrders(),
    quotes: getQuotes(),
  });
}
