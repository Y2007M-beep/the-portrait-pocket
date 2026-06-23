import { useMemo, useState } from "react";
import {
  ArrowSquareOut,
  ChartBar,
  CheckCircle,
  ClipboardText,
  CreditCard,
  EnvelopeSimple,
  GearSix,
  House,
  LockKey,
  MagnifyingGlass,
  Package,
  PencilSimple,
  ShoppingBag,
  Sparkle,
  Truck,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  orderStatuses,
  paymentStatuses,
  productStatuses,
  shippingStatuses,
} from "./adminData.js";

const adminNav = [
  { id: "overview", label: "Overview", icon: House },
  { id: "orders", label: "Orders", icon: ClipboardText },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "products", label: "Products", icon: Package },
  { id: "analytics", label: "Analytics", icon: ChartBar },
  { id: "abandoned", label: "Abandoned Checkouts", icon: WarningCircle },
  { id: "profit", label: "Profit", icon: CreditCard },
  { id: "settings", label: "Settings", icon: GearSix },
];

const dateRanges = ["Today", "7 days", "30 days", "This month", "All time"];
const demoAdminCode = "owner-demo";

function isWithinRange(dateString, range) {
  if (range === "All time") return true;
  const date = new Date(dateString);
  const now = new Date();
  const start = new Date(now);

  if (range === "Today") {
    return date.toDateString() === now.toDateString();
  }

  if (range === "This month") {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }

  const days = range === "7 days" ? 7 : 30;
  start.setDate(now.getDate() - days);
  return date >= start;
}

