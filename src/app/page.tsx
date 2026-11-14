"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
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

type Panel = "cart" | "wishlist" | "checkout" | null;
export default function Home() {
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
    try {
      const c = JSON.parse(localStorage.getItem("orbit-cart") || "[]");
      const w = JSON.parse(localStorage.getItem("orbit-wishlist") || "[]");
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
      } catch {}
  }, [cart, wishlist, ready]);
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
  function close() {
    setPanel(null);
    setSelected(null);
  }
  function add(game: Game) {
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
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  }
  const filtered = games
    .filter(
      (g) =>
        (genre === "All games" || g.genre === genre) &&
        g.title.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "rating"
          ? Number(b.rating) - Number(a.rating)
          : 0,
    );
  const cartGames = games.filter((g) => cart.includes(g.id));
  const total = cartGames.reduce((s, g) => s + g.price, 0);
  return (
    <main>
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
      <section className="hero shell">
        <div className="hero-art" aria-hidden="true">
          <div className="starfield" />
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
      <section id="catalog" className="catalog shell">
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
            {games.length} handpicked adventures
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
                <option value="rating">Top rated</option>
              </select>
            </label>
          </div>
        </div>
        <div className="game-grid">
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
                  aria-label={"Add " + game.title + " to cart"}
                  onClick={() => add(game)}
                >
                  {cart.includes(game.id) ? (
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
      <section id="spotlight" className="spotlight shell">
        <img
          src="/games/spotlight.jpg"
          alt="Night City from Cyberpunk 2077"
          loading="lazy"
        />
        <div className="spotlight-shade" />
        <div className="spotlight-content">
          <div className="eyebrow">
            <Zap size={14} /> THE ORBIT SPOTLIGHT
          </div>
          <h2>
            Welcome to
            <br />
            the neon future.
          </h2>
          <p>
            Night City is calling. Make a name for yourself
            <br />
            in Cyberpunk 2077’s electric open world.
          </p>
          <div className="spotlight-price">
            <span className="discount">−50%</span>
            <del>$59.99</del>
            <strong>$29.99</strong>
          </div>
          <button
            className="button primary"
            onClick={() => setSelected(games[0])}
          >
            Discover Cyberpunk 2077 <ArrowUpRight size={18} />
          </button>
        </div>
        <div className="spotlight-number">
          01 <span>/ SPOTLIGHT</span>
        </div>
      </section>
      <section className="community shell" id="community">
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
        <div className="dialog-inner">
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
                  setPanel("cart");
                }}
              >
                {cart.includes(selected.id) ? "View in cart" : "Add to cart"}
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
              <div className="eyebrow muted">CHECKOUT PREVIEW</div>
              <h2>Ready for your next adventure?</h2>
              <p>
                This is a demo storefront. Payments and game delivery are not
                connected, and you won’t be charged.
              </p>
              <div className="receipt">
                {cartGames.map((g) => (
                  <div key={g.id}>
                    <span>{g.title}</span>
                    <strong>{money(g.price)}</strong>
                  </div>
                ))}
                <div className="receipt-total">
                  <span>Total · USD</span>
                  <strong>{money(total)}</strong>
                </div>
              </div>
              <button
                className="button primary full"
                onClick={() => setPanel("cart")}
              >
                Back to your cart <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <>
              <div className="eyebrow muted">YOUR NEXT ADVENTURE</div>
              <h2>
                {panel === "wishlist" ? "Your wishlist" : "Your cart"}
                <span>.</span>
              </h2>
              {(panel === "wishlist"
                ? games.filter((g) => wishlist.includes(g.id))
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
                      onClick={() =>
                        panel === "wishlist"
                          ? wish(g.id)
                          : setCart((c) => c.filter((id) => id !== g.id))
                      }
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>
              ))}
              {(panel === "wishlist" ? wishlist.length : cart.length) === 0 ? (
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
                    onClick={() => setPanel("checkout")}
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
