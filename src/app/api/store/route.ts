import { games } from "@/lib/games";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store" };
function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers });
}

// The curated catalog is the server's source of truth. No external API key needed.
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get("q") ?? "").trim().toLowerCase();
  const genre = params.get("genre");
  const sort = params.get("sort");
  const maxPrice = params.has("maxPrice") ? Number(params.get("maxPrice")) : Infinity;
  if (Number.isNaN(maxPrice) || maxPrice < 0) {
    return json({ error: "Choose a valid maximum price." }, 400);
  }
  const results = games.filter(
    (game) =>
      (!genre || genre === "All games" || game.genre === genre) &&
      (game.title + " " + game.genre).toLowerCase().includes(query) &&
      game.price <= maxPrice,
  );
  results.sort((a, b) =>
    sort === "low" ? a.price - b.price
      : sort === "high" ? b.price - a.price
        : sort === "rating" ? Number(b.rating) - Number(a.rating)
          : sort === "discount" ? (1 - b.price / b.original) - (1 - a.price / a.original)
            : 0,
  );
  return json({
    games: results,
    total: games.length,
    genres: [...new Set(games.map((game) => game.genre))],
    currency: "USD",
  });
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "Send a JSON checkout request." }, 415);
  }

  // Bound the streamed body as well as Content-Length, which clients can omit.
  const reader = request.body?.getReader();
  if (!reader) return json({ error: "Your cart is empty." }, 400);
  let body: unknown;
  try {
    const decoder = new TextDecoder();
    let text = "";
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 4096) {
        await reader.cancel();
        return json({ error: "Checkout request is too large." }, 413);
      }
      text += decoder.decode(value, { stream: true });
    }
    body = JSON.parse(text + decoder.decode());
  } catch {
    return json({ error: "Invalid checkout request." }, 400);
  } finally {
    reader.releaseLock();
  }

  if (!body || typeof body !== "object" || !("ids" in body) ||
      !("demo" in body) || body.demo !== true || !Array.isArray(body.ids) ||
      body.ids.length === 0 || body.ids.length > games.length ||
      body.ids.some((id: unknown) => typeof id !== "number" || !games.some((game) => game.id === id)) ||
      new Set(body.ids).size !== body.ids.length) {
    return json({ error: "Choose valid, unique games and confirm demo checkout." }, 400);
  }

  const ids: number[] = body.ids;
  const items = games.filter((game) => ids.includes(game.id)).map((game) => ({
    id: game.id,
    title: game.title,
    priceCents: Math.round(game.price * 100),
  }));
  // Ignore all client-supplied prices. Integer cents avoid floating-point totals.
  return json({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    demo: true,
    currency: "USD",
    items,
    totalCents: items.reduce((total, item) => total + item.priceCents, 0),
    message: "Demo complete. No payment was taken and no game keys are delivered.",
  });
}