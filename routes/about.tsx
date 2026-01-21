import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import config from "../lib/config.ts";
import SiteTitle from "../components/SiteTitle.tsx";
import ContactTwitter from "../components/ContactTwitter.tsx";
import SiteMenu from "../islands/SiteMenu.tsx";
import Donation from "../islands/Donation.tsx";

export default function About() {
  const forkName = config.fork.name;

  return (
    <div class="container">
      <Head>
        <title>{config.fork.name} Activation - About</title>
      </Head>
      <div class="content">
        <SiteTitle />
        <SiteMenu currentPath="/about" />
        <div class="body">
          <div class="info-container">
            <div class="info-section">
              <h2 class="about-header">Information about the softfork {forkName}</h2>
              {config.frontend.about?.softfork?.info?.map((section, i) => (
                <p class="text" key={i}>{section}</p>
              ))}
            </div>
            <div class="info-section">
              <h2 class="about-header">{config.frontend.about?.method?.title}</h2>
              {config.frontend.about?.method?.info?.map((section, i) => (
                <p class="text" key={i}>{section}</p>
              ))}
            </div>
            <div class="info-section">
              <h2 class="about-header">About this site</h2>
              <p class="text">
                <a href="https://github.com/hsjoberg/fork-explorer" target="_blank">
                  fork-explorer
                </a>{" "}
                is an on open-source project. Both this site and the open-source project is developed and maintained by
                Hampus Sjoberg (
                <a href="https://twitter.com/hampus_s" target="_blank">
                  @hampus_s
                </a>
                ).
              </p>
              <p class="text">
                If you enjoy this site, leave a Lightning Network donation below or check out my other project{" "}
                <a href="https://blixtwallet.github.io" target="_blank">
                  Blixt Wallet
                </a>
                , a non-custodial Bitcoin Lightning Wallet!
              </p>
            </div>
          </div>
          {config.frontend.sponsors && config.frontend.sponsors.length > 0 && (
            <div class="sponsor-container">
              <h2 class="about-header">Development Patrons</h2>
              {config.frontend.sponsors?.map((sponsor) => (
                <div class="sponsor-section" key={sponsor.title}>
                  <a class="sponsor" href={sponsor.url} target="_blank">
                    <img class="sponsor-image" src={sponsor.imageUri} alt={sponsor.title} />
                    <p class="sponsor-name">{sponsor.title}</p>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
        <ContactTwitter />
        <Donation />
      </div>
    </div>
  );
}
