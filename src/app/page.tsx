"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Library,
  Pause,
  Play,
  RefreshCw,
  ArrowRight,
  ArrowUpRight,
  Check,
  Gamepad2,
  Heart,
  Menu,
  Monitor,
  Orbit,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react";
import { games, money, cover, type Game } from "@/lib/games";

type Panel = "cart" | "wishlist" | "checkout" | "library" | null;
type Receipt = {
  id: string;
  totalCents: number;
  items: { id: number; title: string; priceCents: number }[];
};
const featuredIds = [1091500, 1245620, 1174180, 1551360];
export default function Home() {
  const [catalog, setCatalog] = useState<Game[]>(games);
  const [catalogStatus, setCatalogStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [refresh, setRefresh] = useState(0);
  const [budget, setBudget] = useState("all");
  const [library, setLibrary] = useState<number[]>([]);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const checkoutLock = useRef(false);
  const [motion, setMotion] = useState(true);
  const [slide, setSlide] = useState(0);
  const [spotlightPaused, setSpotlightPaused] = useState(false);
  const [spotlightVisible, setSpotlightVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const spotlight = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All games");
  const [sort, setSort] = useState("popular");
  const [cart, setCart] = useState<number[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [ready, setReady] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [selected, setSelected] = useState<Game | null>(null);
  const [toast, setToast] = useState("");
  const [nav, setNav] = useState(false);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let active = true;
    setCatalogStatus("loading");
    fetch("/api/store", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Catalog unavailable");
        const data = await response.json();
        if (!Array.isArray(data.games) || data.games.length === 0)
          throw new Error("Empty catalog");
        if (active) {
          setCatalog(data.games);
          setCatalogStatus("ready");
        }
      })
      .catch(() => {
        if (active) setCatalogStatus("error");
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [refresh]);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setMotion(!preference.matches);
    const syncVisibility = () => setPageVisible(!document.hidden);
    syncMotion();
    syncVisibility();
    preference.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    const observer = new IntersectionObserver(([entry]) =>
      setSpotlightVisible(entry.isIntersecting),
    );
    if (spotlight.current) observer.observe(spotlight.current);
    return () => {
      preference.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (
      !motion ||
      spotlightPaused ||
      !spotlightVisible ||
      !pageVisible ||
      panel ||
      selected
    )
      return;
    const timer = setInterval(
      () => setSlide((current) => (current + 1) % featuredIds.length),
      7000,
    );
    return () => clearInterval(timer);
  }, [
    motion,
    spotlightPaused,
    spotlightVisible,
    pageVisible,
    panel,
    selected,
    slide,
  ]);
  useEffect(() => {
    if (!motion) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [motion]);
  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem("orbit-cart") || "[]");
      const w = JSON.parse(localStorage.getItem("orbit-wishlist") || "[]");
      const owned = JSON.parse(localStorage.getItem("orbit-library") || "[]");
      if (Array.isArray(owned))
        setLibrary([
          ...new Set(
            owned.filter((id: number) => games.some((g) => g.id === id)),
          ),
        ]);
      if (Array.isArray(c))
        setCart([
          ...new Set(c.filter((id: number) => games.some((g) => g.id === id))),
        ]);
      if (Array.isArray(w))
        setWishlist([
          ...new Set(w.filter((id: number) => games.some((g) => g.id === id))),
        ]);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("orbit-cart", JSON.stringify(cart));
        localStorage.setItem("orbit-wishlist", JSON.stringify(wishlist));
        localStorage.setItem("orbit-library", JSON.stringify(library));
      } catch {}
  }, [cart, wishlist, library, ready]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (panel || selected) {
      dialog.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.current?.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [panel, selected]);
  async function checkout() {
    if (checkoutLock.current || cart.length === 0) return;
    checkoutLock.current = true;
    setSubmitting(true);
    setCheckoutError("");
    try {
      const response = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: cart, demo: true }),
        signal: AbortSignal.timeout(10000),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Checkout could not be completed.");
      setReceipt(result);
      setLibrary((current) => [
        ...new Set([
          ...current,
          ...result.items.map((item: { id: number }) => item.id),
        ]),
      ]);
      setCart((current) =>
        current.filter(
          (id) => !result.items.some((item: { id: number }) => item.id === id),
        ),
      );
      setToast("Demo complete. Your collection has been updated.");
    } catch (error) {
      setCheckoutError(
        error instanceof Error && error.name !== "TimeoutError"
          ? error.message
          : "Connection timed out. Your cart is safe. Please try again.",
      );
    } finally {
      checkoutLock.current = false;
      setSubmitting(false);
    }
  }
  function close() {
    setPanel(null);
    setSelected(null);
  }
  function add(game: Game) {
    if (library.includes(game.id)) {
      setToast(game.title + " is already in your demo library");
      return;
    }
    setCart((c) => (c.includes(game.id) ? c : [...c, game.id]));
    setToast(game.title + " added to your cart");
  }
  function wish(id: number) {
    setWishlist((w) =>
      w.includes(id) ? w.filter((x) => x !== id) : [...w, id],
    );
  }
  function browse(category = "All games") {
    setGenre(category);
    setNav(false);
    document
      .getElementById("catalog")
      ?.scrollIntoView({ behavior: motion ? "smooth" : "instant" });
  }
  const filtered = catalog
    .filter(
      (g) =>
        (genre === "All games" || g.genre === genre) &&
        (g.title + " " + g.genre)
          .toLowerCase()
          .includes(query.trim().toLowerCase()) &&
        (budget === "all" || g.price <= Number(budget)),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : sort === "discount"
            ? 1 - b.price / b.original - (1 - a.price / a.original)
            : sort === "rating"
              ? Number(b.rating) - Number(a.rating)
              : 0,
    );
  const featured =
    catalog.find((game) => game.id === featuredIds[slide]) ?? catalog[0];
  const cartGames = catalog.filter((g) => cart.includes(g.id));
  const total = cartGames.reduce((s, g) => s + g.price, 0);
  return (
    <main data-motion={motion ? "on" : "off"}>
      <a className="skip-link" href="#catalog">
        Skip to games
      </a>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="announcement">
        <span className="live-dot" /> THE NEXT LEVEL IS HERE{" "}
        <span className="announcement-divider">/</span> Discover your next
        obsession <ArrowUpRight size={12} />
      </div>
      <header className="header shell">
        <a className="brand" href="#" aria-label="Orbit home">
          <Orbit size={31} strokeWidth={1.6} />
          ORBIT<span>®</span>
        </a>
        <nav
          className={nav ? "navigation mobile-open" : "navigation"}
          aria-label="Main navigation"
        >
          <a href="#catalog" className="active" onClick={() => browse()}>
            Discover
          </a>
          <a
            href="#catalog"
            onClick={() => {
              setSort("rating");
              browse();
            }}
          >
            Top rated
          </a>
          <a href="#spotlight" onClick={() => setNav(false)}>
            The spotlight <span className="tiny-dot" />
          </a>
          <a href="#community" onClick={() => setNav(false)}>
            Community
          </a>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button motion-toggle"
            aria-label={motion ? "Pause motion" : "Enable motion"}
            aria-pressed={motion}
            onClick={() => setMotion((current) => !current)}
          >
            {motion ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            className="icon-button"
            aria-label="Open demo library"
            onClick={() => setPanel("library")}
          >
            <Library size={19} />
            {library.length > 0 && <b>{library.length}</b>}
          </button>
          <button
            aria-label="Open wishlist"
            className="icon-button"
            onClick={() => setPanel("wishlist")}
          >
            <Heart size={19} />
            {wishlist.length > 0 && <b>{wishlist.length}</b>}
          </button>
          <span className="header-line" />
          <button
            className="cart-button"
            aria-label="Cart"
            onClick={() => setPanel("cart")}
          >
            <ShoppingBag size={18} />
            <span>Cart</span>
            <b>{cart.length}</b>
          </button>
          <button
            aria-label="Toggle navigation"
            aria-expanded={nav}
            className="icon-button menu-toggle"
            onClick={() => setNav(!nav)}
          >
            <Menu />
          </button>
        </div>
      </header>
      <section
        className="hero shell"
        onPointerMove={(event) => {
          if (!motion || event.pointerType !== "mouse") return;
          const rect = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty(
            "--pointer-x",
            ((event.clientX - rect.left) / rect.width - 0.5) * 20 + "px",
          );
          event.currentTarget.style.setProperty(
            "--pointer-y",
            ((event.clientY - rect.top) / rect.height - 0.5) * 14 + "px",
          );
        }}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty("--pointer-x", "0px");
          event.currentTarget.style.setProperty("--pointer-y", "0px");
        }}
      >
        <div className="hero-art" aria-hidden="true">
          <div className="starfield" />
          <div className="nebula" />
          <div className="shooting-star" />
          <div className="orbital orbit-one" />
          <div className="orbital orbit-two" />
          <div className="planet">
            <div className="planet-surface" />
          </div>
          <div className="planet-ring" />
          <div className="moon" />
          <div className="coordinate coordinate-top">
            SECTOR 07.24 <span>✦</span>
          </div>
          <div className="coordinate coordinate-bottom">
            UNEXPLORED WORLDS
            <br />
            INFINITE POSSIBILITIES
          </div>
          <span className="crosshair">+</span>
        </div>
        <div className="hero-content">
          <div className="eyebrow">
            <span className="live-dot" /> YOUR NEXT ADVENTURE STARTS HERE
          </div>
          <h1>
            Reality is
            <br />
            overrated<span>.</span>
          </h1>
          <p>
            New worlds. Unforgettable stories. Legendary play.
            <br className="desktop-break" /> Find your next obsession, right
            here on ORBIT.
          </p>
          <div className="hero-buttons">
            <button className="button primary" onClick={() => browse()}>
              Explore the store <ArrowUpRight size={19} />
            </button>
            <a className="button ghost" href="#spotlight">
              This week’s spotlight <ArrowRight size={17} />
            </a>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack">
              <span>JK</span>
              <span>AL</span>
              <span>MR</span>
              <span>+</span>
            </div>
            <div>
              <div className="stars">★★★★★</div>
              <p>Built for the love of play.</p>
            </div>
          </div>
        </div>
        <div className="hero-footer">
          <span>
            <span className="live-dot" /> ALL SYSTEMS ONLINE
          </span>
          <a href="#catalog">
            SCROLL TO DISCOVER <ArrowDown size={13} />
          </a>
          <span>
            01 <i>/</i> ∞
          </span>
        </div>
      </section>
      <div className="benefits shell">
        <span>
          <Zap />
          Instant digital adventures
        </span>
        <span>
          <ShieldCheck />
          Curated for your next favorite
        </span>
        <span>
          <Monitor />
          Made for PC players
        </span>
        <span>
          <Gamepad2 />
          Great games. Better prices.
        </span>
      </div>
      <section id="catalog" className="catalog shell" data-reveal>
        <div className="section-heading">
          <div>
            <div className="eyebrow muted">
              THE GOOD STUFF, ALL IN ONE PLACE
            </div>
            <h2>
              Find your next world<span>.</span>
            </h2>
          </div>
          <div className="catalog-count">
            <span className="live-dot" />
            {catalog.length} handpicked adventures
          </div>
        </div>
        <div className="catalog-tools">
          <div className="tabs" aria-label="Game genres">
            {[
              "All games",
              "RPG",
              "Adventure",
              "Racing",
              "Roguelike",
              "Simulation",
            ].map((c) => (
              <button
                key={c}
                className={genre === c ? "selected" : ""}
                aria-pressed={genre === c}
                onClick={() => setGenre(c)}
              >
                {c === "All games" && <Gamepad2 size={15} />} {c}
              </button>
            ))}
          </div>
          <div className="search-sort">
            <label className="search">
              <Search size={16} />
              <input
                aria-label="Search games"
                placeholder="Search games..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery("")}>
                  <X size={14} />
                </button>
              )}
            </label>
            <label className="sort">
              <SlidersHorizontal size={16} />
              <select
                aria-label="Sort games"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="popular">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="rating">Top rated</option>
                <option value="discount">Biggest discount</option>
              </select>
            </label>
          </div>
        </div>
        <div className="catalog-toolbar">
          <div className="budget-filter">
            <label htmlFor="budget">Your budget</label>
            <select
              id="budget"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            >
              <option value="all">Any price</option>
              <option value="15">Under $15</option>
              <option value="25">Under $25</option>
              <option value="40">Under $40</option>
            </select>
          </div>
          <p role="status" className="catalog-status">
            {catalogStatus === "loading"
              ? "Connecting to catalog…"
              : catalogStatus === "error"
                ? "Offline preview · checkout needs a connection"
                : filtered.length + " of " + catalog.length + " adventures"}
          </p>
          {catalogStatus === "error" && (
            <button
              className="button secondary"
              onClick={() => setRefresh((value) => value + 1)}
            >
              <RefreshCw size={16} /> Retry catalog
            </button>
          )}
          {(query || genre !== "All games" || budget !== "all") && (
            <button
              className="reset-filters"
              onClick={() => {
                setQuery("");
                setGenre("All games");
                setBudget("all");
              }}
            >
              Clear filters <X size={14} />
            </button>
          )}
        </div>
        <div
          className="game-grid"
          key={genre + ":" + query + ":" + sort + ":" + budget}
        >
          {filtered.map((game, index) => (
            <article
              className="game-card"
              key={game.id}
              style={{ animationDelay: index * 55 + "ms" }}
            >
              <div className="game-art">
                <button
                  className="art-button"
                  onClick={() => setSelected(game)}
                  aria-label={"View " + game.title}
                >
                  <img
                    src={cover(game.id)}
                    alt={game.title + " cover art"}
                    loading="lazy"
                  />
                  <span className="art-shade" />
                </button>
                <span className="game-tag" style={{ color: game.color }}>
                  <span /> {game.tag}
                </span>
                <button
                  className={
                    "wish-button " + (wishlist.includes(game.id) ? "saved" : "")
                  }
                  aria-label={
                    (wishlist.includes(game.id) ? "Remove from" : "Add to") +
                    " wishlist: " +
                    game.title
                  }
                  aria-pressed={wishlist.includes(game.id)}
                  onClick={() => wish(game.id)}
                >
                  <Heart
                    size={17}
                    fill={wishlist.includes(game.id) ? "currentColor" : "none"}
                  />
                </button>
                <span className="discount">
                  −{Math.round((1 - game.price / game.original) * 100)}%
                </span>
                <button
                  className="quick-add"
                  disabled={!ready || library.includes(game.id)}
                  aria-label={
                    library.includes(game.id)
                      ? game.title + " in demo library"
                      : "Add " + game.title + " to cart"
                  }
                  onClick={() => add(game)}
                >
                  {cart.includes(game.id) || library.includes(game.id) ? (
                    <Check size={19} />
                  ) : (
                    <Plus size={19} />
                  )}
                </button>
              </div>
              <div className="game-meta">
                <span>
                  {game.genre} <i>•</i> PC
                </span>
                <span className="rating">
                  <Star size={12} fill="currentColor" />
                  {game.rating}
                </span>
              </div>
              <button className="game-title" onClick={() => setSelected(game)}>
                {game.title}
              </button>
              <div className="game-bottom">
                <div>
                  <del>{money(game.original)}</del>
                  <strong>{money(game.price)}</strong>
                </div>
                <Monitor size={15} />
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="empty">
            <Search size={32} />
            <h3>No worlds found</h3>
            <p>Try a different title or explore another genre.</p>
            <button
              className="button secondary"
              onClick={() => {
                setQuery("");
                setGenre("All games");
                setBudget("all");
              }}
            >
              Reset filters
            </button>
          </div>
        )}
        <div className="catalog-note">
          A universe of possibilities. One great place to start.{" "}
          <Sparkles size={14} />
        </div>
      </section>
      <section
        id="spotlight"
        className="spotlight shell cinematic-spotlight"
        ref={spotlight}
        data-reveal
        aria-label="Featured games"
        aria-roledescription="carousel"
        onMouseEnter={() => setSpotlightPaused(true)}
        onMouseLeave={() => {
          if (!spotlight.current?.contains(document.activeElement))
            setSpotlightPaused(false);
        }}
        onFocusCapture={() => setSpotlightPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            setSpotlightPaused(false);
        }}
      >
        <div
          key={featured.id}
          className="spotlight-scene"
          aria-live={spotlightPaused || !motion ? "polite" : "off"}
        >
          <img
            className="spotlight-backdrop"
            src={
              featured.id === 1091500
                ? "/games/spotlight.jpg"
                : cover(featured.id)
            }
            alt=""
            loading="lazy"
          />
          <div className="spotlight-shade" />
          <img
            className="spotlight-cover"
            src={cover(featured.id)}
            alt={featured.title + " featured artwork"}
            loading="lazy"
          />
          <div className="spotlight-content">
            <div className="eyebrow">
              <Zap size={14} /> THE ORBIT SPOTLIGHT
            </div>
            <h2>
              {featured.title}
              <span>.</span>
            </h2>
            <p>{featured.description}</p>
            <div className="spotlight-price">
              <span className="discount">
                −{Math.round((1 - featured.price / featured.original) * 100)}%
              </span>
              <del>{money(featured.original)}</del>
              <strong>{money(featured.price)}</strong>
            </div>
            <button
              className="button primary"
              onClick={() => setSelected(featured)}
            >
              Discover {featured.title} <Gamepad2 size={18} />
            </button>
          </div>
        </div>
        <div className="spotlight-controls">
          <div className="slide-picker" aria-label="Choose featured game">
            {featuredIds.map((id, index) => (
              <button
                key={id}
                aria-label={
                  "Feature " +
                  (catalog.find((game) => game.id === id)?.title ?? "game")
                }
                aria-pressed={slide === index}
                onClick={() => setSlide(index)}
              >
                <span />
              </button>
            ))}
          </div>
          <span className="slide-counter">
            {String(slide + 1).padStart(2, "0")} /{" "}
            {String(featuredIds.length).padStart(2, "0")}
          </span>
          <button
            className="icon-button"
            aria-label="Previous featured game"
            onClick={() =>
              setSlide(
                (current) =>
                  (current + featuredIds.length - 1) % featuredIds.length,
              )
            }
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="icon-button"
            aria-label="Next featured game"
            onClick={() =>
              setSlide((current) => (current + 1) % featuredIds.length)
            }
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>
      <section className="community shell" id="community" data-reveal>
        <div className="community-icon">
          <Orbit size={60} strokeWidth={1} />
          <div />
        </div>
        <div>
          <div className="eyebrow muted">STAY IN THE LOOP</div>
          <h2>Your inbox. Upgraded.</h2>
          <p>New releases, hidden gems, and deals worth pausing for.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setJoined(true);
          }}
        >
          <div className="email-field">
            <input
              aria-label="Email address"
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setJoined(false);
              }}
            />
            <button aria-label="Preview newsletter signup" type="submit">
              <ArrowRight size={20} />
            </button>
          </div>
          <p role="status">
            {joined
              ? "You’re on the demo list! No email was sent."
              : "Demo signup. Good games. Zero noise."}
          </p>
        </form>
      </section>
      <footer className="footer shell">
        <a className="brand" href="#">
          <Orbit size={25} />
          ORBIT<span>®</span>
        </a>
        <p>For the worlds we haven’t discovered yet.</p>
        <span>© {new Date().getFullYear()} ORBIT · Concept storefront</span>
        <a href="#catalog">
          Back to the games <ArrowUpRight size={14} />
        </a>
      </footer>
      <dialog
        aria-label={
          selected
            ? selected.title
            : panel === "wishlist"
              ? "Your wishlist"
              : panel === "library"
                ? "Your demo library"
                : panel === "checkout"
                  ? "Checkout preview"
                  : "Your cart"
        }
        ref={dialog}
        onCancel={close}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        <div className="dialog-inner" key={selected?.id ?? panel}>
          <button
            className="dialog-close icon-button"
            onClick={close}
            aria-label="Close dialog"
          >
            <X />
          </button>
          {selected ? (
            <>
              <img
                className="detail-image"
                src={cover(selected.id)}
                alt={selected.title}
              />
              <div className="eyebrow muted">
                {selected.genre} / PC DIGITAL EDITION
              </div>
              <h2>{selected.title}</h2>
              <p>{selected.description}</p>
              <div className="detail-info">
                <span>
                  <Star size={15} /> {selected.rating} community rating
                </span>
                <span>
                  <Monitor size={15} /> Windows PC
                </span>
              </div>
              <div className="detail-price">
                <del>{money(selected.original)}</del>
                <strong>{money(selected.price)}</strong>
              </div>
              <button
                className="button primary full"
                onClick={() => {
                  add(selected);
                  setSelected(null);
                  setPanel(library.includes(selected.id) ? "library" : "cart");
                }}
              >
                {library.includes(selected.id)
                  ? "In your demo library"
                  : cart.includes(selected.id)
                    ? "View in cart"
                    : "Add to cart"}
                <ShoppingBag size={18} />
              </button>
              <p className="fine-print">
                Demo catalog. Prices are illustrative. No game keys are
                delivered.
              </p>
            </>
          ) : panel === "checkout" ? (
            <>
              <div className="checkout-icon">
                <ShieldCheck size={38} />
              </div>
              <div className="eyebrow muted">
                {receipt ? "MISSION COMPLETE" : "CHECKOUT PREVIEW"}
              </div>
              <h2>
                {receipt
                  ? "Your next world is waiting."
                  : "Ready for your next adventure?"}
              </h2>
              <p>
                This is a demo storefront. Payments and game delivery are not
                connected, and you won’t be charged.
              </p>
              {receipt && (
                <p className="order-reference">Demo receipt: {receipt.id}</p>
              )}
              <div className="receipt">
                {(receipt
                  ? receipt.items.map((item) => ({
                      id: item.id,
                      title: item.title,
                      price: item.priceCents / 100,
                    }))
                  : cartGames
                ).map((g) => (
                  <div key={g.id}>
                    <span>{g.title}</span>
                    <strong>{money(g.price)}</strong>
                  </div>
                ))}
                <div className="receipt-total">
                  <span>Total · USD</span>
                  <strong>
                    {money(receipt ? receipt.totalCents / 100 : total)}
                  </strong>
                </div>
              </div>
              {checkoutError && (
                <p className="checkout-error" role="alert">
                  {checkoutError}
                </p>
              )}
              {receipt ? (
                <button
                  className="button primary full"
                  onClick={() => setPanel("library")}
                >
                  <Library size={18} /> Open demo library
                </button>
              ) : (
                <button
                  className="button primary full"
                  disabled={submitting || !ready || cart.length === 0}
                  onClick={checkout}
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="loading-icon" size={18} />{" "}
                      Confirming with server…
                    </>
                  ) : (
                    <>
                      <Check size={18} /> Complete demo order
                    </>
                  )}
                </button>
              )}
              <p className="fine-print">
                Demo collection is saved in this browser. No downloads or
                license keys.
              </p>
              <button
                className="button secondary full"
                disabled={submitting}
                onClick={() => setPanel("cart")}
              >
                Back to your cart <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <>
              <div className="eyebrow muted">YOUR NEXT ADVENTURE</div>
              <h2>
                {panel === "wishlist"
                  ? "Your wishlist"
                  : panel === "library"
                    ? "Your demo library"
                    : "Your cart"}
                <span>.</span>
              </h2>
              {panel === "library" && (
                <p>
                  Your demo collection, saved on this device. No games were
                  purchased and no keys are delivered.
                </p>
              )}
              {(panel === "library"
                ? catalog.filter((g) => library.includes(g.id))
                : panel === "wishlist"
                  ? catalog.filter((g) => wishlist.includes(g.id))
                  : cartGames
              ).map((g) => (
                <div className="cart-row" key={g.id}>
                  <img src={cover(g.id)} alt="" />
                  <div>
                    <h3>{g.title}</h3>
                    <span>PC · Digital edition</span>
                    <strong>{money(g.price)}</strong>
                  </div>
                  <div className="row-actions">
                    {panel === "wishlist" && (
                      <button
                        className="icon-button"
                        aria-label={"Add " + g.title + " to cart"}
                        onClick={() => add(g)}
                      >
                        {cart.includes(g.id) ? (
                          <Check size={17} />
                        ) : (
                          <Plus size={17} />
                        )}
                      </button>
                    )}
                    <button
                      className="icon-button"
                      aria-label={"Remove " + g.title}
                      disabled={submitting}
                      onClick={() =>
                        panel === "library"
                          ? setLibrary((current) =>
                              current.filter((id) => id !== g.id),
                            )
                          : panel === "wishlist"
                            ? wish(g.id)
                            : setCart((c) => c.filter((id) => id !== g.id))
                      }
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>
              ))}
              {(panel === "library"
                ? library.length
                : panel === "wishlist"
                  ? wishlist.length
                  : cart.length) === 0 ? (
                <div className="empty">
                  <Gamepad2 size={40} />
                  <h3>Your next favorite is out there.</h3>
                  <p>
                    {panel === "wishlist"
                      ? "Tap a heart to save games for later."
                      : "Explore the collection and start your adventure."}
                  </p>
                  <button
                    className="button primary"
                    onClick={() => {
                      close();
                      browse();
                    }}
                  >
                    Explore games <ArrowRight size={16} />
                  </button>
                </div>
              ) : panel === "cart" ? (
                <>
                  <div className="receipt-total">
                    <span>Subtotal · USD</span>
                    <strong>{money(total)}</strong>
                  </div>
                  <button
                    className="button primary full"
                    disabled={submitting || !ready}
                    onClick={() => {
                      setReceipt(null);
                      setCheckoutError("");
                      setPanel("checkout");
                    }}
                  >
                    Preview checkout <ArrowRight size={18} />
                  </button>
                  <p className="fine-print">Demo store · No payment required</p>
                </>
              ) : (
                <button
                  className="button secondary full"
                  onClick={() => {
                    close();
                    browse();
                  }}
                >
                  Keep exploring <ArrowRight size={18} />
                </button>
              )}
            </>
          )}
        </div>
      </dialog>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </main>
  );
}
