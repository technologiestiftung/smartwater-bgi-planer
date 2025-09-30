import { AppStoreState } from "@/types/app";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAppStore = create<AppStoreState>()(
  persist(
    () => ({
      welcome: "Willkommen beim Smartwater BGI Planer",
    }),
    {
      name: "app-storage",
    }
  )
);