function formatDate(dateString) {
  if (!dateString) return "Not set";
  return new Intl.DateTimeFormat("en-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value * 10) / 10}%`;
}

function StatCard({ label, value, hint, tone = "cream" }) {
  return (
    <article className={`admin-stat admin-stat-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </article>
  );
}

function StatusBadge({ children, type = "neutral" }) {
  const normalized = String(children).toLowerCase().replace(/\s+/g, "-");
  return <span className={`admin-status admin-status-${type} admin-status-${normalized}`}>{children}</span>;
}

function EmptyState({ title, copy }) {
  return (
    <div className="admin-empty">
      <Sparkle weight="fill" aria-hidden="true" />
      <h3>{title}</h3>
      <p>{copy}</p>
    </div>
  );
}

function AdminGate({ onUnlock, onStorefront }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  function submit(event) {
    event.preventDefault();
    if (code.trim() === demoAdminCode) {
      sessionStorage.setItem("tpp-admin-demo-access", "true");
      onUnlock();
      return;
    }
    setMessage("That owner code did not match this prototype gate.");
  }

  return (
    <main className="admin-gate">
      <form className="admin-gate-panel" onSubmit={submit}>
        <LockKey size={28} weight="fill" aria-hidden="true" />
        <p className="eyebrow">Private area</p>
        <h1>The Pocket Portrait Admin</h1>
        <p>
          This dashboard is protected by a local prototype gate. Real owner/admin authentication should replace this
          before live private data is connected.
        </p>
        <label>
          Owner access code
          <input
            type="password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Enter owner code"
            autoComplete="off"
          />
        </label>
        <button className="button button-primary" type="submit">
          Unlock dashboard
        </button>
        <button className="text-link" type="button" onClick={onStorefront}>
          Back to storefront
        </button>
        <p aria-live="polite">{message}</p>
      </form>
    </main>
  );
}

function AdminLayout({ activeSection, setActiveSection, onStorefront, children }) {
  return (
    <main className="admin-app">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="admin-brand">
          <span>The Pocket Portrait</span>
          <strong>Admin</strong>
        </div>
        <nav>
          {adminNav.map(({ id, label, icon: Icon }) => (
            <button key={id} className={activeSection === id ? "active" : ""} type="button" onClick={() => setActiveSection(id)}>
              <Icon size={19} weight="bold" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
        <button className="admin-storefront-link" type="button" onClick={onStorefront}>
          <ArrowSquareOut size={18} weight="bold" aria-hidden="true" />
          View storefront
        </button>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">Owner workspace</p>
            <h1>{adminNav.find((item) => item.id === activeSection)?.label ?? "Overview"}</h1>
          </div>
          <button className="button button-ghost" type="button" onClick={onStorefront}>
            View storefront
          </button>
        </header>
        <nav className="admin-mobile-nav" aria-label="Admin sections">
          {adminNav.map(({ id, label }) => (
            <button key={id} className={activeSection === id ? "active" : ""} type="button" onClick={() => setActiveSection(id)}>
              {label}
            </button>
          ))}
        </nav>
        {children}
      </section>
    </main>
  );
}

function useAdminMetrics({ orders, products, checkoutSessions, analyticsEvents, dateRange }) {
  return useMemo(() => {
    const filteredOrders = orders.filter((order) => isWithinRange(order.createdAt, dateRange));
    const filteredEvents = analyticsEvents.filter((event) => isWithinRange(event.createdAt, dateRange));
    const filteredCheckouts = checkoutSessions.filter((checkout) => isWithinRange(checkout.checkoutStartedAt, dateRange));
    const paidOrders = filteredOrders.filter((order) => order.paymentStatus === "Paid");
    const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
    const productRevenue = paidOrders.reduce((sum, order) => sum + order.subtotal, 0);
    const shippingRevenue = paidOrders.reduce((sum, order) => sum + order.shippingCost, 0);
    const productCost = paidOrders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce((itemSum, item) => {
          const product = products.find((productItem) => productItem.id === item.productId);
          return itemSum + (product?.costPrice ?? item.costPrice) * item.quantity;
        }, 0),
      0,
    );
    const packagingCost = paidOrders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce((itemSum, item) => {
          const product = products.find((productItem) => productItem.id === item.productId);
          return itemSum + (product?.packagingCost ?? 3) * item.quantity;
        }, 0),
      0,
    );
    const shippingLabelCost = paidOrders.length * 42;
    const paymentFees = Math.round((revenue * 0.029 + paidOrders.length * 1.8) * 100) / 100;
    const estimatedProfit = revenue - productCost - packagingCost - shippingLabelCost - paymentFees;
    const visitors = new Set(filteredEvents.map((event) => event.sessionId)).size;
    const productClicks = filteredEvents.filter((event) => event.eventType === "product_card_click").length;
    const productViews = filteredEvents.filter((event) => event.eventType === "product_view").length;
    const addToCart = filteredEvents.filter((event) => event.eventType === "add_to_cart").length;
    const checkoutStarted = filteredEvents.filter((event) => event.eventType === "checkout_started").length;
    const paymentCompleted = filteredEvents.filter((event) => event.eventType === "payment_completed").length;

    return {
      filteredOrders,
      filteredEvents,
      filteredCheckouts,
      paidOrders,
      revenue,
      productRevenue,
      shippingRevenue,
      productCost,
      packagingCost,
      shippingLabelCost,
      paymentFees,
      estimatedProfit,
      profitMargin: revenue ? (estimatedProfit / revenue) * 100 : 0,
      totalOrders: filteredOrders.length,
      waitingToShip: filteredOrders.filter((order) => order.paymentStatus === "Paid" && !["Shipped", "Delivered"].includes(order.shippingStatus)).length,
      abandonedCheckouts: filteredCheckouts.filter((checkout) => ["Abandoned", "Payment failed", "Started"].includes(checkout.status)).length,
      visits: visitors,
      pageViews: filteredEvents.filter((event) => event.eventType === "page_view").length,
      productClicks,
      productViews,
      addToCart,
      checkoutStarted,
      paymentCompleted,
      conversionRate: visitors ? (paidOrders.length / visitors) * 100 : 0,
      averageOrderValue: paidOrders.length ? revenue / paidOrders.length : 0,
      addToCartRate: productViews ? (addToCart / productViews) * 100 : 0,
      checkoutStartRate: addToCart ? (checkoutStarted / addToCart) * 100 : 0,
      purchaseConversionRate: visitors ? (paymentCompleted / visitors) * 100 : 0,
    };
  }, [analyticsEvents, checkoutSessions, dateRange, orders, products]);
}

function DateFilters({ value, onChange }) {
  return (
    <div className="admin-filters" aria-label="Date filters">
      {dateRanges.map((range) => (
        <button key={range} type="button" className={value === range ? "selected" : ""} onClick={() => onChange(range)}>
          {range}
        </button>
      ))}
    </div>
  );
}

function OverviewPage({ metrics, dateRange, setDateRange, formatPrice }) {
  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Store health at a glance</h2>
        </div>
        <DateFilters value={dateRange} onChange={setDateRange} />
      </div>

      <div className="admin-stat-grid">
        <StatCard label="Total revenue" value={formatPrice(metrics.revenue)} hint="Paid orders only" tone="sage" />
        <StatCard label="Estimated profit" value={formatPrice(metrics.estimatedProfit)} hint={`${formatPercent(metrics.profitMargin)} margin`} tone="blush" />
        <StatCard label="Total orders" value={metrics.totalOrders} hint={`${metrics.paidOrders.length} paid`} />
        <StatCard label="Paid orders" value={metrics.paidOrders.length} hint="Successful payments" />
        <StatCard label="Waiting to ship" value={metrics.waitingToShip} hint="Paid, not shipped" tone="mist" />
        <StatCard label="Abandoned checkouts" value={metrics.abandonedCheckouts} hint="30-60 minute window" />
        <StatCard label="Website visits" value={metrics.visits} hint={`${metrics.pageViews} page views`} />
        <StatCard label="Product clicks" value={metrics.productClicks} hint={`${metrics.productViews} product views`} />
        <StatCard label="Conversion rate" value={formatPercent(metrics.conversionRate)} hint="Paid orders / visits" tone="sage" />
        <StatCard label="Average order value" value={formatPrice(metrics.averageOrderValue)} hint="Paid order average" tone="blush" />
      </div>

      <div className="admin-card-grid">
        <article className="admin-card">
          <h3>Fulfillment pulse</h3>
          <div className="admin-progress-list">
            <ProgressBar label="Packed or ready" value={Math.max(metrics.paidOrders.length - metrics.waitingToShip, 0)} total={Math.max(metrics.paidOrders.length, 1)} />
            <ProgressBar label="Waiting to ship" value={metrics.waitingToShip} total={Math.max(metrics.paidOrders.length, 1)} />
          </div>
        </article>
        <article className="admin-card">
          <h3>Checkout funnel</h3>
          <div className="admin-progress-list">
            <ProgressBar label="Add to cart rate" value={metrics.addToCartRate} total={100} />
            <ProgressBar label="Checkout start rate" value={metrics.checkoutStartRate} total={100} />
            <ProgressBar label="Purchase conversion" value={metrics.purchaseConversionRate} total={100} />
          </div>
        </article>
      </div>
    </section>
  );
}

function ProgressBar({ label, value, total }) {
  const width = Math.min(100, Math.max(0, total ? (value / total) * 100 : 0));
  return (
    <div className="admin-progress">
      <div>
        <span>{label}</span>
        <strong>{total === 100 ? formatPercent(value) : `${value}/${total}`}</strong>
      </div>
      <span className="admin-progress-track">
        <span style={{ width: `${width}%` }} />
      </span>
    </div>
  );
}

function OrderItems({ items }) {
  return (
    <ul className="admin-item-list">
      {items.map((item) => (
        <li key={`${item.productId}-${item.quantity}`}>
          {item.name} <strong>x{item.quantity}</strong>
        </li>
      ))}
    </ul>
  );
}

function OrdersPage({ orders, setOrders, formatPrice }) {
  const [query, setQuery] = useState("");

  function updateOrder(orderId, patch) {
    // TODO: Replace mock state updates with authenticated backend mutations.
    setOrders((currentOrders) => currentOrders.map((order) => (order.id === orderId ? { ...order, ...patch } : order)));
  }

  const filteredOrders = orders.filter((order) => {
    const searchable = `${order.id} ${order.customerName} ${order.customerEmail} ${order.shippingAddress}`.toLowerCase();
    return searchable.includes(query.toLowerCase());
  });

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <p className="eyebrow">Orders</p>
          <h2>Manage customer orders</h2>
        </div>
        <label className="admin-search">
          <MagnifyingGlass size={18} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders" />
        </label>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState title="No orders found" copy="Try another search or date range." />
      ) : (
        <div className="admin-order-list">
          {filteredOrders.map((order) => (
            <article className="admin-order-card" key={order.id}>
              <div className="admin-order-header">
                <div>
                  <h3>{order.id}</h3>
                  <p>{formatDate(order.createdAt)}</p>
                </div>
                <div className="admin-status-row">
                  <StatusBadge type="payment">{order.paymentStatus}</StatusBadge>
                  <StatusBadge type="order">{order.orderStatus}</StatusBadge>
                  <StatusBadge type="shipping">{order.shippingStatus}</StatusBadge>
                </div>
              </div>
              <div className="admin-order-grid">
                <div>
                  <span>Customer</span>
                  <strong>{order.customerName}</strong>
                  <p>{order.customerEmail}</p>
                </div>
                <div>
                  <span>Shipping address</span>
                  <p>{order.shippingAddress}</p>
                </div>
                <div>
                  <span>Products</span>
                  <OrderItems items={order.items} />
                </div>
                <div>
                  <span>Totals</span>
                  <p>Subtotal {formatPrice(order.subtotal)}</p>
                  <p>Shipping {formatPrice(order.shippingCost)}</p>
                  <strong>{formatPrice(order.total)}</strong>
                </div>
              </div>
              <div className="admin-order-controls">
                <label>
                  Payment
                  <select value={order.paymentStatus} onChange={(event) => updateOrder(order.id, { paymentStatus: event.target.value })}>
                    {paymentStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Order
                  <select value={order.orderStatus} onChange={(event) => updateOrder(order.id, { orderStatus: event.target.value })}>
                    {orderStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Shipping
                  <select value={order.shippingStatus} onChange={(event) => updateOrder(order.id, { shippingStatus: event.target.value })}>
                    {shippingStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Tracking number
                  <input
                    value={order.trackingNumber}
                    onChange={(event) => updateOrder(order.id, { trackingNumber: event.target.value })}
                    placeholder="PostNord tracking"
                  />
                </label>
                <label className="admin-wide-control">
                  Internal note
                  <textarea value={order.notes} onChange={(event) => updateOrder(order.id, { notes: event.target.value })} rows="2" />
                </label>
              </div>
              <div className="admin-actions">
                <button type="button" onClick={() => updateOrder(order.id, { orderStatus: "Packed", shippingStatus: "Packed" })}>
                  Mark as packed
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateOrder(order.id, {
                      orderStatus: "Shipped",
                      shippingStatus: "Shipped",
                      shippedAt: new Date().toISOString(),
                    })
                  }
                >
                  Mark as shipped
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateOrder(order.id, {
                      orderStatus: "Delivered",
                      shippingStatus: "Delivered",
                      deliveredAt: new Date().toISOString(),
                    })
                  }
                >
                  Mark as delivered
                </button>
                <button type="button" onClick={() => updateOrder(order.id, { orderStatus: "Cancelled" })}>
                  Cancel order
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ShippingPage({ orders, setOrders, formatPrice }) {
  const fulfillmentOrders = orders.filter(
    (order) => order.paymentStatus === "Paid" && !["Shipped", "Delivered"].includes(order.shippingStatus),
  );

  function updateOrder(orderId, patch) {
    // TODO: Replace mock fulfillment changes with backend updates and PostNord label integration.
    setOrders((currentOrders) => currentOrders.map((order) => (order.id === orderId ? { ...order, ...patch } : order)));
  }

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <p className="eyebrow">Shipping</p>
          <h2>PostNord fulfillment queue</h2>
        </div>
        <StatusBadge>{fulfillmentOrders.length} orders to prepare</StatusBadge>
      </div>

      {fulfillmentOrders.length === 0 ? (
        <EmptyState title="All paid orders are shipped" copy="New paid orders will appear here when they need packing." />
      ) : (
        <div className="admin-fulfillment-list">
          {fulfillmentOrders.map((order) => (
            <article className="admin-card admin-fulfillment-card" key={order.id}>
              <div>
                <h3>{order.customerName}</h3>
                <p>{order.shippingAddress}</p>
                <OrderItems items={order.items} />
              </div>
              <div className="admin-fulfillment-meta">
                <span>Shipping method</span>
                <strong>PostNord</strong>
                <span>Total</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
              <label>
                Tracking number
                <input
                  value={order.trackingNumber}
                  onChange={(event) => updateOrder(order.id, { trackingNumber: event.target.value })}
                  placeholder="PostNord tracking"
                />
              </label>
              <div className="admin-actions">
                <button type="button" onClick={() => updateOrder(order.id, { orderStatus: "Packed", shippingStatus: "Packed" })}>
                  Mark as packed
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateOrder(order.id, {
                      orderStatus: "Shipped",
                      shippingStatus: "Shipped",
                      shippedAt: new Date().toISOString(),
                    })
                  }
                >
                  Mark as shipped
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ProductsPage({ products, setProducts, ProductArt, formatPrice }) {
  const [query, setQuery] = useState("");
  const filteredProducts = products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase()));

  function updateProduct(productId, patch) {
    // TODO: Persist product edits to the real product database when backend exists.
    setProducts((currentProducts) => currentProducts.map((product) => (product.id === productId ? { ...product, ...patch } : product)));
  }

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <p className="eyebrow">Products</p>
          <h2>Inventory and product performance</h2>
        </div>
        <label className="admin-search">
          <MagnifyingGlass size={18} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" />
        </label>
      </div>

      <div className="admin-product-table">
        {filteredProducts.map((product) => {
          const revenue = product.totalSold * product.retailPrice;
          const profit = product.totalSold * (product.retailPrice - product.costPrice - product.packagingCost);

          return (
            <article className="admin-product-row" key={product.id}>
              <ProductArt product={product} />
              <div>
                <h3>{product.name}</h3>
                <p>{product.category}</p>
                <StatusBadge>{product.status}</StatusBadge>
              </div>
              <label>
                Price
                <input
                  type="number"
                  min="0"
                  value={product.retailPrice}
                  onChange={(event) => updateProduct(product.id, { retailPrice: Number(event.target.value) })}
                />
              </label>
              <label>
                Cost
                <input
                  type="number"
                  min="0"
                  value={product.costPrice}
                  onChange={(event) => updateProduct(product.id, { costPrice: Number(event.target.value) })}
                />
              </label>
              <label>
                Packaging
                <input
                  type="number"
                  min="0"
                  value={product.packagingCost}
                  onChange={(event) => updateProduct(product.id, { packagingCost: Number(event.target.value) })}
                />
              </label>
              <label>
                Stock
                <input
                  type="number"
                  min="0"
                  value={product.stock}
                  onChange={(event) => updateProduct(product.id, { stock: Number(event.target.value) })}
                />
              </label>
              <label>
                Status
                <select value={product.status} onChange={(event) => updateProduct(product.id, { status: event.target.value })}>
                  {productStatuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
              <div className="admin-product-performance">
                <span>Sold {product.totalSold}</span>
                <strong>{formatPrice(revenue)}</strong>
                <small>Profit {formatPrice(profit)}</small>
              </div>
              <div className="admin-actions">
                <button type="button" onClick={() => updateProduct(product.id, { status: "Active" })}>
                  Edit product
                </button>
                <button type="button" onClick={() => updateProduct(product.id, { status: "Sold out", stock: 0 })}>
                  Mark sold out
                </button>
                <button type="button" onClick={() => updateProduct(product.id, { status: "Hidden" })}>
                  Hide product
                </button>
                <button type="button">View performance</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProfitPage({ metrics, formatPrice }) {
  const costTotal = metrics.productCost + metrics.packagingCost + metrics.shippingLabelCost + metrics.paymentFees;
  const maxValue = Math.max(metrics.revenue, costTotal, 1);
  const rows = [
    ["Product revenue", metrics.productRevenue],
    ["Shipping revenue", metrics.shippingRevenue],
    ["Product cost", metrics.productCost],
    ["Packaging cost", metrics.packagingCost],
    ["Estimated PostNord shipping cost", metrics.shippingLabelCost],
    ["Payment fees", metrics.paymentFees],
    ["Estimated profit", metrics.estimatedProfit],
  ];

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <p className="eyebrow">Profit</p>
          <h2>Estimated profit model</h2>
        </div>
        <StatusBadge>{formatPercent(metrics.profitMargin)} margin</StatusBadge>
      </div>

      <div className="admin-stat-grid compact">
        <StatCard label="Total revenue" value={formatPrice(metrics.revenue)} tone="sage" />
        <StatCard label="Estimated costs" value={formatPrice(costTotal)} tone="mist" />
        <StatCard label="Estimated profit" value={formatPrice(metrics.estimatedProfit)} tone="blush" />
        <StatCard label="Profit margin" value={formatPercent(metrics.profitMargin)} />
      </div>

      <article className="admin-card">
        <h3>Revenue minus estimated costs</h3>
        <p className="admin-muted">Placeholder cost values are editable in Products. Replace them with exact supplier and packaging costs later.</p>
        <div className="admin-profit-bars">
          {rows.map(([label, value]) => (
            <div className="admin-profit-row" key={label}>
              <div>
                <span>{label}</span>
                <strong>{formatPrice(value)}</strong>
              </div>
              <span className="admin-profit-track">
                <span style={{ width: `${Math.min(100, Math.abs(value / maxValue) * 100)}%` }} />
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function AbandonedPage({ checkoutSessions, formatPrice }) {
  const rows = checkoutSessions.filter((checkout) => checkout.status !== "Completed");

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <p className="eyebrow">Abandoned checkouts</p>
          <h2>Recover unfinished carts</h2>
        </div>
        <StatusBadge>{rows.length} sessions</StatusBadge>
      </div>

      <div className="admin-checkout-list">
        {rows.map((checkout) => (
          <article className="admin-card admin-checkout-card" key={checkout.id}>
            <div className="admin-checkout-head">
              <div>
                <h3>{checkout.sessionId}</h3>
                <p>{checkout.customerEmail || "No email captured"}</p>
              </div>
              <StatusBadge>{checkout.status}</StatusBadge>
            </div>
            <OrderItems items={checkout.items} />
            <div className="admin-checkout-meta">
              <span>Cart value</span>
              <strong>{formatPrice(checkout.total)}</strong>
              <span>Started</span>
              <strong>{formatDate(checkout.checkoutStartedAt)}</strong>
              <span>Last activity</span>
              <strong>{formatDate(checkout.lastActivity)}</strong>
            </div>
            <button className="button button-ghost" type="button">
              <EnvelopeSimple size={18} weight="bold" aria-hidden="true" />
              Send reminder email
            </button>
            <p className="admin-muted">TODO: Connect an email provider before sending real reminders.</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AnalyticsPage({ metrics, analyticsEvents, products }) {
  const productViews = products
    .map((product) => ({
      product,
      views: analyticsEvents.filter((event) => event.eventType === "product_view" && event.productId === product.id).length,
      clicks: analyticsEvents.filter((event) => event.eventType === "product_card_click" && event.productId === product.id).length,
    }))
    .sort((a, b) => b.views + b.clicks - (a.views + a.clicks))
    .slice(0, 6);
  const topValue = Math.max(...productViews.map((row) => Math.max(row.views, row.clicks)), 1);

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <p className="eyebrow">Analytics</p>
          <h2>Website activity</h2>
        </div>
      </div>

      <div className="admin-stat-grid compact">
        <StatCard label="Total visitors" value={metrics.visits} />
        <StatCard label="Page views" value={metrics.pageViews} />
        <StatCard label="Add-to-cart rate" value={formatPercent(metrics.addToCartRate)} />
        <StatCard label="Checkout start rate" value={formatPercent(metrics.checkoutStartRate)} />
        <StatCard label="Purchase conversion" value={formatPercent(metrics.purchaseConversionRate)} />
      </div>

      <article className="admin-card">
        <h3>Most viewed and clicked products</h3>
        <div className="admin-analytics-list">
          {productViews.map(({ product, views, clicks }) => (
            <div className="admin-analytics-row" key={product.id}>
              <div>
                <strong>{product.name}</strong>
                <span>{product.category}</span>
              </div>
              <div className="admin-mini-bars">
                <ProgressBar label="Views" value={views} total={topValue} />
                <ProgressBar label="Clicks" value={clicks} total={topValue} />
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function SettingsPage({ settings, setSettings }) {
  function updateSetting(key, value) {
    // TODO: Persist settings to an owner-only backend settings table.
    setSettings((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <p className="eyebrow">Settings</p>
          <h2>Store settings</h2>
        </div>
      </div>
      <form className="admin-settings-grid">
        <label>
          Store name
          <input value={settings.storeName} onChange={(event) => updateSetting("storeName", event.target.value)} />
        </label>
        <label>
          Currency
          <input value={settings.currency} onChange={(event) => updateSetting("currency", event.target.value)} />
        </label>
        <label>
          VAT/moms
          <input type="number" value={settings.vatRate} onChange={(event) => updateSetting("vatRate", Number(event.target.value))} />
        </label>
        <label>
          Shipping country
          <input value={settings.shippingCountry} onChange={(event) => updateSetting("shippingCountry", event.target.value)} />
        </label>
        <label>
          Shipping provider
          <input value={settings.shippingProvider} onChange={(event) => updateSetting("shippingProvider", event.target.value)} />
        </label>
        <label>
          Standard shipping price
          <input
            type="number"
            value={settings.standardShippingPrice}
            onChange={(event) => updateSetting("standardShippingPrice", Number(event.target.value))}
          />
        </label>
        <label>
          Free shipping threshold
          <input
            type="number"
            value={settings.freeShippingThreshold}
            onChange={(event) => updateSetting("freeShippingThreshold", Number(event.target.value))}
          />
        </label>
        <label>
          Delivery estimate
          <input value={settings.deliveryEstimate} onChange={(event) => updateSetting("deliveryEstimate", event.target.value)} />
        </label>
      </form>
    </section>
  );
}

export function AdminDashboard({
  products,
  setProducts,
  orders,
  setOrders,
  checkoutSessions,
  analyticsEvents,
  settings,
  setSettings,
  ProductArt,
  formatPrice,
  onStorefront,
}) {
  const [activeSection, setActiveSection] = useState("overview");
  const [dateRange, setDateRange] = useState("30 days");
  const [isUnlocked, setIsUnlocked] = useState(() => sessionStorage.getItem("tpp-admin-demo-access") === "true");
  const metrics = useAdminMetrics({ orders, products, checkoutSessions, analyticsEvents, dateRange });

  if (!isUnlocked) {
    return <AdminGate onUnlock={() => setIsUnlocked(true)} onStorefront={onStorefront} />;
  }

  return (
    <AdminLayout activeSection={activeSection} setActiveSection={setActiveSection} onStorefront={onStorefront}>
      {activeSection === "overview" && (
        <OverviewPage metrics={metrics} dateRange={dateRange} setDateRange={setDateRange} formatPrice={formatPrice} />
      )}
      {activeSection === "orders" && <OrdersPage orders={orders} setOrders={setOrders} formatPrice={formatPrice} />}
      {activeSection === "shipping" && <ShippingPage orders={orders} setOrders={setOrders} formatPrice={formatPrice} />}
      {activeSection === "products" && (
        <ProductsPage products={products} setProducts={setProducts} ProductArt={ProductArt} formatPrice={formatPrice} />
      )}
      {activeSection === "analytics" && <AnalyticsPage metrics={metrics} analyticsEvents={analyticsEvents} products={products} />}
      {activeSection === "abandoned" && <AbandonedPage checkoutSessions={checkoutSessions} formatPrice={formatPrice} />}
      {activeSection === "profit" && <ProfitPage metrics={metrics} formatPrice={formatPrice} />}
      {activeSection === "settings" && <SettingsPage settings={settings} setSettings={setSettings} />}
    </AdminLayout>
  );
}

