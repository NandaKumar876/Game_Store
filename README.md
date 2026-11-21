# ORBIT — game store

A cinematic, responsive PC game storefront built with Next.js App Router, TypeScript, React, and CSS. Includes animated orbital artwork, genre/search/sort controls, product detail dialogs, a persistent cart and wishlist, and a clearly labeled demo checkout.

## Run locally

Requires Node.js 20.9+.

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

## Validate and deploy

```sh
npm run typecheck
npm run build
```

The production build exports to `out/`. Deploy that directory to any static host, or import this repository into Vercel (Next.js preset). No environment variables are required.

## Demo boundaries

Prices and ratings are illustrative. This project does not process payments, create accounts, send newsletters, or deliver license keys. Cart and wishlist are stored only in the visitor's browser. To launch a real store, connect an authorized product catalog, backend inventory/order handling, and a payment provider with server-verified webhooks. Never trust client-side pricing.

## Artwork

Game artwork is cached locally from Steam's public CDN for demonstration. All game names, artwork, and trademarks belong to their respective publishers; obtain appropriate rights before commercial use. The orbital hero is original CSS artwork. DM Sans and Barlow Condensed load from Google Fonts with system fallbacks.

## Accessibility

Semantic controls, labeled search and sorting, native modal dialog focus management and Escape handling, visible keyboard focus, live feedback, and reduced-motion support.

## Browser tests

Run `npx playwright install chromium` once, then `npm run test:e2e`. To use installed Edge on Windows, set `PLAYWRIGHT_CHANNEL=msedge`. Tests cover desktop and mobile catalog filtering, sorting, image loading, cart persistence, wishlist, checkout preview, and overflow.
