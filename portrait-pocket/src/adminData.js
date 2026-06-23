export const adminSettings = {
  storeName: "The Pocket Portrait",
  currency: "SEK",
  vatRate: 25,
  shippingCountry: "Sweden only",
  shippingProvider: "PostNord",
  standardShippingPrice: 49,
  freeShippingThreshold: 300,
  deliveryEstimate: "2-5 business days",
};

export const orderStatuses = ["Pending", "Paid", "Processing", "Packed", "Shipped", "Delivered", "Cancelled", "Refunded"];
export const paymentStatuses = ["Unpaid", "Paid", "Failed", "Refunded", "Expired"];
export const shippingStatuses = ["Not packed", "Packed", "Ready to ship", "Shipped", "Delivered"];
export const productStatuses = ["Active", "Draft", "Sold out", "Hidden"];

const productCostDefaults = {
  "Button Pins": { costPrice: 14, packagingCost: 3, stock: 36 },
  Hairclips: { costPrice: 20, packagingCost: 4, stock: 22 },
  Stickers: { costPrice: 8, packagingCost: 2, stock: 90 },
  Bookmarks: { costPrice: 10, packagingCost: 3, stock: 60 },
};

const statusCycle = ["Active", "Active", "Active", "Draft", "Active", "Sold out", "Hidden"];

export function createAdminProducts(products) {
  return products.map((product, index) => {
    const defaults = productCostDefaults[product.category] ?? { costPrice: 12, packagingCost: 3, stock: 30 };
    const totalSold = [28, 18, 12, 9, 34, 16, 11, 25, 8, 13, 22, 17][index % 12] ?? 6;
    const status = index < 10 ? "Active" : statusCycle[index % statusCycle.length];

    return {
      ...product,
      retailPrice: product.price,
      costPrice: defaults.costPrice,
      packagingCost: defaults.packagingCost,
      stock: Math.max(defaults.stock - totalSold, 0),
      status,
      totalSold,
    };
  });
}

function getProduct(products, id) {
  return products.find((product) => product.id === id) ?? products[0];
}

function createOrderItem(products, productId, quantity) {
  const product = getProduct(products, productId);
  const defaults = productCostDefaults[product.category] ?? { costPrice: 12, packagingCost: 3 };

  return {
    productId: product.id,
    name: product.name,
    category: product.category,
    quantity,
    unitPrice: product.price,
    costPrice: defaults.costPrice,
    totalPrice: product.price * quantity,
  };
}

function buildOrder(products, spec) {
  const items = spec.items.map(([productId, quantity]) => createOrderItem(products, productId, quantity));
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const shippingCost = subtotal >= adminSettings.freeShippingThreshold ? 0 : adminSettings.standardShippingPrice;

  return {
    ...spec,
    items,
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
    shippingProvider: adminSettings.shippingProvider,
    trackingNumber: spec.trackingNumber ?? "",
    notes: spec.notes ?? "",
  };
}

