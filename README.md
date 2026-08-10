# Fork Explorer

Fork Explorer let's you see the status of a BIP9-style softfork. It relies on
bitcoind and its JSON-RPC server.

<img width="1000" src="fork-explorer-screenshot.png" />

## Prerequisites

You need [Deno](https://deno.land) to build and run this project.

Copy `.env.template` to `.env`, then configure the fork and bitcoind JSON-RPC
credentials. The `.env` file is ignored by Git and must stay server-side. On a
multi-user system, restrict it to the service account (for example,
`chmod 600 .env`).

## How to run

For development:

```sh
deno task dev
```

Build and start for production:

```sh
deno task start
```

`deno task start` creates a production build and starts the server. To start an
existing build without rebuilding it, use `deno task preview`. The listening
address is configured with `SERVER_HOST` and `SERVER_PORT` in `.env`.

Configuration is read when the process starts. Restart fork-explorer after
changing `.env`.

## Generating block data from a specific difficulty period

Difficulty period is calculated as `floor([any block in the period]/2016)`.

`deno run --allow-net --allow-read --allow-write generate/index.ts [period number]`

Once generated, the data is available via API call `/blocks/[epoch number]` or
`[project root]/data/periods/[epoch].json`. You can also display generated
periods on the site by going to Settings and changing the "Period" dropdown.

## Commit and Code-Style

Follow the code style of the file you are working in.

This project uses [Prettier](https://prettier.io/) for code formatting. To
contribute, install and activate the Prettier extension to your editor of
choice.

For commits, make descriptive and atomic git commits. You can prefix the page or
relevant code you are working with, for example on a frontend change:

```
index: Add 90% indicator to Progress Bar
```

Or for the backend:

```
blocks: Make fakemode not depend on bitcoind
```

# License

MIT
