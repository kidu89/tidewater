# Friend duels

Fishing Free supports asynchronous one-on-one fishing challenges. A player shares a catch, the friend tries to beat that fish's weight with the same species, and the friend sends their catch back through the share sheet. Live boats, matchmaking and public leaderboards are not part of this version.

## Online duel service

The browser client is static, so online results need a small Node server. The service stores the host catch and one friend result, calculates the winner, and keeps each duel for up to 90 days. The challenge URL contains a random bearer code; no account or personal details are collected.

Run the service locally with Node.js 22 or newer:

```sh
npm run multiplayer:server
```

It listens on `0.0.0.0:$PORT` (8787 by default). The persistent JSON store defaults to `server/duels.json`. Set `FISHING_FREE_DUEL_STORE` to a path on a persistent disk when hosting. `CORS_ORIGINS` is a comma-separated allowlist; its default `*` is convenient for local play. In production, set it to the web origin and the Capacitor origins, for example `https://your-game-domain.example,https://localhost,capacitor://localhost`.

Deploy the service on a Node host with HTTPS and a persistent disk. Use `npm run multiplayer:server` as the start command and the host-provided `PORT`. The file store supports one service instance; it is not a shared database for horizontally scaled servers.

Set the public, non-secret `VITE_DUEL_API_URL` value to the HTTPS service origin when building the game. For GitHub Pages, add it as a repository Actions variable with that exact name; the deploy workflow passes it to Vite. For native builds, set the same environment variable before running `npm run mobile:sync`. Without this setting, friend challenges use the share-link prototype and compare a self-reported result locally.

## API

- `GET /health` — service health.
- `POST /api/duels` with `{ "species", "kg" }` — store the initiating catch and return a random duel code.
- `GET /api/duels/:id` — read the challenge and any response.
- `POST /api/duels/:id/result` with `{ "species", "kg" }` — submit the first matching-species result; identical retries are safe.

The server rejects unknown fish, implausible species weights, and a second different response. It derives the length from the game's fish data and applies a basic per-IP rate limit. It cannot prove that a catch happened in the game: results are self-reported and suitable for friendly matches only. Do not connect these scores to paid rewards or public rankings without authenticated, server-validated catches and stronger abuse controls.
