import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  unique,
  index,
} from "drizzle-orm/pg-core";

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    brand: text("brand").notNull(),
    category: text("category").notNull(), // Running | Basketball | Lifestyle | Skate | Trail
    colorway: text("colorway").notNull(),
    description: text("description").notNull(),
    priceCents: integer("price_cents").notNull(),
    compareAtCents: integer("compare_at_cents"),
    image: text("image").notNull(),
    featured: boolean("featured").notNull().default(false),
    isNew: boolean("is_new").notNull().default(false),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("products_category_idx").on(t.category)],
);

export const productSizes = pgTable(
  "product_sizes",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text("size").notNull(), // US men's size, e.g. "9.5"
    stock: integer("stock").notNull().default(0),
  },
  (t) => [unique("product_sizes_unique").on(t.productId, t.size)],
);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  subtotalCents: integer("subtotal_cents").notNull(),
  shippingCents: integer("shipping_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  status: text("status").notNull().default("pending"), // pending | paid | shipped | delivered | cancelled
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  productName: text("product_name").notNull(),
  image: text("image").notNull(),
  size: text("size").notNull(),
  quantity: integer("quantity").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
});

export type Product = typeof products.$inferSelect;
export type ProductSize = typeof productSizes.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
