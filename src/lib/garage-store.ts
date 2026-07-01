"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SavedVehicle } from "./types";

interface GarageState {
  vehicles: SavedVehicle[];
  activeVehicleId: string | null;
  addVehicle: (vehicle: Omit<SavedVehicle, "id">) => void;
  removeVehicle: (id: string) => void;
  setActive: (id: string | null) => void;
  activeVehicle: () => SavedVehicle | null;
}

export const useGarage = create<GarageState>()(
  persist(
    (set, get) => ({
      vehicles: [],
      activeVehicleId: null,
      addVehicle: (vehicle) => {
        const id = crypto.randomUUID();
        set((state) => ({
          vehicles: [...state.vehicles, { ...vehicle, id }],
          activeVehicleId: id,
        }));
      },
      removeVehicle: (id) =>
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id),
          activeVehicleId:
            state.activeVehicleId === id ? null : state.activeVehicleId,
        })),
      setActive: (id) => set({ activeVehicleId: id }),
      activeVehicle: () => {
        const { vehicles, activeVehicleId } = get();
        return vehicles.find((v) => v.id === activeVehicleId) ?? null;
      },
    }),
    { name: "trillick-garage" }
  )
);
