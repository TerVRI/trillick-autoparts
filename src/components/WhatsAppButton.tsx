"use client";

import { MessageCircle } from "lucide-react";

const PHONE = process.env.NEXT_PUBLIC_WHATSAPP || "442889561897";

export function WhatsAppButton({ message }: { message?: string }) {
  const text = encodeURIComponent(
    message || "Hello, I have a question about Land Rover parts from your website."
  );
  return (
    <a
      href={`https://wa.me/${PHONE}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#1da851]"
    >
      <MessageCircle className="h-4 w-4" />
      WhatsApp Us
    </a>
  );
}
