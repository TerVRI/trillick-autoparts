import type { StockStatus } from "@/lib/types";

const labels: Record<StockStatus, string> = {
  in_stock: "In Stock",
  available_to_order: "Available to Order",
  quote_required: "Request Quote",
};

const styles: Record<StockStatus, string> = {
  in_stock: "bg-green-100 text-green-800",
  available_to_order: "bg-amber-100 text-amber-800",
  quote_required: "bg-stone-100 text-stone-600",
};

export function StockBadge({ status }: { status: StockStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
