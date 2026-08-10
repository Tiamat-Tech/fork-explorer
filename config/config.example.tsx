import type { SiteConfig } from "../lib/config.ts";

function SoftforkInfo() {
  return (
    <>
      <p class="text">Information about the softfork goes here.</p>
    </>
  );
}

function DeploymentInfo() {
  return (
    <>
      <p class="text">Information about the deployment method goes here.</p>
    </>
  );
}

const siteConfig = {
  fork: {
    info: ["Information shown on the overview and text-only pages."],
  },
  frontend: {
    about: {
      softfork: SoftforkInfo,
      method: {
        title: "Deployment method",
        content: DeploymentInfo,
      },
    },
    sponsors: [],
  },
} satisfies SiteConfig;

export default siteConfig;
