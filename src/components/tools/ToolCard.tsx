"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

interface ToolCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  featured?: boolean;
}

export function ToolCard({ href, title, description, icon: Icon, featured }: ToolCardProps) {
  return (
    <Link
      href={href}
      className={`group block rounded-xl border p-5 transition-all hover:border-green-600 hover:shadow-md ${
        featured ? "border-green-200 bg-green-50/50" : "border-gray-200 bg-white"
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className={`rounded-lg p-2 ${featured ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-green-600" />
      </div>
      <h3 className="font-semibold text-gray-900 group-hover:text-green-700">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </Link>
  );
}
