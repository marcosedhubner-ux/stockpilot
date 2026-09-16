# StockPilot

Inventory and procurement for a small warehouse — products, suppliers, and purchase orders, with stock levels that are never edited directly. Every change to a quantity is a recorded, attributable movement, and receiving a shipment is a first-class workflow with partial receipts and automatic status transitions.

[Leia em português](./README.pt-BR.md)

## Why this exists

Most inventory demos let you `PATCH` a `quantity` field and call it done. That's how stock counts silently drift from reality and nobody can say why. StockPilot treats `quantityOnHand` as a derived, cached value: the only way to change it is to record a `StockMovement` (received, sold, returned, or a manual adjustment), and the two writes happen in the same database transaction. The result is a full audit trail for free — for any product you can answer "how did we get to this number?" without guessing.

## Architecture

```
apps/
  web/   Next.js 16 (App Router, TypeScript, Tailwind) — products, purchase orders, suppliers, dashboard
  api/   Node/Express (TypeScript) — REST API, Prisma ORM, PostgreSQL
```

```
src/
  domain/              stockLedger.ts — pure delta/validation logic, framework-free, unit tested
                        errors.ts — typed domain errors mapped to HTTP status codes
  modules/<name>/      <name>.schema.ts    Zod input validation
                        <name>.service.ts   business logic
                        <name>.repository.ts (products, purchaseOrders — the transactional writes live here)
                        <name>.routes.ts    Express router, thin controllers
  middlewares/         auth, role guards, rate limiting, centralized error handling
```

No Socket.IO here on purpose — not every product needs a websocket, and a warehouse dashboard refreshing every 30 seconds is the honest answer for this domain.

## The interesting part: concurrency-safe stock movements

Recording a movement doesn't read the current quantity, do math in JavaScript, and write it back — that pattern loses updates under concurrent requests. Instead (`products.repository.ts`):

```ts
tx.product.updateMany({
  where: { id: productId, quantityOnHand: { gte: -delta } },
  data: { quantityOnHand: { increment: delta } },
});
```

The floor check (`quantityOnHand >= -delta`) and the increment happen in a single atomic `UPDATE`. If two sales race for the last unit, the database — not application code — decides which one wins; the loser's `updateMany` matches zero rows, and the transaction returns "insufficient stock" without ever creating a movement record for a change that didn't happen. Purchase-order receiving uses the same transactional pattern to update the item's received quantity, the product's stock, and the ledger together, and only promotes the order to `RECEIVED` once every line is fully delivered.

## Security

- Passwords hashed with bcrypt (cost factor 12); sessions are JWTs in `httpOnly`, `sameSite=lax` cookies.
- Two roles, enforced server-side: `STAFF` can record day-to-day stock movements (received/sold/returned) and receive purchase orders; only `ADMIN` can create products, suppliers, submit purchase orders, or make manual inventory adjustments — an API request from a `STAFF` token for any of those is rejected with a `403` regardless of what the UI shows.
- All input validated with Zod at the boundary, including a discriminated union so an "adjustment" and a "sale" can't be confused with each other at the type level.
- Prisma parameterizes every query; rate limiting on auth endpoints; `helmet` security headers; CORS locked to the configured web origin.
- No secret ever lives in source control — see [Getting started](#getting-started).

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL 14+ instance (local or hosted)

### 1. Configure the API

```bash
cd apps/api
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Random string, 32+ characters (`openssl rand -hex 32`) |
| `WEB_ORIGIN` | URL of the frontend, for CORS (`http://localhost:3002` in dev) |

```bash
npm install
npm run prisma:migrate   # creates the schema
npm run prisma:seed      # demo staff, suppliers, products and a submitted purchase order
npm run dev              # http://localhost:4002
```

Demo accounts created by the seed (password `Passw0rd!123`):

| Role | Email |
| --- | --- |
| Admin | `admin@stockpilot.dev` |
| Staff | `staff@stockpilot.dev` |

### 2. Configure the web app

```bash
cd apps/web
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL
npm install
npm run dev -- -p 3002             # http://localhost:3002
```

## Testing

```bash
cd apps/api
npm test        # stock-ledger unit tests (Vitest)
```

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · TanStack Query · Node.js · Express · Prisma · PostgreSQL · Zod · Vitest
