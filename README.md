# ORBIT — game store

A responsive PC game storefront built with Next.js App Router, TypeScript, React, and CSS. The storefront loads its curated catalog through a dynamic API and submits demo checkout to the server for validation and price calculation.

## What works

- Search by title or genre; combine genre and budget filters; sort by price, rating, or discount.
- API-backed catalog with connection status, an offline preview, and retry.
- Browser-persistent cart, wishlist, and demo game library.
- Server-validated demo checkout with a receipt, integer-cent totals, pending/error states, and retry without losing the cart.
- Four-game spotlight with automatic rotation, manual controls, animated cover art, and camera movement.
- Pointer parallax, nebula and meteor effects, staggered entrances, scroll reveals, card lighting, button highlights, and modal transitions.
- Pause-motion control and automatic reduced-motion support. Spotlight rotation pauses while hovered, focused, outside the viewport, in a hidden tab, or behind a dialog.

## Run locally

Requires Node.js 20.9+.

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

## Production

```sh
npm run typecheck
npm run build
npm start
```

Deploy to a host that supports the **Next.js server runtime**, such as Vercel using its Next.js preset, or a Node.js server running the commands above. The page shell is prerendered for speed; `/api/store` runs dynamically on each request.

This project no longer exports an `out/` directory. Static-only hosting such as GitHub Pages cannot run the API. No environment variables or external API keys are required for the demo.

## Store API

The source catalog is maintained in `src/lib/games.ts`. Prices and ratings are illustrative, not a live feed from a game retailer.

- `GET /api/store`: returns games, catalog size, available genres, and currency. Optional query parameters: `q`, `genre`, `maxPrice`, and `sort` (`low`, `high`, `rating`, `discount`). Responses use `Cache-Control: no-store`.
- `POST /api/store`: accepts `{"ids":[1091500,1145360],"demo":true}`. Rejects malformed, oversized, empty, duplicate, and unknown-ID requests. Calculates prices from the server catalog, ignoring client-supplied amounts, and returns a demo receipt with item prices and total in integer cents.

## Demo boundaries

No payments are processed, accounts created, newsletters sent, downloads provided, or license keys delivered. Checkout creates a demonstration receipt; it does not place a real purchase. Receipts are displayed for the current session, and the demo library, cart, and wishlist are stored only in the visitor's browser. There is no database, durable server-side order history, or cross-device account sync. Clearing browser storage clears the collection.

To launch a commercial store, connect an authorized product catalog, authenticated accounts, durable order and inventory storage, and a payment provider with server-verified webhooks and idempotent fulfillment. The current demo library must never be used as proof of ownership.

## Artwork and accessibility

Game artwork is cached locally from Steam's public CDN for demonstration. Names, artwork, and trademarks belong to their publishers; obtain appropriate rights before commercial use. The orbital hero is original CSS artwork. DM Sans and Barlow Condensed load from Google Fonts with system fallbacks.

Semantic controls, a skip link, labeled inputs, pressed states, native modal focus management, Escape handling, visible focus, live status/error feedback, responsive touch targets, and reduced-motion support are included. Scroll progress enhances supported browsers; other browsers retain the full storefront.

## Browser tests

```sh
npx playwright install chromium
npm run test:e2e
```

To use installed Edge on Windows PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = "msedge"
npm run test:e2e
```

The suite runs eight scenarios on desktop and mobile (16 cases): existing shopping flows, responsive images and sorting, API validation and price tampering, demo checkout/library persistence, checkout failure/retry, offline catalog recovery and combined filters, spotlight controls/reduced motion, and corrupt-storage/motion handling.