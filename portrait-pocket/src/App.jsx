import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CaretDown,
  CheckCircle,
  CreditCard,
  Heart,
  List,
  LockKey,
  MagnifyingGlass,
  Minus,
  Plus,
  ShoppingBag,
  Sparkle,
  Truck,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import { AdminDashboard } from "./AdminDashboard.jsx";
import {
  adminSettings,
  createAdminProducts,
  createMockAnalyticsEvents,
  createMockCheckoutSessions,
  createMockOrders,
} from "./adminData.js";
import accessorySheet from "./assets/accessory-product-sheet.png";
import bookmarkSheet from "./assets/bookmark-product-sheet.png";

const categories = ["All", "Button Pins", "Hairclips", "Stickers", "Bookmarks"];

const products = [
  {
    id: "TPP-PIN-01",
    name: "Strawberry Pocket Button Pin",
    category: "Button Pins",
    price: 45,
    badge: "Bestseller",
    description: "A sweet pocket pin with berry-soft charm for jackets, bags and pin boards.",
    art: { sheet: "accessory", cols: 3, rows: 3, x: 0, y: 0, ratio: "square" },
  },
  {
    id: "TPP-PIN-02",
    name: "Blue Bow Button Pin",
    category: "Button Pins",
    price: 45,
    badge: "New",
    description: "A gentle blue gingham pin with a tiny bow mood and cozy desk energy.",
    art: { sheet: "accessory", cols: 3, rows: 3, x: 1, y: 0, ratio: "square" },
  },
  {
    id: "TPP-HC-01",
    name: "Blush Ribbon Hairclip",
    category: "Hairclips",
    price: 55,
    badge: "Limited",
    description: "A soft blush ribbon clip for everyday outfits and little collection trays.",
    art: { sheet: "accessory", cols: 3, rows: 3, x: 2, y: 0, ratio: "wide" },
  },
  {
    id: "TPP-HC-02",
    name: "Misty Star Hairclip",
    category: "Hairclips",
    price: 55,
    badge: "New",
    description: "A mist-blue star clip with moonlit details and a soft handmade feel.",
    art: { sheet: "accessory", cols: 3, rows: 3, x: 0, y: 1, ratio: "wide" },
  },
  {
    id: "TPP-STK-01",
    name: "Tiny Portrait Sticker",
    category: "Stickers",
    price: 35,
    badge: "Bestseller",
    description: "A tiny illustrated portrait sticker for journals, cases and snail mail.",
    art: { sheet: "accessory", cols: 3, rows: 3, x: 1, y: 1, ratio: "square" },
  },
  {
    id: "TPP-STK-02",
    name: "Cozy Desk Sticker",
    category: "Stickers",
    price: 35,
    badge: "New",
    description: "Lamp light, tea and stacked books in one soft desk sticker.",
    art: { sheet: "accessory", cols: 3, rows: 3, x: 2, y: 1, ratio: "square" },
  },
  {
    id: "TPP-STK-03",
    name: "Fairy Pocket Sticker",
    category: "Stickers",
    price: 35,
    badge: "Limited",
    description: "A pocket-sized fairy sticker for tiny collections and dreamy corners.",
    art: { sheet: "accessory", cols: 3, rows: 3, x: 0, y: 2, ratio: "square" },
  },
  {
    id: "TPP-STK-04",
    name: "Blue Garden Sticker",
    category: "Stickers",
    price: 30,
    badge: "Favorite",
    description: "Blue garden blooms with a calm handmade-paper finish.",
    art: { sheet: "accessory", cols: 3, rows: 3, x: 1, y: 2, ratio: "square" },
  },
  {
    id: "TPP-STK-05",
    name: "Sweet Letter Sticker",
    category: "Stickers",
    price: 30,
    badge: "New",
    description: "A soft envelope sticker for letters, planners and gentle notes.",
    art: { sheet: "accessory", cols: 3, rows: 3, x: 2, y: 2, ratio: "square" },
  },
  ...Array.from({ length: 12 }, (_, index) => {
    const names = [
      "Garden Portrait Bookmark",
      "Blush Ribbon Bookmark",
      "Misty Moon Bookmark",
      "Sage Bookshelf Bookmark",
      "Tiny Tea Desk Bookmark",
      "Blue Flowers Bookmark",
      "Cozy Window Bookmark",
      "Fairy Pocket Bookmark",
      "Letter Bouquet Bookmark",
      "Soft Clouds Bookmark",
      "Strawberry Meadow Bookmark",
      "Golden Frame Bookmark",
    ];
    const badges = ["New", "Favorite", "Limited", "", "Cozy pick", "", "", "New", "", "", "Bestseller", "Limited"];
    return {
      id: `TPP-BMK-${String(index + 1).padStart(2, "0")}`,
      name: names[index],
      category: "Bookmarks",
      price: index % 3 === 0 ? 45 : 35,
      badge: badges[index],
      description: "A portrait-format bookmark for current reads, journal stacks and cozy shelves.",
      art: {
        sheet: "bookmark",
        cols: 3,
        rows: 4,
        x: index % 3,
        y: Math.floor(index / 3),
        ratio: "bookmark",
      },
    };
  }),
];

