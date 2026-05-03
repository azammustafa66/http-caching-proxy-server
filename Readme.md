# HTTP Caching Proxy Server

A CLI-driven HTTP proxy that caches GET responses to disk. Repeat GET requests are served from the local cache without hitting the origin. Non-GET requests are forwarded transparently.

> Built as part of the [roadmap.sh Caching Server project](https://roadmap.sh/projects/caching-server).

## How it works

- **GET requests** — checks `./cache/` for a stored response. On a miss, fetches from the origin, writes the response to disk, and returns it. On a hit, reads from disk and returns immediately.
- **Non-GET requests** — proxied straight through to the origin without caching.
- Every response includes an `X-Cache` header: `HIT`, `MISS`, or `BYPASS`.

## Installation

```bash
pnpm install
```

## Usage

```bash
tsx index.ts --port <port> --origin <url>
```

### Options

| Flag            | Alias | Default                 | Description                             |
| --------------- | ----- | ----------------------- | --------------------------------------- |
| `--port`        | `-p`  | `3000`                  | Port to listen on                       |
| `--origin`      | `-o`  | `https://dummyjson.com` | Origin server to proxy to               |
| `--clear-cache` | —     | —                       | Delete the `./cache` directory and exit |
| `--help`        | —     | —                       | Show usage                              |

### Examples

```bash
# Start on port 3000, proxying to the default origin
tsx index.ts

# Use a custom port and origin
tsx index.ts --port 8080 --origin https://api.example.com

# Clear all cached responses
tsx index.ts --clear-cache
```

Once running, send requests to the proxy as you would to the origin:

```bash
curl http://localhost:3000/products
# X-Cache: MISS  (first request — fetched from origin and cached)

curl http://localhost:3000/products
# X-Cache: HIT   (served from disk)
```

## X-Cache header

| Value    | Meaning                                          |
| -------- | ------------------------------------------------ |
| `HIT`    | Response served from local disk cache            |
| `MISS`   | Cache empty — fetched from origin and stored     |
| `BYPASS` | Non-GET request, proxied through without caching |

## Project structure

```text
index.ts          # Entry point — CLI parsing and server startup
src/
  app.ts          # Express app and proxy/cache logic
  config.ts       # yargs argv definition (shared between entry and app)
  utils/
    index.ts      # doesFileExist helper
cache/            # Runtime — cached responses (git-ignored)
```
