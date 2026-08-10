import { Head } from "$fresh/runtime.ts";
import config, { clientConfig } from "../lib/config.ts";
import SiteTitle from "../components/SiteTitle.tsx";
import ContactTwitter from "../components/ContactTwitter.tsx";
import SiteMenu from "../islands/SiteMenu.tsx";
import SettingsForm from "../islands/SettingsForm.tsx";
import Donation from "../islands/Donation.tsx";

export default function Settings() {
  const forkName = config.fork.name;

  return (
    <div class="container">
      <Head>
        <title>{forkName} activation - Settings</title>
      </Head>
      <div class="content">
        <SiteTitle forkName={clientConfig.fork.name} />
        <SiteMenu
          currentPath="/settings"
          forkName={clientConfig.fork.name}
          status={clientConfig.fork.status}
        />
        <div class="body">
          <SettingsForm
            autoRefreshInterval={clientConfig.frontend.autoRefreshInterval}
            status={clientConfig.fork.status}
          />
        </div>
        <ContactTwitter twitterHandle={clientConfig.frontend.twitterHandle} />
        <Donation donation={clientConfig.donation} />
      </div>
    </div>
  );
}