const sheetMap = {
  accessory: accessorySheet,
  bookmark: bookmarkSheet,
};

const appBasePath = "/the-portrait-pocket";

function createClientId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSessionId() {
  const storageKey = "tpp-session-id";
  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;
  const sessionId = createClientId("session");
  sessionStorage.setItem(storageKey, sessionId);
  return sessionId;
}

function getInitialPageFromPath() {
  const path = window.location.pathname.replace(/\/$/, "");
  return path === "/admin" || path === `${appBasePath}/admin` ? "admin" : "home";
}

function pageToPath(page) {
  return page === "admin" ? `${appBasePath}/admin` : `${appBasePath}/`;
}

function formatPrice(price) {
  return `${price} kr`;
}

function AnnouncementBar() {
  return (
    <div className="announcement">
      <Sparkle weight="fill" aria-hidden="true" />
      <span>Tiny treasures for your bag, books and desk</span>
      <Sparkle weight="fill" aria-hidden="true" />
    </div>
  );
}

function Header({ currentPage, onNavigate, cartCount, onCartOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    ["home", "Home"],
    ["shop", "Shop"],
    ["info", "About"],
    ["info", "FAQ"],
    ["info", "Contact"],
  ];

  function goTo(target) {
    setMenuOpen(false);
    onNavigate(target);
  }

  return (
    <header className="site-header">
      <div className="header-top shell">
        <button className="icon-button" type="button" aria-label="Search products" onClick={() => goTo("shop")}>
          <MagnifyingGlass size={22} />
        </button>
        <button className="logo" type="button" onClick={() => goTo("home")} aria-label="Go to home page">
          <span>The</span>
          <strong>Pocket Portrait</strong>
        </button>
        <div className="header-actions">
          <span className="currency">Sweden | SEK kr</span>
          <button className="icon-button" type="button" aria-label="Account placeholder">
            <UserCircle size={24} />
          </button>
          <button
            className="icon-button menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} /> : <List size={24} />}
          </button>
          <button className="icon-button cart-trigger" type="button" aria-label={`Open cart with ${cartCount} items`} onClick={onCartOpen}>
            <ShoppingBag size={24} />
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>
        </div>
      </div>
      <nav id="primary-navigation" className={`main-nav shell ${menuOpen ? "open" : ""}`} aria-label="Primary navigation">
        {links.map(([target, label]) => (
          <button
            key={`${target}-${label}`}
            className={`${currentPage === target || (target.startsWith("shop") && currentPage.startsWith("shop")) ? "active" : ""} ${
              target === "shop" ? "shop-link" : ""
            }`}
            type="button"
            onClick={() => goTo(target)}
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}

function ProductArt({ product, priority = false }) {
  const art = product.art;
  return (
    <div className={`product-art product-art-${art.ratio}`}>
      <img
        src={sheetMap[art.sheet]}
        alt={`${product.name} illustrated product art`}
        loading={priority ? "eager" : "lazy"}
        style={{
          "--cols": art.cols,
          "--rows": art.rows,
          "--x": art.x,
          "--y": art.y,
        }}
      />
    </div>
  );
}

function Badge({ children }) {
  if (!children) return null;
  return <span className="badge">{children}</span>;
}

function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button className={`button button-${variant} ${className}`} type="button" {...props}>
      {children}
    </button>
  );
}

function ProductCard({ product, onView, onAdd, featured = false }) {
  return (
    <article className={`product-card ${featured ? "featured-card" : ""}`}>
      <button className="product-image-link" type="button" onClick={() => onView(product.id)}>
        <ProductArt product={product} priority={featured} />
        <Badge>{product.badge}</Badge>
      </button>
      <div className="product-card-body">
        <p className="product-category">{product.category}</p>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-card-footer">
          <strong>{formatPrice(product.price)}</strong>
          <Button variant="ghost" onClick={() => onAdd(product, 1)}>
            Add
          </Button>
        </div>
        <button className="text-link" type="button" onClick={() => onView(product.id)}>
          View product
        </button>
      </div>
    </article>
  );
}

function ProductGrid({ products: shownProducts, onView, onAdd, featured = false }) {
  return (
    <div className={`product-grid ${featured ? "featured-grid" : ""}`}>
      {shownProducts.map((product) => (
        <ProductCard key={product.id} product={product} onView={onView} onAdd={onAdd} featured={featured} />
      ))}
    </div>
  );
}

function CategoryCard({ title, copy, category, onNavigate }) {
  return (
    <button className="category-card" type="button" onClick={() => onNavigate(`shop:${category}`)}>
      <Heart weight="fill" aria-hidden="true" />
      <span>{title}</span>
      <small>{copy}</small>
    </button>
  );
}

function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function submit(event) {
    event.preventDefault();
    setMessage(email ? "Thank you. Your cozy note is saved for this prototype." : "Add an email first.");
  }

  return (
    <section className="newsletter shell" aria-labelledby="newsletter-title">
      <div>
        <p className="eyebrow">Pocket post</p>
        <h2 id="newsletter-title">Little updates for collectors</h2>
      </div>
      <form onSubmit={submit}>
        <label htmlFor="newsletter-email">Email address</label>
        <div className="newsletter-field">
          <input
            id="newsletter-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button className="button button-primary" type="submit">
            Join
          </button>
        </div>
        <p aria-live="polite">{message}</p>
      </form>
    </section>
  );
}

function HomePage({ onNavigate, onView, onAdd }) {
  const featured = [products[0], products[1], products[4], products[9]];

  return (
    <>
      <section className="hero">
        <div className="shell hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">The Pocket Portrait</p>
            <h1>Small merch with big personality</h1>
            <p>Pins, hairclips, stickers and bookmarks made for tiny collections, cozy desks and everyday pockets.</p>
            <div className="hero-actions">
              <Button onClick={() => onNavigate("shop")}>Shop the collection</Button>
              <Button variant="secondary" onClick={() => onNavigate("shop:Bookmarks")}>
                View bookmarks
              </Button>
            </div>
          </div>
          <div className="hero-feature" aria-label="Featured handmade product art">
            <ProductArt product={products[10]} priority />
            <div className="hero-note">
              <Sparkle weight="fill" aria-hidden="true" />
              <span>New bookmark drop</span>
            </div>
          </div>
        </div>
      </section>

      <section className="category-section shell" aria-labelledby="category-title">
        <div className="section-heading">
          <p className="eyebrow">Browse by shelf</p>
          <h2 id="category-title">Pick your pocket-sized piece</h2>
        </div>
        <div className="category-grid">
          <CategoryCard title="Button Pins" copy="Soft jacket and tote details" category="Button Pins" onNavigate={onNavigate} />
          <CategoryCard title="Hairclips" copy="Tiny ribbon and star moments" category="Hairclips" onNavigate={onNavigate} />
          <CategoryCard title="Stickers" copy="Journal-ready illustrated bits" category="Stickers" onNavigate={onNavigate} />
          <CategoryCard title="Bookmarks" copy="Portrait pieces for current reads" category="Bookmarks" onNavigate={onNavigate} />
        </div>
      </section>

      <section className="featured-section" aria-labelledby="featured-title">
        <div className="shell">
          <div className="section-heading">
            <h2 id="featured-title">Featured</h2>
          </div>
          <ProductGrid products={featured} onView={onView} onAdd={onAdd} featured />
          <div className="centered-action">
            <Button variant="ghost" onClick={() => onNavigate("shop")}>
              All products
            </Button>
          </div>
        </div>
      </section>

      <section className="bookmark-band shell" aria-labelledby="bookmark-title">
        <div>
          <p className="eyebrow">Bookmark corner</p>
          <h2 id="bookmark-title">For books with soft little worlds inside</h2>
          <p>
            The bookmark collection is made for readers who like a small illustrated companion tucked into every chapter.
          </p>
          <Button variant="secondary" onClick={() => onNavigate("shop:Bookmarks")}>
            Shop bookmarks
          </Button>
        </div>
        <div className="bookmark-strip">
          {[9, 10, 11].map((index) => (
            <ProductArt key={products[index].id} product={products[index]} />
          ))}
        </div>
      </section>

      <section className="about-preview shell" aria-labelledby="about-title">
        <div>
          <p className="eyebrow">Small artist shop</p>
          <h2 id="about-title">Made for collectors, readers and cozy little corners.</h2>
        </div>
        <p>
          The Pocket Portrait gathers illustrated tiny treasures with a handmade feeling: soft colors, gentle characters,
          and pieces that feel personal enough to keep close.
        </p>
        <Button variant="ghost" onClick={() => onNavigate("info")}>
          Read about the shop
        </Button>
      </section>

      <NewsletterSignup />
    </>
  );
}

function ShopPage({ initialCategory = "All", onView, onAdd, onTrack }) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sort, setSort] = useState("Featured");
  const [query, setQuery] = useState("");

  const shownProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory !== "All") {
      result = result.filter((product) => product.category === selectedCategory);
    }
    if (query.trim()) {
      const normalized = query.toLowerCase();
      result = result.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(normalized));
    }
    if (sort === "Price low to high") result.sort((a, b) => a.price - b.price);
    if (sort === "Price high to low") result.sort((a, b) => b.price - a.price);
    if (sort === "Newest") result.sort((a, b) => (b.badge === "New") - (a.badge === "New"));
    return result;
  }, [selectedCategory, sort, query]);

  function updateQuery(value) {
    setQuery(value);
    if (value.trim().length > 1) {
      onTrack("search_used", { page: "shop", buttonName: "Search", metadata: { query: value.trim() } });
    }
  }

  function updateCategory(category) {
    setSelectedCategory(category);
    onTrack("category_filter_used", { page: "shop", buttonName: category, metadata: { category } });
  }

  return (
    <main className="shop-page shell">
      <div className="shop-intro">
        <p className="eyebrow">Shop all</p>
        <h1>Browse pocket-sized prints, pins, clips, stickers and bookmarks.</h1>
      </div>
      <div className="shop-tools">
        <div className="search-field">
          <label htmlFor="product-search">Search</label>
          <input
            id="product-search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Find tiny treasures"
          />
        </div>
        <div className="sort-field">
          <label htmlFor="product-sort">Sort</label>
          <select id="product-sort" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option>Featured</option>
            <option>Price low to high</option>
            <option>Price high to low</option>
            <option>Newest</option>
          </select>
        </div>
      </div>
      <div className="filter-chips" aria-label="Category filters">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={selectedCategory === category ? "selected" : ""}
            onClick={() => updateCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <ProductGrid products={shownProducts} onView={onView} onAdd={onAdd} />
    </main>
  );
}

