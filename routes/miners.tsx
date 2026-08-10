import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import config, { clientConfig } from "../lib/config.ts";
import { getBlocks } from "../lib/blocks/index.ts";
import type { IBlock } from "../shared/interfaces.ts";
import SiteTitle from "../components/SiteTitle.tsx";
import ContactTwitter from "../components/ContactTwitter.tsx";
import SiteMenu from "../islands/SiteMenu.tsx";
import MinersTable from "../islands/MinersTable.tsx";
import Donation from "../islands/Donation.tsx";

interface Data {
  blocks: IBlock[];
}

export const handler: Handlers<Data> = {
  GET(_req, ctx) {
    const blocks = getBlocks();
    return ctx.render({ blocks });
  },
};

export default function Miners({ data }: PageProps<Data>) {
  const { blocks } = data;
  const forkName = config.fork.name;

  return (
    <div class="container">
      <Head>
        <title>{forkName} activation - Miners</title>
      </Head>
      <div class="content">
        <SiteTitle forkName={clientConfig.fork.name} />
        <SiteMenu
          currentPath="/miners"
          forkName={clientConfig.fork.name}
          status={clientConfig.fork.status}
        />
        <MinersTable
          initialBlocks={blocks}
          threshold={clientConfig.fork.threshold}
        />
        <ContactTwitter twitterHandle={clientConfig.frontend.twitterHandle} />
        <Donation donation={clientConfig.donation} />
      </div>
    </div>
  );
}