export function createMockOrders(products) {
  return [
    buildOrder(products, {
      id: "TPP-1008",
      customerName: "Maja Andersson",
      customerEmail: "maja.andersson@example.com",
      customerPhone: "+46 70 123 45 67",
      shippingAddress: "Sodra Vagen 12, 412 54 Goteborg",
      items: [
        ["TPP-PIN-01", 2],
        ["TPP-STK-01", 3],
        ["TPP-BMK-01", 1],
      ],
      paymentStatus: "Paid",
      orderStatus: "Processing",
      shippingStatus: "Not packed",
      createdAt: "2026-06-23T09:20:00.000Z",
      paidAt: "2026-06-23T09:23:00.000Z",
      shippedAt: "",
      deliveredAt: "",
    }),
    buildOrder(products, {
      id: "TPP-1007",
      customerName: "Elin Karlsson",
      customerEmail: "elin.karlsson@example.com",
      customerPhone: "+46 73 555 11 22",
      shippingAddress: "Bergsgatan 8, 112 23 Stockholm",
      items: [
        ["TPP-HC-01", 1],
        ["TPP-BMK-02", 2],
      ],
      paymentStatus: "Paid",
      orderStatus: "Packed",
      shippingStatus: "Ready to ship",
      createdAt: "2026-06-22T15:05:00.000Z",
      paidAt: "2026-06-22T15:07:00.000Z",
      shippedAt: "",
      deliveredAt: "",
      notes: "Pack with extra backing card.",
    }),
    buildOrder(products, {
      id: "TPP-1006",
      customerName: "Nora Lind",
      customerEmail: "nora.lind@example.com",
      customerPhone: "+46 76 220 18 09",
      shippingAddress: "Storgatan 44, 753 31 Uppsala",
      items: [
        ["TPP-BMK-03", 4],
        ["TPP-STK-04", 2],
      ],
      paymentStatus: "Paid",
      orderStatus: "Shipped",
      shippingStatus: "Shipped",
      trackingNumber: "PN-77889922-SE",
      createdAt: "2026-06-20T10:40:00.000Z",
      paidAt: "2026-06-20T10:44:00.000Z",
      shippedAt: "2026-06-21T13:15:00.000Z",
      deliveredAt: "",
    }),
    buildOrder(products, {
      id: "TPP-1005",
      customerName: "Sara Berg",
      customerEmail: "sara.berg@example.com",
      customerPhone: "+46 72 340 90 10",
      shippingAddress: "Hantverkaregatan 3, 211 55 Malmo",
      items: [["TPP-STK-02", 5]],
      paymentStatus: "Failed",
      orderStatus: "Pending",
      shippingStatus: "Not packed",
      createdAt: "2026-06-19T19:30:00.000Z",
      paidAt: "",
      shippedAt: "",
      deliveredAt: "",
    }),
    buildOrder(products, {
      id: "TPP-1004",
      customerName: "Ida Holm",
      customerEmail: "ida.holm@example.com",
      customerPhone: "+46 70 909 70 70",
      shippingAddress: "Nygatan 19, 582 19 Linkoping",
      items: [
        ["TPP-PIN-02", 1],
        ["TPP-BMK-04", 1],
        ["TPP-BMK-05", 1],
      ],
      paymentStatus: "Paid",
      orderStatus: "Delivered",
      shippingStatus: "Delivered",
      trackingNumber: "PN-55990011-SE",
      createdAt: "2026-06-14T12:10:00.000Z",
      paidAt: "2026-06-14T12:12:00.000Z",
      shippedAt: "2026-06-15T09:10:00.000Z",
      deliveredAt: "2026-06-17T14:40:00.000Z",
    }),
  ];
}

export function createMockCheckoutSessions(products) {
  const abandonedItems = [
    createOrderItem(products, "TPP-BMK-06", 2),
    createOrderItem(products, "TPP-STK-05", 3),
  ];
  const failedItems = [createOrderItem(products, "TPP-HC-02", 1)];

  return [
    {
      id: "CHK-2041",
      sessionId: "session-pastel-2041",
      customerEmail: "reader@example.com",
      items: abandonedItems,
      subtotal: abandonedItems.reduce((sum, item) => sum + item.totalPrice, 0),
      shippingCost: adminSettings.standardShippingPrice,
      total: abandonedItems.reduce((sum, item) => sum + item.totalPrice, 0) + adminSettings.standardShippingPrice,
      status: "Abandoned",
      checkoutStartedAt: "2026-06-23T07:40:00.000Z",
      paymentCompletedAt: "",
      abandonedAt: "2026-06-23T08:45:00.000Z",
      lastActivity: "2026-06-23T07:54:00.000Z",
    },
    {
      id: "CHK-2039",
      sessionId: "session-bow-2039",
      customerEmail: "",
      items: failedItems,
      subtotal: failedItems.reduce((sum, item) => sum + item.totalPrice, 0),
      shippingCost: adminSettings.standardShippingPrice,
      total: failedItems.reduce((sum, item) => sum + item.totalPrice, 0) + adminSettings.standardShippingPrice,
      status: "Payment failed",
      checkoutStartedAt: "2026-06-22T18:15:00.000Z",
      paymentCompletedAt: "",
      abandonedAt: "",
      lastActivity: "2026-06-22T18:22:00.000Z",
    },
  ];
}

const analyticsEventTypes = [
  "page_view",
  "product_view",
  "product_card_click",
  "add_to_cart",
  "checkout_started",
  "search_used",
  "category_filter_used",
  "payment_completed",
];

export function createMockAnalyticsEvents(products) {
  const events = [];
  const baseTime = new Date("2026-06-23T10:00:00.000Z").getTime();

  for (let index = 0; index < 80; index += 1) {
    const product = products[index % products.length];
    const eventType = analyticsEventTypes[index % analyticsEventTypes.length];
    events.push({
      id: `EVT-${String(index + 1).padStart(3, "0")}`,
      eventType,
      page: eventType === "page_view" ? (index % 3 === 0 ? "home" : "shop") : "shop",
      productId: product.id,
      buttonName: eventType === "add_to_cart" ? "Add" : eventType === "checkout_started" ? "Checkout" : "",
      sessionId: `session-${(index % 18) + 1}`,
      metadata: {
        category: product.category,
        mock: true,
      },
      createdAt: new Date(baseTime - index * 28 * 60 * 1000).toISOString(),
    });
  }

  return events;
}

