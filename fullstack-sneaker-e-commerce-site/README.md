# 👟 Solehouse — Sneaker Store

A full-stack sneaker e-commerce app built with **Next.js (App Router)**, **PostgreSQL**, **Drizzle ORM** and **Tailwind CSS v4**.

## Features

- **Storefront** – hero, categories, featured & new arrivals
- **Shop** – server-side filtering (category, brand, size in stock, max price), search and sorting via URL params
- **Product pages** – per-size live stock, low-stock warnings, related products
- **Cart** – slide-out drawer, persisted in `localStorage`, free-shipping progress bar
- **Checkout API** – prices are re-read from the DB (never trusted from the client), stock is decremented atomically inside a transaction, oversells are rejected
- **Order confirmation & tracking** – look up an order by order number + email
- **Admin dashboard** (`/admin`) – password protected; view orders, change status (cancelling restocks), edit prices, stock per size, hide products
- **JSON API** – `GET /api/products`, `POST /api/orders`, `GET /api/health`
- Catalogue auto-seeds on first run (8 sneakers with product photos in `public/images`)

> Demo store: no real payment provider is wired in. Plug Stripe in at `src/app/api/orders/route.ts`.

## Getting started

```bash
# 1. install dependencies
npm install

# 2. start PostgreSQL (or use your own instance)
docker compose up -d

# 3. configure environment
cp .env.example .env        # then edit DATABASE_URL / ADMIN_PASSWORD

# 4. create the tables
npx drizzle-kit push

# 5. run it
npm run dev                 # http://localhost:3000
```

The catalogue is seeded automatically the first time the site is opened.

Production: `npm run build && npm start`.

### Environment variables

| Name | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_PASSWORD` | Password for `/admin`. Empty = admin disabled |
| `COOKIE_SECURE` | Set to `true` when served over HTTPS |

> `drizzle.config.json` contains the local default DB URL used by `drizzle-kit push`. Edit it if your database differs.

## Project structure

```
src/
  app/
    page.tsx               home
    shop/                  catalogue with filters
    product/[slug]/        product detail
    checkout/              checkout form
    order/[orderNumber]/   confirmation
    track/                 order lookup
    admin/                 dashboard + server actions
    api/                   products, orders, health
  components/              Header, CartDrawer, ProductCard, ...
  db/                      schema, queries, seed
  lib/                     cart store, admin auth, formatting
public/images/             product photos
```

## Deploying

Push to GitHub, then deploy on Vercel/Railway/Render with a managed Postgres. Set `DATABASE_URL` and `ADMIN_PASSWORD`, and run `npx drizzle-kit push` once against the production DB.
