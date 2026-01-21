import { useEffect } from "preact/hooks";
import type { IBlock } from "../shared/interfaces.ts";
import { computeStats } from "../shared/data.ts";
import { clientConfig } from "../shared/client-config.ts";
import { blocks } from "../lib/store.ts";

interface ProgressBarProps {
  initialBlocks: IBlock[];
}

export default function ProgressBar({ initialBlocks }: ProgressBarProps) {
  useEffect(() => {
    if (initialBlocks.length > 0 && blocks.value.length === 0) {
      blocks.value = initialBlocks;
    }
  }, []);

  const currentBlocks = blocks.value.length > 0 ? blocks.value : initialBlocks;

  const {
    blocksLeftInThisPeriod,
    currentNumberOfSignallingBlocks,
    currentSignallingRatioToAll,
    currentSignallingPercentageToAll,
    currentNumberOfNonSignallingBlocks,
  } = computeStats(currentBlocks);

  const nonSignallingRatio = currentNumberOfNonSignallingBlocks / 2016;
  const nonSignallingPercentage = (nonSignallingRatio * 100).toFixed(currentNumberOfNonSignallingBlocks < 20 ? 2 : 0);

  const blocksLeftRatio = blocksLeftInThisPeriod / 2016;
  let blocksLeftPercentage = (blocksLeftRatio * 100).toFixed(blocksLeftInThisPeriod < 20 ? 2 : 0);

  // Add rounding error leftovers to blocks left percentage
  const leftOver =
    100 -
    (Number.parseFloat(currentSignallingPercentageToAll) +
      Number.parseFloat(nonSignallingPercentage) +
      Number.parseFloat(blocksLeftPercentage));
  if (leftOver != 0) {
    blocksLeftPercentage = (Number.parseFloat(blocksLeftPercentage) + leftOver).toFixed(2);
    if (blocksLeftPercentage.endsWith(".00")) {
      blocksLeftPercentage = blocksLeftPercentage.slice(0, -3);
    }
    if (blocksLeftPercentage.startsWith("-")) {
      blocksLeftPercentage = blocksLeftPercentage.slice(1);
    }
  }

  const thresholdPercentage = Math.floor((clientConfig.fork.threshold / 2016) * 100);

  return (
    <div class="progress-container">
      <div class="progress-bar">
        {currentSignallingRatioToAll > 0 && (
          <div
            class={`progress-segment signalling ${currentNumberOfSignallingBlocks === 2016 ? "rounded-right" : ""}`}
            style={{ flex: currentSignallingRatioToAll }}
          >
            {currentSignallingRatioToAll > 0.035 && `${currentSignallingPercentageToAll}%`}
          </div>
        )}
        {blocksLeftRatio > 0 && (
          <div
            class={`progress-segment upcoming ${currentNumberOfSignallingBlocks === 0 ? "rounded-left" : ""} ${currentNumberOfNonSignallingBlocks === 0 ? "rounded-right" : ""}`}
            style={{ flex: blocksLeftRatio }}
          >
            {blocksLeftRatio > 0.035 && `${blocksLeftPercentage}%`}
          </div>
        )}
        {nonSignallingRatio > 0 && (
          <div
            class={`progress-segment non-signalling ${currentNumberOfNonSignallingBlocks === 2016 ? "rounded-left" : ""}`}
            style={{ flex: nonSignallingRatio }}
          >
            {nonSignallingRatio > 0.035 && `${nonSignallingPercentage}%`}
          </div>
        )}
      </div>
      <div class="progress-info-container">
        {currentSignallingRatioToAll > 0 && (
          <div class="progress-info-text" style={{ flex: currentSignallingRatioToAll }}>
            {currentNumberOfSignallingBlocks} signalling block{currentNumberOfSignallingBlocks > 1 && "s"}
          </div>
        )}
        {blocksLeftRatio > 0 && (
          <div class="progress-info-text" style={{ flex: blocksLeftRatio }}>
            {blocksLeftInThisPeriod} upcoming block{blocksLeftInThisPeriod > 1 && "s"}
          </div>
        )}
        {nonSignallingRatio > 0 && (
          <div class="progress-info-text" style={{ flex: nonSignallingRatio }}>
            {currentNumberOfNonSignallingBlocks} non-signalling block{currentNumberOfNonSignallingBlocks > 1 && "s"}
          </div>
        )}
      </div>
      <div class="percent-holder" style={{ left: `calc(${thresholdPercentage}% - 2px)` }}>
        <div class="ninety-percent-text">{thresholdPercentage}%</div>
        <div class="ninety-percent-indicator" />
      </div>
    </div>
  );
}
