// The subset of configuration that may be serialized into browser code.
// Values are populated from the server configuration and passed to islands as
// props; this module intentionally contains no deployment-specific defaults.

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