function QuantityStepper({ value, onChange, min = 1 }) {
  return (
    <div className="quantity-stepper">
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(Math.max(min, value - 1))}>
        <Minus size={16} />
      </button>
      <span>{value}</span>
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(value + 1)}>
        <Plus size={16} />
      </button>
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }) {
  return (
    <details className="accordion" open={defaultOpen}>
      <summary>
        {title}
        <CaretDown aria-hidden="true" />
      </summary>
      <div>{children}</div>
    </details>
  );
}

function ProductPage({ product, onNavigate, onAdd, onView }) {
  const [quantity, setQuantity] = useState(1);
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);

  return (
    <main className="product-page shell">
      <button className="back-link" type="button" onClick={() => onNavigate("shop")}>
        Back to shop
      </button>
      <div className="product-detail">
        <div className="product-gallery">
          <ProductArt product={product} priority />
        </div>
        <div className="product-info">
          <Badge>{product.category}</Badge>
          <h1>{product.name}</h1>
          <p className="product-price">{formatPrice(product.price)}</p>
          <p>{product.description}</p>
          <div className="detail-actions">
            <QuantityStepper value={quantity} onChange={setQuantity} />
            <Button onClick={() => onAdd(product, quantity)}>Add to cart</Button>
          </div>
          <div className="accordions">
            <Accordion title="Details" defaultOpen>
              Illustrated collectible merch with a soft matte finish and cozy pastel palette.
            </Accordion>
            <Accordion title="Shipping">
              Shipping details are a placeholder for now and will be shaped later.
            </Accordion>
            <Accordion title="Care">
              Keep dry, store flat when possible, and avoid long exposure to direct sun.
            </Accordion>
          </div>
        </div>
      </div>
      <section className="related-products" aria-labelledby="related-title">
        <div className="section-heading">
          <h2 id="related-title">Related tiny treasures</h2>
        </div>
        <ProductGrid products={related.length ? related : products.slice(0, 4)} onView={onView} onAdd={onAdd} />
      </section>
    </main>
  );
}

