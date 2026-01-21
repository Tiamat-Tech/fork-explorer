import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import config from "../../lib/config.ts";
import { getBlocks } from "../../lib/blocks/index.ts";
import type { IBlock } from "../../shared/interfaces.ts";
import SiteTitle from "../../components/SiteTitle.tsx";
import ContactTwitter from "../../components/ContactTwitter.tsx";
import SiteMenu from "../../islands/SiteMenu.tsx";
import Donation from "../../islands/Donation.tsx";

interface Data {
  minerName: string;
  minerBlocks: IBlock[];
}

export const handler: Handlers<Data> = {
  GET(_req, ctx) {
    const minerName = decodeURIComponent(ctx.params.miner);
    const blocks = getBlocks();

    let searchName: string | undefined = minerName;
    if (searchName === "Unrecognized miners") {
      searchName = undefined;
    }

    const minerBlocks = blocks.filter((block) => {
      return block.signals !== undefined && block.miner === searchName;
    });

    return ctx.render({ minerName, minerBlocks });
  },
};

export default function MinerPage({ data }: PageProps<Data>) {
  const { minerName, minerBlocks } = data;
  const forkName = config.fork.name;

  return (
    <div class="container">
      <Head>
        <title>{forkName} activation - {minerName}</title>
      </Head>
      <div class="content" style={{ maxWidth: "800px" }}>
        <SiteTitle />
        <SiteMenu currentPath={`/miner/${minerName}`} />
        <div class="body">
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <h2 class="miner-title common-header">{minerName}</h2>
          </div>
          <a class="see-miner-overview" href={`/?miner=${encodeURIComponent(minerName)}`}>
            See miner's block on overview page
          </a>
          <div class="miner-blocks-container">
            {minerBlocks.map((block) => (
              <div class="miner-block" key={block.height}>
                <p class="text">
                  {block.signals ? "✅ " : "🚫 "} Block #
                  <a href={`https://mempool.space/block/${block.height}?showDetails=true`} target="_blank">
                    {block.height}
                  </a>
                  <a class="locate" href={`/?block=${block.height}`}>🔍</a>
                </p>
              </div>
            ))}
          </div>
        </div>
        <ContactTwitter />
        <Donation />
      </div>
    </div>
  );
}
