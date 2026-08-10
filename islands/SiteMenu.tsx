import type { ClientConfig } from "../shared/client-config.ts";
import { monitoringMode } from "../lib/store.ts";

interface SiteMenuProps {
  currentPath: string;
  forkName: string;
  status: ClientConfig["fork"]["status"];
}

export default function SiteMenu(
  { currentPath, forkName, status }: SiteMenuProps,
) {
  const showData = !["locked_in", "active"].includes(status) ||
    monitoringMode.value === "historic_period";

  return (
    <div class="menu-container">
      <a href="/" style={{ textDecoration: "none" }}>
        <span class={`menu-item ${currentPath === "/" ? "active" : ""}`}>
          Overview
        </span>
      </a>
      {showData && (
        <a href="/miners" style={{ textDecoration: "none" }}>
          <span
            class={`menu-item ${currentPath === "/miners" ? "active" : ""}`}
          >
            Mining Pools
          </span>
        </a>
      )}
      <a href="/about" style={{ textDecoration: "none" }}>
        <span class={`menu-item ${currentPath === "/about" ? "active" : ""}`}>
          About {forkName}
        </span>
      </a>
      <a href="/settings" style={{ textDecoration: "none" }}>
        <span
          class={`menu-item ${currentPath === "/settings" ? "active" : ""}`}
        >
          Settings
        </span>
      </a>
    </div>
  );
}
