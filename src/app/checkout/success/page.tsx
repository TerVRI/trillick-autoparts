import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-bold uppercase text-green-800 mb-4">
        Order Confirmed
      </h1>
      <p className="text-stone-600 mb-6">
        Thank you for your order. We&apos;ll process it shortly and send a confirmation email.
      </p>
      <Link href="/britpart" className="rounded-lg bg-amber-600 px-6 py-3 text-white font-medium hover:bg-amber-700">
        Continue Shopping
      </Link>
    </div>
  );
}
