"use client";

import { useGarage } from "@/lib/garage-store";
import { LAND_ROVER_MODELS } from "@/lib/types";
import { Car, X } from "lucide-react";
import { useState } from "react";

export function VehicleSelector({ compact = false }: { compact?: boolean }) {
  const { vehicles, activeVehicleId, addVehicle, removeVehicle, setActive, activeVehicle } = useGarage();
  const [showAdd, setShowAdd] = useState(false);
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  const active = activeVehicle();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!model) return;
    addVehicle({ label: year ? `${year} ${model}` : model, model, year: year || undefined });
    setModel("");
    setYear("");
    setShowAdd(false);
  }

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Car className="h-4 w-4 text-amber-700" />
        <span className="font-medium text-stone-700">My Garage:</span>
        {active ? (
          <span className="rounded-full bg-amber-100 px-3 py-0.5 text-amber-900">{active.label}</span>
        ) : (
          <span className="text-stone-500">No vehicle selected</span>
        )}
        <select
          value={activeVehicleId || ""}
          onChange={(e) => setActive(e.target.value || null)}
          className="rounded border border-stone-300 px-2 py-1 text-sm"
        >
          <option value="">All vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="text-amber-700 hover:underline"
        >
          + Add vehicle
        </button>
        {showAdd && (
          <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2 w-full mt-2">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              className="rounded border border-stone-300 px-2 py-1"
            >
              <option value="">Select model</option>
              {LAND_ROVER_MODELS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Year (optional)"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-24 rounded border border-stone-300 px-2 py-1"
            />
            <button type="submit" className="rounded bg-amber-600 px-3 py-1 text-white text-sm">Save</button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
        <Car className="h-5 w-5" /> My Garage
      </h3>
      {vehicles.length === 0 ? (
        <p className="text-sm text-stone-500 mb-3">Save your Land Rover to filter compatible parts.</p>
      ) : (
        <ul className="space-y-2 mb-3">
          {vehicles.map((v) => (
            <li key={v.id} className="flex items-center justify-between rounded bg-stone-50 px-3 py-2">
              <button
                type="button"
                onClick={() => setActive(v.id)}
                className={`text-sm ${activeVehicleId === v.id ? "font-semibold text-amber-800" : ""}`}
              >
                {v.label}
              </button>
              <button type="button" onClick={() => removeVehicle(v.id)} aria-label="Remove">
                <X className="h-4 w-4 text-stone-400 hover:text-red-500" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
        <select value={model} onChange={(e) => setModel(e.target.value)} required className="flex-1 rounded border px-3 py-2 text-sm">
          <option value="">Select Land Rover model</option>
          {LAND_ROVER_MODELS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input type="text" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} className="w-24 rounded border px-3 py-2 text-sm" />
        <button type="submit" className="rounded bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700">Add</button>
      </form>
    </div>
  );
}