function InfoPage() {
  const faqs = [
    ["How long does shipping take?", "Shipping timing is a placeholder while the shop policy is being finalized."],
    ["Do you ship internationally?", "International shipping details will be worked on later."],
    ["Are the bookmarks handmade?", "They are designed with a handmade illustrated look and produced as small shop merch."],
    ["Can I track my order?", "Tracking details will depend on the final shipping setup."],
    ["How do I contact you?", "Use the contact note below for now; a real contact method can be connected later."],
  ];

  return (
    <main className="info-page shell">
      <section className="info-hero">
        <p className="eyebrow">About the pocket</p>
        <h1>A small illustrated shop for tiny keepsakes.</h1>
        <p>
          The Pocket Portrait is a cozy boutique for soft illustrated bookmarks, stickers, pins and clips. Every product
          is meant to feel collectible, personal and easy to tuck into everyday life.
        </p>
      </section>
      <section className="info-grid">
        <div className="info-card">
          <h2>Shipping</h2>
          <p>Shipping policy copy is intentionally light for now. We will work on the details later.</p>
        </div>
        <div className="info-card">
          <h2>Contact</h2>
          <p>For this prototype, contact is a placeholder. A real email, form or social link can be added next.</p>
        </div>
      </section>
      <section className="faq-section" aria-labelledby="faq-title">
        <h2 id="faq-title">FAQ</h2>
        {faqs.map(([question, answer], index) => (
          <Accordion key={question} title={question} defaultOpen={index === 0}>
            {answer}
          </Accordion>
        ))}
      </section>
    </main>
  );
}

