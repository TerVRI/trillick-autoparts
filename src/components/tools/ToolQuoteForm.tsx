"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface ToolQuoteFormProps {
  toolContext: string;
  summary?: string;
  partNumbers?: string[];
}

export function ToolQuoteForm({ toolContext, summary, partNumbers = [] }: ToolQuoteFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(summary ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partNumbers: partNumbers.length ? partNumbers : ["QUOTE-FROM-TOOL"],
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          message,
          toolContext,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <section className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-semibold text-green-800">Quote request sent!</p>
        <p className="mt-1 text-sm text-green-700">We&apos;ll get back to you with pricing and availability.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-1 text-lg font-semibold text-gray-900">Send to Trillick for Pricing</h2>
      <p className="mb-4 text-sm text-gray-600">Share your results and we&apos;ll quote the parts you need.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <input required type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <input type="tel" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <textarea rows={4} placeholder="Notes about your setup..." value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <button type="submit" disabled={status === "loading"} className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">
          <Send className="h-4 w-4" />
          {status === "loading" ? "Sending..." : "Request Quote"}
        </button>
        {status === "error" && <p className="text-sm text-red-600">Something went wrong. Please try again or call us.</p>}
      </form>
    </section>
  );
}
