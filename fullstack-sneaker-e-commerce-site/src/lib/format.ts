export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);

export const FREE_SHIPPING_THRESHOLD_CENTS = 15000;
export const FLAT_SHIPPING_CENTS = 1000;

export const shippingFor = (subtotalCents: number) =>
  subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
    ? 0
    : FLAT_SHIPPING_CENTS;

export const CATEGORIES = ["Running", "Basketball", "Lifestyle", "Skate", "Trail"];

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
] as const;