function CheckoutPage({ items, onNavigate, onCartOpen, onQuantityChange, onRemove, onPaymentComplete }) {
  const [details, setDetails] = useState({
    email: "",
    fullName: "",
    country: "Sweden",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    note: "",
  });
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  function updateDetail(field, value) {
    setDetails((current) => ({ ...current, [field]: value }));
  }

  function submitCheckout(event) {
    event.preventDefault();
    if (!items.length) {
      setMessage("Add a tiny treasure before checking out.");
      return;
    }
    const required = ["email", "fullName", "address", "city", "postalCode"];
    if (required.some((field) => !details[field].trim())) {
      setMessage("Fill in the required checkout details first.");
      return;
    }
    onPaymentComplete(details);
    setSubmitted(true);
    setMessage("Your test order is ready for Stripe payment wiring.");
  }

  if (items.length === 0) {
    return (
      <main className="checkout-page shell">
        <section className="checkout-empty">
          <p className="eyebrow">Checkout</p>
          <h1>Your pocket is empty</h1>
          <p>Add a few tiny treasures, then come back to checkout.</p>
          <Button onClick={() => onNavigate("shop")}>
            <ArrowLeft weight="bold" aria-hidden="true" />
            Back to shop
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page shell">
      <button className="back-link checkout-back" type="button" onClick={() => onNavigate("shop")}>
        <ArrowLeft size={18} weight="bold" aria-hidden="true" />
        Back to shop
      </button>
      <div className="checkout-intro">
        <p className="eyebrow">Secure checkout</p>
        <h1>Finish your tiny order</h1>
        <p>Confirm your contact details and review the pieces tucked inside your pocket.</p>
      </div>
      <div className="checkout-layout">
        <form className="checkout-panel" onSubmit={submitCheckout}>
          <section className="checkout-section" aria-labelledby="contact-title">
            <div className="checkout-section-heading">
              <CheckCircle weight="fill" aria-hidden="true" />
              <h2 id="contact-title">Contact</h2>
            </div>
            <div className="checkout-fields">
              <label>
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  value={details.email}
                  onChange={(event) => updateDetail("email", event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label>
                Full name
                <input
                  autoComplete="name"
                  value={details.fullName}
                  onChange={(event) => updateDetail("fullName", event.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>
            </div>
          </section>

          <section className="checkout-section" aria-labelledby="delivery-title">
            <div className="checkout-section-heading">
              <Truck weight="fill" aria-hidden="true" />
              <h2 id="delivery-title">Delivery details</h2>
            </div>
            <div className="checkout-fields checkout-fields-two">
              <label>
                Country
                <select
                  autoComplete="country-name"
                  value={details.country}
                  onChange={(event) => updateDetail("country", event.target.value)}
                >
                  <option>Sweden</option>
                  <option>Norway</option>
                  <option>Denmark</option>
                  <option>Finland</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Postal code
                <input
                  autoComplete="postal-code"
                  value={details.postalCode}
                  onChange={(event) => updateDetail("postalCode", event.target.value)}
                  placeholder="123 45"
                  required
                />
              </label>
              <label className="wide-field">
                Address
                <input
                  autoComplete="street-address"
                  value={details.address}
                  onChange={(event) => updateDetail("address", event.target.value)}
                  placeholder="Street and number"
                  required
                />
              </label>
              <label>
                Apartment
                <input
                  autoComplete="address-line2"
                  value={details.apartment}
                  onChange={(event) => updateDetail("apartment", event.target.value)}
                  placeholder="Optional"
                />
              </label>
              <label>
                City
                <input
                  autoComplete="address-level2"
                  value={details.city}
                  onChange={(event) => updateDetail("city", event.target.value)}
                  placeholder="City"
                  required
                />
              </label>
              <label className="wide-field">
                Order note
                <textarea
                  rows="4"
                  value={details.note}
                  onChange={(event) => updateDetail("note", event.target.value)}
                  placeholder="Gift note or delivery detail"
                />
              </label>
            </div>
          </section>

          <section className="checkout-section" aria-labelledby="payment-title">
            <div className="checkout-section-heading">
              <CreditCard weight="fill" aria-hidden="true" />
              <h2 id="payment-title">Payment</h2>
            </div>
            <div className="payment-placeholder">
              <LockKey weight="fill" aria-hidden="true" />
              <div>
                <strong>Stripe sandbox checkout</strong>
                <p>Payment is ready for the next setup step. This button saves a test order in the prototype.</p>
              </div>
            </div>
          </section>

          <div className="checkout-actions">
            <Button className="checkout-submit" type="submit">
              <LockKey weight="bold" aria-hidden="true" />
              Place test order
            </Button>
            <p aria-live="polite" className={submitted ? "checkout-success" : ""}>
              {message}
            </p>
          </div>
        </form>

        <aside className="checkout-summary" aria-labelledby="summary-title">
          <div className="summary-heading">
            <div>
              <p className="eyebrow">Order summary</p>
              <h2 id="summary-title">Your pocket</h2>
            </div>
            <button className="text-link" type="button" onClick={onCartOpen}>
              Edit cart
            </button>
          </div>
          <div className="summary-items">
            {items.map((item) => (
              <div className="summary-item" key={item.product.id}>
                <ProductArt product={item.product} />
                <div>
                  <h3>{item.product.name}</h3>
                  <p>{formatPrice(item.product.price)}</p>
                  <QuantityStepper value={item.quantity} onChange={(value) => onQuantityChange(item.product.id, value)} />
                  <button className="text-link" type="button" onClick={() => onRemove(item.product.id)}>
                    Remove
                  </button>
                </div>
                <strong>{formatPrice(item.product.price * item.quantity)}</strong>
              </div>
            ))}
          </div>
          <div className="summary-totals">
            <div>
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div>
              <span>Shipping</span>
              <strong>Later</strong>
            </div>
            <div className="summary-total">
              <span>Estimated total</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function CartDrawer({ isOpen, items, onClose, onQuantityChange, onRemove, onNavigate, onCheckoutStart }) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <>
      <div className={`cart-backdrop ${isOpen ? "open" : ""}`} onClick={onClose} />
      <aside className={`cart-drawer ${isOpen ? "open" : ""}`} aria-hidden={!isOpen} aria-labelledby="cart-title">
        <div className="cart-header">
          <h2 id="cart-title">Your pocket</h2>
          <button className="icon-button" type="button" aria-label="Close cart" onClick={onClose}>
            <X size={22} />
          </button>
        </div>
        {items.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is waiting for tiny treasures.</p>
            <Button
              variant="secondary"
              onClick={() => {
                onClose();
                onNavigate("shop");
              }}
            >
              Continue shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-item" key={item.product.id}>
                  <ProductArt product={item.product} />
                  <div>
                    <h3>{item.product.name}</h3>
                    <p>{formatPrice(item.product.price)}</p>
                    <QuantityStepper value={item.quantity} onChange={(value) => onQuantityChange(item.product.id, value)} />
                    <button className="text-link" type="button" onClick={() => onRemove(item.product.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="subtotal">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <Button
                className="checkout-button"
                onClick={() => {
                  onClose();
                  onCheckoutStart();
                }}
              >
                Checkout
              </Button>
              <button
                className="text-link"
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate("shop");
                }}
              >
                Continue shopping
              </button>
              <p className="cart-note">Shipping details will be finalized later.</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function Footer({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <h2>The Pocket Portrait</h2>
          <p>Tiny illustrated pieces for soft collections, current reads and cozy desks.</p>
        </div>
        <div>
          <h3>Shop</h3>
          <button type="button" onClick={() => onNavigate("shop:Stickers")}>Stickers</button>
          <button type="button" onClick={() => onNavigate("shop:Bookmarks")}>Bookmarks</button>
          <button type="button" onClick={() => onNavigate("shop:Button Pins")}>Button pins</button>
        </div>
        <div>
          <h3>Help</h3>
          <button type="button" onClick={() => onNavigate("info")}>About</button>
          <button type="button" onClick={() => onNavigate("info")}>FAQ</button>
          <button type="button" onClick={() => onNavigate("info")}>Shipping</button>
        </div>
      </div>
    </footer>
  );
}

export function App() {
  const [page, setPage] = useState(getInitialPageFromPath);
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [adminProducts, setAdminProducts] = useState(() => createAdminProducts(products));
  const [orders, setOrders] = useState(() => createMockOrders(products));
  const [checkoutSessions, setCheckoutSessions] = useState(() => createMockCheckoutSessions(products));
  const [analyticsEvents, setAnalyticsEvents] = useState(() => createMockAnalyticsEvents(products));
  const [settings, setSettings] = useState(adminSettings);
  const sessionId = useMemo(getSessionId, []);

  const currentProduct = products.find((product) => product.id === selectedProductId) ?? products[0];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const currentPage = page.startsWith("shop") ? "shop" : page;

  function trackEvent(eventType, details = {}) {
    setAnalyticsEvents((events) => [
      {
        id: createClientId("EVT"),
        eventType,
        page: details.page ?? currentPage,
        productId: details.productId ?? "",
        buttonName: details.buttonName ?? "",
        sessionId,
        metadata: details.metadata ?? {},
        createdAt: new Date().toISOString(),
      },
      ...events,
    ]);
  }

  useEffect(() => {
    const handlePopState = () => setPage(getInitialPageFromPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    trackEvent("page_view", { page });
  }, [page]);

  function navigate(target) {
    setPage(target);
    const nextPath = pageToPath(target);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function viewProduct(id) {
    setSelectedProductId(id);
    trackEvent("product_card_click", { page: currentPage, productId: id, buttonName: "View product" });
    trackEvent("product_view", { page: "product", productId: id });
    navigate("product");
  }

  function addToCart(product, quantity) {
    trackEvent("add_to_cart", {
      page: currentPage,
      productId: product.id,
      buttonName: "Add",
      metadata: { quantity, price: product.price },
    });
    setCartItems((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      if (existing) {
        return items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...items, { product, quantity }];
    });
    setCartOpen(true);
  }

  function createCheckoutSessionSnapshot(status, details = {}) {
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shippingCost = subtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingPrice;
    const now = new Date().toISOString();

    return {
      id: createClientId("CHK"),
      sessionId,
      customerEmail: details.email ?? "",
      items: cartItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        category: item.product.category,
        quantity: item.quantity,
        unitPrice: item.product.price,
        costPrice: adminProducts.find((product) => product.id === item.product.id)?.costPrice ?? 0,
        totalPrice: item.product.price * item.quantity,
      })),
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      status,
      checkoutStartedAt: now,
      paymentCompletedAt: status === "Completed" ? now : "",
      abandonedAt: "",
      lastActivity: now,
    };
  }

  function startCheckout() {
    const checkoutSnapshot = createCheckoutSessionSnapshot("Started");
    setCheckoutSessions((sessions) => [
      checkoutSnapshot,
      ...sessions.filter((session) => !(session.sessionId === sessionId && session.status === "Started")),
    ]);
    trackEvent("checkout_started", {
      page: "cart",
      buttonName: "Checkout",
      metadata: { cartValue: checkoutSnapshot.total, itemCount: cartCount },
    });
    navigate("checkout");
  }

  function completePayment(details) {
    const completedAt = new Date().toISOString();
    const completedSession = createCheckoutSessionSnapshot("Completed", details);
    setCheckoutSessions((sessions) => [
      {
        ...completedSession,
        checkoutStartedAt:
          sessions.find((session) => session.sessionId === sessionId && session.status === "Started")?.checkoutStartedAt ??
          completedSession.checkoutStartedAt,
        paymentCompletedAt: completedAt,
        lastActivity: completedAt,
      },
      ...sessions.filter((session) => !(session.sessionId === sessionId && session.status === "Started")),
    ]);
    trackEvent("payment_completed", {
      page: "checkout",
      buttonName: "Place test order",
      metadata: { cartValue: completedSession.total, emailCaptured: Boolean(details.email) },
    });
    setOrders((currentOrders) => [
      {
        id: `TPP-${String(1000 + currentOrders.length + 1)}`,
        customerName: details.fullName,
        customerEmail: details.email,
        customerPhone: "",
        shippingAddress: `${details.address}${details.apartment ? `, ${details.apartment}` : ""}, ${details.postalCode} ${details.city}, ${details.country}`,
        items: completedSession.items,
        subtotal: completedSession.subtotal,
        shippingCost: completedSession.shippingCost,
        total: completedSession.total,
        paymentStatus: "Paid",
        orderStatus: "Processing",
        shippingStatus: "Not packed",
        shippingProvider: settings.shippingProvider,
        trackingNumber: "",
        createdAt: completedAt,
        paidAt: completedAt,
        shippedAt: "",
        deliveredAt: "",
        notes: details.note,
      },
      ...currentOrders,
    ]);
  }

  function updateQuantity(productId, quantity) {
    setCartItems((items) =>
      items.map((item) => (item.product.id === productId ? { ...item, quantity } : item)).filter((item) => item.quantity > 0),
    );
  }

  function removeItem(productId) {
    setCartItems((items) => items.filter((item) => item.product.id !== productId));
  }

  const shopCategory = page.startsWith("shop:") ? page.split(":")[1] : "All";

  if (page === "admin") {
    return (
      <AdminDashboard
        products={adminProducts}
        setProducts={setAdminProducts}
        orders={orders}
        setOrders={setOrders}
        checkoutSessions={checkoutSessions}
        analyticsEvents={analyticsEvents}
        settings={settings}
        setSettings={setSettings}
        ProductArt={ProductArt}
        formatPrice={formatPrice}
        onStorefront={() => navigate("home")}
      />
    );
  }

  return (
    <>
      <AnnouncementBar />
      <Header currentPage={currentPage} onNavigate={navigate} cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      {page === "home" && <HomePage onNavigate={navigate} onView={viewProduct} onAdd={addToCart} />}
      {page.startsWith("shop") && (
        <ShopPage key={shopCategory} initialCategory={shopCategory} onView={viewProduct} onAdd={addToCart} onTrack={trackEvent} />
      )}
      {page === "product" && <ProductPage product={currentProduct} onNavigate={navigate} onAdd={addToCart} onView={viewProduct} />}
      {page === "info" && <InfoPage />}
      {page === "checkout" && (
        <CheckoutPage
          items={cartItems}
          onNavigate={navigate}
          onCartOpen={() => setCartOpen(true)}
          onQuantityChange={updateQuantity}
          onRemove={removeItem}
          onPaymentComplete={completePayment}
        />
      )}
      <Footer onNavigate={navigate} />
      <CartDrawer
        isOpen={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onQuantityChange={updateQuantity}
        onRemove={removeItem}
        onNavigate={navigate}
        onCheckoutStart={startCheckout}
      />
    </>
  );
}
