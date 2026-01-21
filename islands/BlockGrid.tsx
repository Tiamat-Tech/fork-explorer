import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import type { IBlock } from "../shared/interfaces.ts";
import {
  blocks,
  autoRefreshEnabled,
  initializeStore,
  fetchBlocks,
  startAutoRefresh,
} from "../lib/store.ts";

interface BlockProps {
  height: number;
  signals: boolean;
  miner: string | undefined;
  selected: boolean;
  big?: boolean;
}

function Block({ height, signals, miner, selected, big }: BlockProps) {
  const hover = `Height: ${height}
Miner: ${miner ?? "Unknown"}
Signalling: ${signals ? "Yes" : "No"}`;

  const classes = [
    "block",
    signals ? "signalling" : "non-signalling",
    selected ? "selected" : "",
    big ? "big" : "",
  ].filter(Boolean).join(" ");

  return (
    <a href={`https://mempool.space/block/${height}?showDetails=true`} target="_blank">
      <div class={classes} title={hover}></div>
    </a>
  );
}

interface EmptyBlockProps {
  height?: number;
  nextBlock: boolean;
  big?: boolean;
}

function EmptyBlock({ height, nextBlock, big }: EmptyBlockProps) {
  const isAnimated = autoRefreshEnabled.value && nextBlock;

  const classes = [
    "block",
    "upcoming",
    isAnimated ? "next-block" : "",
    big ? "big" : "",
  ].filter(Boolean).join(" ");

  return (
    <div
      class={classes}
      title={`Upcoming block${height ? ` ${height}` : ""}`}
    />
  );
}

interface BlockGridProps {
  initialBlocks: IBlock[];
  selectedMiner?: string | null;
  selectedBlock?: string | null;
}

export default function BlockGrid({ initialBlocks, selectedMiner, selectedBlock }: BlockGridProps) {
  const initialized = useSignal(false);

  useEffect(() => {
    // Initialize the store with blocks from server
    if (initialBlocks.length > 0) {
      blocks.value = initialBlocks;
    }

    (async () => {
      await initializeStore();
      if (initialBlocks.length === 0) {
        await fetchBlocks();
      }
      startAutoRefresh();
      initialized.value = true;
    })();
  }, []);

  // Use signal value if available, otherwise fallback to initialBlocks for SSR
  const currentBlocks = blocks.value.length > 0 ? blocks.value : initialBlocks;
  const nextBlockHeight = currentBlocks.find((block) => block.signals === undefined)?.height ?? 0;

  let miner = selectedMiner;
  if (miner === "Unrecognized miners") {
    miner = undefined;
  }

  if (currentBlocks.length === 0) {
    return (
      <div class="block-container">
        <p class="bootstrapping-progress">
          Server is currently loading blocks, please try soon again.
        </p>
      </div>
    );
  }

  return (
    <div class="block-container">
      {currentBlocks.map((block, i) => {
        if (block.signals === undefined) {
          return <EmptyBlock key={i} height={block.height} nextBlock={block.height === nextBlockHeight} />;
        }
        return (
          <Block
            key={i}
            height={block.height}
            signals={block.signals}
            selected={selectedBlock === block.height.toString() || miner === block.miner}
            miner={block.miner}
          />
        );
      })}
    </div>
  );
}
