import { Handlers, PageProps } from "$fresh/server.ts";
import { formatDistanceToNow, addMinutes } from "date-fns";
import config from "../lib/config.ts";
import { getBlocks } from "../lib/blocks/index.ts";
import { homeTXT } from "../lib/txt/index.ts";
import { pageviews, pageviewsTxt } from "../lib/pageviews/index.ts";
import { computeStats } from "../shared/data.ts";
import type { IBlock } from "../shared/interfaces.ts";
import SiteTitle from "../components/SiteTitle.tsx";
import ContactTwitter from "../components/ContactTwitter.tsx";
import SiteMenu from "../islands/SiteMenu.tsx";
import BlockGrid from "../islands/BlockGrid.tsx";
import ProgressBar from "../islands/ProgressBar.tsx";
import Donation from "../islands/Donation.tsx";
import ForkStatus from "../islands/ForkStatus.tsx";

interface Data {
  blocks: IBlock[];
  selectedMiner: string | null;
  selectedBlock: string | null;
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const accepts = req.headers.get("Accept") || "";
    const url = new URL(req.url);

    // Check for text/plain content negotiation
    if (
      accepts.includes("text/plain") ||
      url.pathname === "/index.txt" ||
      (accepts === "*/*" && !accepts.includes("text/html") && !url.pathname.toLowerCase().endsWith(".js"))
    ) {
      await pageviewsTxt();
      const textContent = homeTXT();
      return new Response(textContent, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    await pageviews();

    const blocks = getBlocks();
    const selectedMiner = url.searchParams.get("miner");
    const selectedBlock = url.searchParams.get("block");

    return ctx.render({ blocks, selectedMiner, selectedBlock });
  },
};

export default function Home({ data }: PageProps<Data>) {
  const { blocks, selectedMiner, selectedBlock } = data;
  const forkName = config.fork.name;
  const status = config.fork.status;

  const {
    blocksLeftForActivation,
    lockedIn,
    currentPeriodFailed,
    currentSignallingPercentage,
    willProbablyActivate,
    blocksLeftInThisPeriod,
  } = computeStats(blocks);

  const thresholdPercentage = Math.floor((config.fork.threshold / 2016) * 100);
  const forkCompleted = lockedIn || ["locked_in", "active"].includes(status);

  return (
    <div class="container">
      <div class="content-wide">
        <SiteTitle />
        <SiteMenu currentPath="/" />
        <div class="body" style={{ paddingLeft: "18px", paddingRight: "18px" }}>
          {forkCompleted && <ForkStatus initialBlocks={blocks} />}
          {!forkCompleted && (
            <>
              {currentPeriodFailed && blocksLeftInThisPeriod > 0 && (
                <h2 class="cannot-lockin-info">
                  The current period cannot lock in {forkName}.
                  <br />
                  The next period starts in
                  {" " + formatDistanceToNow(addMinutes(new Date(), blocksLeftInThisPeriod * 10)) + " "}(
                  {blocksLeftInThisPeriod} block{blocksLeftInThisPeriod > 1 && "s"})
                </h2>
              )}
              <div class="description-block">
                {config.fork.info.map((text, index) => (
                  <p class="text" key={index}>{text}</p>
                ))}
              </div>
              {blocks.length > 0 && <ProgressBar initialBlocks={blocks} />}
              <div class="top-section">
                <h2 class="common-header current-period">Current signalling period of 2016 blocks (2 weeks)</h2>
                <div class="lockin-info">
                  {lockedIn && <>{forkName.toUpperCase()} IS LOCKED IN FOR DEPLOYMENT!</>}
                  {!lockedIn && (
                    <>
                      {!currentPeriodFailed && (
                        <>
                          {blocksLeftForActivation} additional signalling blocks required for the softfork to lock in
                          <br />
                          {willProbablyActivate && (
                            <>
                              {config.fork.name} will lock in with the current signalling ratio (
                              {currentSignallingPercentage}%)!
                            </>
                          )}
                          {!willProbablyActivate && (
                            <>
                              {config.fork.name} will not lock in with the current signalling ratio (
                              {currentSignallingPercentage}%)
                            </>
                          )}
                        </>
                      )}
                      {currentPeriodFailed && (
                        <>
                          {forkName} cannot be locked in within this period
                          <br />
                          {thresholdPercentage}% of the blocks have to signal (current ratio:{" "}
                          {currentSignallingPercentage}%)
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
              <BlockGrid
                initialBlocks={blocks}
                selectedMiner={selectedMiner}
                selectedBlock={selectedBlock}
              />
            </>
          )}
        </div>
        <ContactTwitter />
        <Donation />
      </div>
    </div>
  );
}
