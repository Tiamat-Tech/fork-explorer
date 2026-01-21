interface Config {
  // Whether to load real data or fake
  mode: "real" | "fake" | "fake-frontend";

  // Configuration related to the API server
  server: {
    // The server host or listening IP
    host: string;
    // The server listening port
    port: number;
  };

  // Configuration for bitcoind's JSON-RPC server
  bitcoinRpc: {
    // Server host IP or domain.
    server: string;
    // Username credentials.
    user: string;
    // Password credentials.
    password: string;
  };

  // Information about the softfork in question should be added here.
  // Things inside here will most likely be used and shown on the webpage.
  fork: {
    // The common name of this softfork.
    name: string;
    // Information about this softfork, each array item is rendered as a paragraph.
    info: string[];
    // The BIP9 version bit as defined in the softfork's BIP.
    versionBit: number;
    // Threshold for the softfork to be locked in
    threshold: number;
    // Status of the softfork
    status: "pre" | "started" | "locked_in" | "active";
    // Block height the softfork gets activated
    activationHeight: number;
    // Show a countdown timer until the softfork is activated.
    // Only available when the `status` is `locked_in`.
    showActivationCountdown: boolean;
    // Show celebration confetti on the site
    showCelebrationConfetti: boolean;
  };

  // Configuration specifically for the frontend site
  frontend: {
    // How often to auto-refresh, in seconds. Set to null to disable
    autoRefreshInterval: number | null;
    // Twitter handle, this is for the Twitter link preview
    twitterHandle: string;
    // Celebratory video to display once lock-in is reached
    celebrate?: {
      type: string;
      url: string;
    };
    // Content related to the About page
    about?: {
      // Information about the softfork
      softfork?: {
        info?: string[];
      };
      // Information related to the current deployment method being
      // used for this softfork (i.e BIP9, Speedy Trial etc)
      method?: {
        title: string;
        info: string[];
      };
    };
    // Sponsors of this project
    sponsors?: {
      title: string;
      url: string;
      imageUri: string;
    }[];
  };

  // Donation configuration, right now only supports lnd
  donation?: {
    // Backend type, currently only supports lnd
    type: "lnd";
    // Data for the backend
    data: {
      // REST server
      server: string;
      // Path to tls.cert
      cert: string;
      // Path to invoice.macaroon
      macaroon: string;
      // Lightning Node URI <pubkey>@<ip:port>
      lightningNodeUri?: string;
    };
    // URL to the LNURL-pay endpoint
    lnurlPayUrl: string;
  };
}

const config: Config = {
  mode: (Deno.env.get("MODE") as Config["mode"]) ?? "fake",

  server: {
    host: Deno.env.get("SERVER_HOST") ?? "127.0.0.1",
    port: parseInt(Deno.env.get("SERVER_PORT") ?? "8000", 10),
  },

  bitcoinRpc: {
    server: Deno.env.get("BITCOIN_RPC_SERVER") ?? "http://127.0.0.1:8332",
    user: Deno.env.get("BITCOIN_RPC_USER") ?? "",
    password: Deno.env.get("BITCOIN_RPC_PASSWORD") ?? "",
  },

  fork: {
    name: Deno.env.get("FORK_NAME") ?? "CTV",
    info: [],
    versionBit: parseInt(Deno.env.get("FORK_VERSION_BIT") ?? "2", 10),
    threshold: parseInt(Deno.env.get("FORK_THRESHOLD") ?? "1815", 10),
    status: (Deno.env.get("FORK_STATUS") as Config["fork"]["status"]) ?? "started",
    activationHeight: parseInt(Deno.env.get("FORK_ACTIVATION_HEIGHT") ?? "709632", 10),
    showActivationCountdown: Deno.env.get("FORK_SHOW_ACTIVATION_COUNTDOWN") === "true",
    showCelebrationConfetti: Deno.env.get("FORK_SHOW_CELEBRATION_CONFETTI") === "true",
  },

  frontend: {
    autoRefreshInterval: Deno.env.get("FRONTEND_AUTO_REFRESH_INTERVAL")
      ? parseInt(Deno.env.get("FRONTEND_AUTO_REFRESH_INTERVAL")!, 10)
      : 120,
    twitterHandle: Deno.env.get("FRONTEND_TWITTER_HANDLE") ?? "",
    about: {
      softfork: {
        info: [
          "Info about the CTV softfork goes here",
          "Info about the CTV softfork goes here",
        ],
      },
      method: {
        title: "Title of the softfork deployment method used (BIP9, Speedy Trial etc)",
        info: [
          "Info about the deployment method goes here",
          "Info about the deployment method goes here",
        ],
      },
    },
    sponsors: [],
  },

  donation: Deno.env.get("DONATION_LND_SERVER")
    ? {
        type: "lnd",
        data: {
          server: Deno.env.get("DONATION_LND_SERVER") ?? "https://127.0.0.1:8080",
          cert: Deno.env.get("DONATION_LND_CERT") ?? "/path/to/tls.cert",
          macaroon: Deno.env.get("DONATION_LND_MACAROON") ?? "/path/to/invoice.macaroon",
          lightningNodeUri: Deno.env.get("DONATION_LND_NODE_URI"),
        },
        lnurlPayUrl: Deno.env.get("DONATION_LNURL_PAY_URL") ?? "https://domain.com/invoice",
      }
    : undefined,
};

export default config;
export type { Config };
