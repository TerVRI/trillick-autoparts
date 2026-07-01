import { NextResponse } from "next/server";
import { saveQuote } from "@/lib/orders";

export async function POST(request: Request) {
  const body = await request.json();
  const { partNumbers, customerName, customerEmail, customerPhone, message, toolContext } = body;

  if (!partNumbers?.length || !customerName || !customerEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = saveQuote({
    partNumbers,
    customerName,
    customerEmail,
    customerPhone,
    message,
    toolContext,
  });

  return NextResponse.json({ id, success: true });
}
