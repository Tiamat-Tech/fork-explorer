import { useEffect } from "preact/hooks";
import type { ClientConfig } from "../shared/client-config.ts";
import {
  activePeriod,
  autoRefreshEnabled,
  availablePeriods,
  changeAutoRefreshEnabled,
  changeMonitoringPeriod,
  changeTheme,
  initializeStore,
  Theme,
  theme,
} from "../lib/store.ts";

interface SettingsFormProps {
  autoRefreshInterval: number | null;
  status: ClientConfig["fork"]["status"];
}

export default function SettingsForm(
  { autoRefreshInterval, status }: SettingsFormProps,
) {
  useEffect(() => {
    initializeStore();
  }, []);

  const onChangeTheme = (newTheme: Theme) => {
    changeTheme(newTheme);
  };

  const toggleAutoRefreshEnabled = () => {
    changeAutoRefreshEnabled(!autoRefreshEnabled.value);
  };

  const onChangePeriod = async (selected: "current" | string) => {
    await changeMonitoringPeriod(
      selected === "current" ? selected : Number.parseInt(selected),
    );
  };

  return (
    <div class="settings-container">
      <h2 class="common-header">Settings</h2>

      <div class="settings-group">
        <p class="settings-label text">Theme</p>
        <select
          class="settings-dropdown"
          value={theme.value}
          onChange={(e) =>
            onChangeTheme((e.target as HTMLSelectElement).value as Theme)}
        >
          {Object.values(Theme).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {autoRefreshInterval !== null && (
        <div class="settings-group">
          <p class="settings-label text">
            Auto-fetch blocks (every {autoRefreshInterval}s)
          </p>
          <input
            type="checkbox"
            onChange={toggleAutoRefreshEnabled}
            checked={autoRefreshEnabled.value}
          />
        </div>
      )}

      {availablePeriods.value.length > 0 && (
        <div class="settings-group">
          <p class="settings-label text">Period</p>
          <select
            class="settings-dropdown"
            value={activePeriod.value ?? "current"}
            onChange={(e) =>
              onChangePeriod((e.target as HTMLSelectElement).value)}
          >
            <option value="current">
              {status === "started" ? "Current" : "-"}
            </option>
            {availablePeriods.value.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
