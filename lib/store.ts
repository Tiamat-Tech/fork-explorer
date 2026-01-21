import { signal } from "@preact/signals";
import { clientConfig } from "../shared/client-config.ts";
import type { IBlock } from "../shared/interfaces.ts";

// Theme enum
export enum Theme {
  "default" = "default",
  "colorblind" = "colorblind",
  "saltyroger" = "saltyroger",
}

type MonitoringMode = "current_period" | "historic_period";

// Store state using signals
export const blocks = signal<IBlock[]>([]);
export const availablePeriods = signal<number[]>([]);
export const activePeriod = signal<number | null>(null);
export const monitoringMode = signal<MonitoringMode>("current_period");
export const theme = signal<Theme>(Theme.default);
export const autoRefreshEnabled = signal<boolean>(true);

// Actions
export async function initializeStore() {
  console.log("Initializing store");
  // Load theme from localStorage
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme && Object.values(Theme).includes(savedTheme)) {
      theme.value = savedTheme;
      document.documentElement.setAttribute("data-theme", savedTheme);
    }

    const savedAutoRefresh = localStorage.getItem("autoRefreshEnabled");
    if (savedAutoRefresh !== null) {
      autoRefreshEnabled.value = JSON.parse(savedAutoRefresh);
    }
  }

  // Fetch available periods
  try {
    const periodsResult = await fetch("/api/periods");
    const periods: number[] = await periodsResult.json();
    availablePeriods.value = periods;
  } catch (e) {
    console.error("Failed to fetch periods", e);
  }
}

export async function fetchBlocks() {
  try {
    const result = await fetch("/api/blocks");
    const json = (await result.json()) as IBlock[];
    blocks.value = json;
  } catch (e) {
    console.error("Failed to fetch blocks", e);
  }
}

export async function fetchPeriod(period: number) {
  try {
    const result = await fetch(`/api/period/${period}`);
    const json = (await result.json()) as IBlock[];
    blocks.value = json;
  } catch (e) {
    console.error("Failed to fetch period", e);
  }
}

export async function changeMonitoringPeriod(period: number | "current") {
  if (period !== "current") {
    await fetchPeriod(period);
    monitoringMode.value = "historic_period";
  } else {
    await fetchBlocks();
    monitoringMode.value = "current_period";
  }
  activePeriod.value = period === "current" ? null : period;
}

export function startAutoRefresh() {
  if (!clientConfig.frontend.autoRefreshInterval || monitoringMode.value === "historic_period") {
    return;
  }

  setInterval(async () => {
    console.log("Auto refresh interval");
    if (!autoRefreshEnabled.value || monitoringMode.value === "historic_period") {
      return;
    }
    try {
      const result = await fetch("/api/blocks");
      const json = (await result.json()) as IBlock[];
      if (json && json.length === 0) {
        console.log("Got empty response from /blocks, ignoring...");
        return;
      }
      blocks.value = json;
    } catch (error) {
      console.log("Couldn't fetch /blocks", (error as Error).message);
    }
  }, clientConfig.frontend.autoRefreshInterval * 1000);
}

export function changeTheme(newTheme: Theme) {
  theme.value = newTheme;
  if (typeof window !== "undefined") {
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }
}

export function changeAutoRefreshEnabled(enabled: boolean) {
  autoRefreshEnabled.value = enabled;
  if (typeof window !== "undefined") {
    localStorage.setItem("autoRefreshEnabled", JSON.stringify(enabled));
  }
}
