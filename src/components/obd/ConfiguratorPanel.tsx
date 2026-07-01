"use client";

import { Plus, Trash2 } from "lucide-react";
import { LAND_ROVER_MODELS } from "@/lib/types";
import {
  ENGINE_OPTIONS,
  MOD_CATEGORIES,
  addMaintenanceEntry,
  addModification,
  profileSummary,
} from "@/lib/obd/vehicle-profile";
import type { VehicleProfile } from "@/lib/obd/types";

interface ConfiguratorPanelProps {
  profiles: VehicleProfile[];
  activeProfileId: string | null;
  onSelectProfile: (id: string) => void;
  onAddProfile: () => void;
  onUpdateProfile: (profile: VehicleProfile) => void;
  onRemoveProfile: (id: string) => void;
}

export function ConfiguratorPanel({
  profiles,
  activeProfileId,
  onSelectProfile,
  onAddProfile,
  onUpdateProfile,
  onRemoveProfile,
}: ConfiguratorPanelProps) {
  const profile = profiles.find((p) => p.id === activeProfileId) ?? profiles[0];

  if (!profile) {
    return (
      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <button type="button" onClick={onAddProfile} className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white">
          Create vehicle profile
        </button>
      </section>
    );
  }

  function update(field: Partial<VehicleProfile>) {
    onUpdateProfile({ ...profile, ...field });
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-lg">Car configurator</h2>
        <div className="flex gap-2">
          <select
            value={profile.id}
            onChange={(e) => onSelectProfile(e.target.value)}
            className="rounded-lg border px-2 py-1 text-sm"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <button type="button" onClick={onAddProfile} className="rounded-lg border p-2 hover:bg-stone-50" title="Add profile">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-stone-500">{profileSummary(profile)}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Profile name
          <input
            value={profile.label}
            onChange={(e) => update({ label: e.target.value })}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Model
          <select value={profile.model} onChange={(e) => update({ model: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2">
            {LAND_ROVER_MODELS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </label>
        <label className="text-sm">
          Year
          <input
            type="number"
            value={profile.year}
            onChange={(e) => update({ year: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Engine
          <select value={profile.engine} onChange={(e) => update({ engine: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2">
            {ENGINE_OPTIONS.map((e) => <option key={e}>{e}</option>)}
          </select>
        </label>
        <label className="text-sm">
          Trim
          <input value={profile.trim} onChange={(e) => update({ trim: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="text-sm">
          Fuel type
          <select value={profile.fuelType} onChange={(e) => update({ fuelType: e.target.value as VehicleProfile["fuelType"] })} className="mt-1 w-full rounded-lg border px-3 py-2">
            <option value="diesel">Diesel</option>
            <option value="petrol">Petrol</option>
            <option value="hybrid">Hybrid</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="text-sm">
          Mileage
          <input
            type="number"
            value={profile.mileage ?? ""}
            onChange={(e) => update({ mileage: e.target.value ? Number(e.target.value) : undefined })}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="Optional"
          />
        </label>
        <label className="text-sm">
          VIN
          <input
            value={profile.vin ?? ""}
            onChange={(e) => update({ vin: e.target.value || undefined })}
            className="mt-1 w-full rounded-lg border px-3 py-2 font-mono"
            placeholder="Auto-filled when connected"
          />
        </label>
      </div>

      <div>
        <h3 className="text-sm font-medium">Tyres</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <input
            value={profile.tyres.size}
            onChange={(e) => update({ tyres: { ...profile.tyres, size: e.target.value } })}
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Size"
          />
          <input
            type="number"
            value={profile.tyres.roadPsi}
            onChange={(e) => update({ tyres: { ...profile.tyres, roadPsi: Number(e.target.value) } })}
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Road PSI"
          />
          <input
            type="number"
            value={profile.tyres.offRoadPsi}
            onChange={(e) => update({ tyres: { ...profile.tyres, offRoadPsi: Number(e.target.value) } })}
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Off-road PSI"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Mods & upgrades</h3>
          <button
            type="button"
            onClick={() => onUpdateProfile(addModification(profile, { category: "other", label: "New mod" }))}
            className="text-xs text-amber-700 hover:underline"
          >
            + Add mod
          </button>
        </div>
        <ul className="mt-2 space-y-2">
          {profile.mods.map((mod) => (
            <li key={mod.id} className="flex gap-2">
              <select
                value={mod.category}
                onChange={(e) =>
                  onUpdateProfile({
                    ...profile,
                    mods: profile.mods.map((m) =>
                      m.id === mod.id ? { ...m, category: e.target.value as typeof mod.category } : m,
                    ),
                  })
                }
                className="rounded border px-2 py-1 text-xs"
              >
                {MOD_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <input
                value={mod.label}
                onChange={(e) =>
                  onUpdateProfile({
                    ...profile,
                    mods: profile.mods.map((m) => (m.id === mod.id ? { ...m, label: e.target.value } : m)),
                  })
                }
                className="flex-1 rounded border px-2 py-1 text-sm"
              />
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Maintenance history</h3>
          <button
            type="button"
            onClick={() =>
              onUpdateProfile(
                addMaintenanceEntry(profile, {
                  date: new Date().toISOString().slice(0, 10),
                  title: "Service entry",
                }),
              )
            }
            className="text-xs text-amber-700 hover:underline"
          >
            + Add entry
          </button>
        </div>
        <ul className="mt-2 space-y-2">
          {profile.maintenance.map((entry) => (
            <li key={entry.id} className="grid gap-2 sm:grid-cols-3">
              <input
                type="date"
                value={entry.date}
                onChange={(e) =>
                  onUpdateProfile({
                    ...profile,
                    maintenance: profile.maintenance.map((m) =>
                      m.id === entry.id ? { ...m, date: e.target.value } : m,
                    ),
                  })
                }
                className="rounded border px-2 py-1 text-sm"
              />
              <input
                value={entry.title}
                onChange={(e) =>
                  onUpdateProfile({
                    ...profile,
                    maintenance: profile.maintenance.map((m) =>
                      m.id === entry.id ? { ...m, title: e.target.value } : m,
                    ),
                  })
                }
                className="rounded border px-2 py-1 text-sm sm:col-span-2"
              />
            </li>
          ))}
        </ul>
      </div>

      <textarea
        rows={2}
        value={profile.notes ?? ""}
        onChange={(e) => update({ notes: e.target.value })}
        placeholder="Notes — planned upgrades, known issues…"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />

      {profiles.length > 1 && (
        <button
          type="button"
          onClick={() => onRemoveProfile(profile.id)}
          className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline"
        >
          <Trash2 className="h-4 w-4" />
          Remove profile
        </button>
      )}
    </section>
  );
}
