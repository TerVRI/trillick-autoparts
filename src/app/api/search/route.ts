import { NextResponse } from "next/server";
import { searchProducts, getAllProducts, filterByVehicle } from "@/lib/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const vehicle = searchParams.get("vehicle") || "";

  let results = q.trim()
    ? searchProducts(q, limit)
    : getAllProducts().slice(0, limit);

  if (vehicle) {
    results = filterByVehicle(results, vehicle);
  }

  return NextResponse.json({ results });
}
