// Client-safe configuration that doesn't use Deno.env
// These values are safe to use in browser code

export interface ClientConfig {
  fork: {
    name: string;
    threshold: number;
    status: "pre" | "started" | "locked_in" | "active";
    activationHeight: number;
    showActivationCountdown: boolean;
    showCelebrationConfetti: boolean;
  };
  frontend: {
    autoRefreshInterval: number | null;
    twitterHandle: string;
    celebrate?: {
      type: string;
      url: string;
    };
  };
  donation?: {
    lnurlPayUrl: string;
    lightningNodeUri?: string;
  };
}

// Default client config - these values should match the server config defaults
export const clientConfig: ClientConfig = {
  fork: {
    name: "CTV",
    threshold: 1815,
    status: "started",
    activationHeight: 709632,
    showActivationCountdown: false,
    showCelebrationConfetti: false,
  },
  frontend: {
    autoRefreshInterval: 120,
    twitterHandle: "",
  },
  donation: undefined,
};
