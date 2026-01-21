import { Head } from "$fresh/runtime.ts";
import config from "../lib/config.ts";
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
        <SiteTitle />
        <SiteMenu currentPath="/settings" />
        <div class="body">
          <SettingsForm />
        </div>
        <ContactTwitter />
        <Donation />
      </div>
    </div>
  );
}
