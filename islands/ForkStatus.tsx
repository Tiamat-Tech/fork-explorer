import { useEffect } from "preact/hooks";
import { formatDistanceToNow, addMinutes } from "date-fns";
import { clientConfig } from "../shared/client-config.ts";
import { computeStats } from "../shared/data.ts";
import type { IBlock } from "../shared/interfaces.ts";
import { blocks, monitoringMode } from "../lib/store.ts";

interface ForkStatusProps {
  initialBlocks: IBlock[];
}

export default function ForkStatus({ initialBlocks }: ForkStatusProps) {
  useEffect(() => {
    if (initialBlocks.length > 0 && blocks.value.length === 0) {
      blocks.value = initialBlocks;
    }

    // Show confetti if configured
    if (typeof window !== "undefined" && clientConfig.fork.showCelebrationConfetti) {
      import("canvas-confetti").then((confettiModule) => {
        const confetti = confettiModule.default;
        const duration = 4 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) {
            return clearInterval(interval);
          }
          const particleCount = 60 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.35), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.65, 0.9), y: Math.random() - 0.2 } });
        }, 250);
      });
    }
  }, []);

  const currentBlocks = blocks.value.length > 0 ? blocks.value : initialBlocks;
  const forkName = clientConfig.fork.name;
  let status = clientConfig.fork.status;
  const { lockedIn } = computeStats(currentBlocks);

  const currentBlockheight = (currentBlocks.find((block) => block.signals === undefined)?.height ?? 0) - 1;

  if (currentBlockheight >= clientConfig.fork.activationHeight) {
    status = "active";
  }

  const showActivationCountdown = clientConfig.fork.showActivationCountdown && status !== "active";
  const forkCompleted = monitoringMode.value === "current_period" && (lockedIn || ["locked_in", "active"].includes(status));

  if (!forkCompleted) {
    return null;
  }

  return (
    <div class="status-container">
      {!showActivationCountdown && (
        <>
          <h2 class="status-text">
            {(status === "locked_in" || (lockedIn && status !== "active")) && <>LOCKED IN!</>}
            {status === "active" && <>ACTIVE!</>}
          </h2>
          <p class="status-description">
            {lockedIn && status === "started" && (
              <>
                This period has reached {clientConfig.fork.threshold} {forkName} signalling blocks, which is required for
                lock-in.
              </>
            )}
            {status === "locked_in" && <>{forkName} has been locked in!</>}
            {status === "active" && <>{forkName} softfork has been activated!</>}
          </p>
        </>
      )}
      {showActivationCountdown && (
        <>
          <h3 class="countdown-header">{clientConfig.fork.name} activates in</h3>
          <p class="countdown">
            {formatDistanceToNow(addMinutes(new Date(), (clientConfig.fork.activationHeight - currentBlockheight) * 10))}
          </p>
          <p class="countdown-blocks">{clientConfig.fork.activationHeight - currentBlockheight} blocks left</p>
        </>
      )}
      {clientConfig.frontend.celebrate && (
        <video class="celebrate-video" src={clientConfig.frontend.celebrate.url} controls />
      )}
    </div>
  );
}
