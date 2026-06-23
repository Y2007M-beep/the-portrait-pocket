export type OrderStatus = "Pending" | "Paid" | "Processing" | "Packed" | "Shipped" | "Delivered" | "Cancelled" | "Refunded";
export type PaymentStatus = "Unpaid" | "Paid" | "Failed" | "Refunded" | "Expired";
export type ShippingStatus = "Not packed" | "Packed" | "Ready to ship" | "Shipped" | "Delivered";
export type ProductStatus = "Active" | "Draft" | "Sold out" | "Hidden";

export interface StoreSettings {
  storeName: string;
  currency: "SEK";
  vatRate: number;
  shippingCountry: string;
  shippingProvider: "PostNord";
  standardShippingPrice: number;
  freeShippingThreshold: number;
  deliveryEstimate: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingStatus: ShippingStatus;
  shippingProvider: string;
  trackingNumber: string;
  createdAt: string;
  paidAt: string;
  shippedAt: string;
  deliveredAt: string;
  notes: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  retailPrice: number;
  costPrice: number;
  packagingCost: number;
  stock: number;
  status: ProductStatus;
  image?: string;
  description: string;
  totalSold: number;
}

export interface AnalyticsEvent {
  id: string;
  eventType: string;
  page: string;
  productId: string;
  buttonName: string;
  sessionId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface CheckoutSession {
  id: string;
  sessionId: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: "Started" | "Completed" | "Abandoned" | "Payment failed";
  checkoutStartedAt: string;
  paymentCompletedAt: string;
  abandonedAt: string;
  lastActivity: string;
}

