import { NextResponse } from "next/server";
import { getStripe, SITE_URL } from "@/lib/stripe";
import { saveOrder } from "@/lib/orders";
import { calculateShipping } from "@/lib/shipping";
import type { CartItem, ShippingAddress } from "@/lib/types";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY in environment." },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { items, shipping } = body as {
    items: CartItem[];
    shipping: ShippingAddress;
  };

  if (!items?.length || !shipping?.email && !shipping?.name) {
    return NextResponse.json({ error: "Invalid checkout data" }, { status: 400 });
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = calculateShipping(subtotal, shipping.country);
  const total = subtotal + shippingCost;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    currency: "gbp",
    customer_email: shipping.email || undefined,
    line_items: [
      ...items.map((item) => ({
        price_data: {
          currency: "gbp",
          product_data: {
            name: `${item.partNumber} - ${item.title}`,
            images: item.imageUrl ? [item.imageUrl] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      ...(shippingCost > 0
        ? [
            {
              price_data: {
                currency: "gbp",
                product_data: { name: "Shipping" },
                unit_amount: Math.round(shippingCost * 100),
              },
              quantity: 1,
            },
          ]
        : []),
    ],
    success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/cart`,
    metadata: {
      customer_name: shipping.name,
    },
  });

  saveOrder({
    stripeSessionId: session.id,
    status: "pending",
    customerEmail: shipping.email || "",
    customerName: shipping.name,
    shipping,
    items,
    subtotal,
    shippingCost,
    total,
  });

  return NextResponse.json({ url: session.url });
}
