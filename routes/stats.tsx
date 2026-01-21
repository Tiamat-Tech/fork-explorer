import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import config from "../lib/config.ts";
import { getBlocks } from "../lib/blocks/index.ts";
import type { IBlock } from "../shared/interfaces.ts";
import SiteTitle from "../components/SiteTitle.tsx";
import ContactTwitter from "../components/ContactTwitter.tsx";
import SiteMenu from "../islands/SiteMenu.tsx";
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

export default function Stats({ data }: PageProps<Data>) {
  const { blocks } = data;
  const forkName = config.fork.name;
  const thresholdPercentage = Math.floor((config.fork.threshold / 2016) * 100);

  // Calculate moving average data
  const chartData = blocks
    .filter((block) => block.signals !== undefined)
    .map((block, i) => {
      const last144Blocks = blocks.slice(Math.max(i - 143, 0), i + 1);
      const numSignallingBlocks = last144Blocks.reduce((prev, curr) => {
        return prev + (curr.signals ? 1 : 0);
      }, 0);

      return {
        periodHeight: i,
        height: block.height,
        ratio: numSignallingBlocks / 144,
      };
    });

  return (
    <div class="container">
      <Head>
        <title>{forkName} activation - Statistics</title>
      </Head>
      <div class="content-wide">
        <SiteTitle />
        <SiteMenu currentPath="/stats" />
        <div class="body">
          <h2 class="chart-title common-header">144 Block Moving Average</h2>
          <p class="text">
            Signalling percentage over the last 144 blocks (Moving Average) in the current period.
          </p>
          <p class="text">
            Reaching {thresholdPercentage}% is not indicative of a softfork lock-in. {config.fork.threshold} blocks
            within a period have to signal for the {config.fork.name} softfork to lock in.
          </p>

          <div class="chart-holder">
            <p class="text" style={{ textAlign: "center", color: "#999" }}>
              Chart visualization requires Victory library integration.
              <br />
              Data points: {chartData.length} blocks analyzed.
              <br />
              Latest ratio: {chartData.length > 0 ? (chartData[chartData.length - 1].ratio * 100).toFixed(2) : 0}%
            </p>
          </div>
        </div>
        <ContactTwitter />
        <Donation />
      </div>
    </div>
  );
}
