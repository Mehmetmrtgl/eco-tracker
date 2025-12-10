# Eco Tracker

Eco Tracker is a full-stack personal finance tracker with a NestJS backend, a Next.js frontend, and a PostgreSQL database. This README documents the project structure, local development workflows, and operational details for each layer.

## Architecture overview
- **Backend:** NestJS 11 application using Prisma for PostgreSQL access. Runs on port **4000** by default with CORS enabled.
- **Frontend:** Next.js 16 App Router UI served on port **3000** in development.
- **Database:** PostgreSQL 15 with an Adminer console for manual inspection. Schema is bootstrapped from `database/schema.sql` and mirrored in Prisma models under `backend/prisma/schema.prisma`.
- **Container orchestration:** `docker-compose.yml` provisions PostgreSQL and Adminer for local development, with persistent storage via the `postgres_data` volume.

## Backend

### Key modules
The backend composes several domain modules in `backend/src/app.module.ts`, including authentication, budgeting, assets, debts, credit cards, accounts, and transactions.

### Running the backend
From the `backend` directory:

```bash
npm install              # install dependencies
npm run start:dev        # start NestJS in watch mode on port 4000
npm run start            # start without file watching
npm run start:prod       # run the built dist output
```

### Testing and linting
```bash
npm test         # unit tests
npm run test:e2e # e2e test suite
npm run test:cov # coverage
npm run lint     # ESLint with auto-fix
```

### Database access (Prisma)
- The Prisma schema lives in `backend/prisma/schema.prisma` and expects `DATABASE_URL` to point to the PostgreSQL instance.
- The Prisma client is created in `backend/src/prisma/prisma.service.ts`, which connects on module init and disconnects on shutdown.
- The backend enables CORS in `backend/src/main.ts` and listens on port 4000.

## Frontend

### Development
From the `frontend` directory:

```bash
npm install  # install dependencies
npm run dev  # start Next.js dev server on http://localhost:3000
```

### Production build
```bash
npm run build
npm start    # serves the built app
```

### Tech stack
- Next.js 16 with the App Router
- React 19
- Tailwind CSS 4 (via `@tailwindcss/postcss`)
- UI primitives from Radix UI and iconography from `lucide-react`
- Charts via `recharts`

## Database

### Docker services
`docker-compose.yml` provisions two services:
- **db:** PostgreSQL 15 with credentials `admin/password123`, database name `eco_tracker`, port `5432`. It mounts `database/schema.sql` to seed the schema and persists data in the `postgres_data` volume.
- **adminer:** Web-based DB console on port `8080` for manual inspection.

Start the services from the repository root:

```bash
docker-compose up -d
```

### Schema overview
The schema models users, their financial accounts, categorizations, and transaction history:
- **users:** credentials and profile metadata.
- **accounts:** cash, bank, or credit card accounts with currency and inclusion flags for net worth.
- **categories:** income/expense tags (including defaults) linked to users.
- **transactions:** income/expense/transfer records tied to accounts, categories, debts, and credit cards.
- **assets** and **asset_transactions:** portfolio holdings (gold, stocks, crypto, forex) with buy/sell history.
- **debts:** loans or credit obligations with due dates and tracking fields.
- **budgets:** per-category budget limits unique per user.
- **credit_cards:** credit card metadata and statement tracking.

The Prisma models in `backend/prisma/schema.prisma` mirror these tables for application access.

## Environment configuration

- **DATABASE_URL:** Required by Prisma and NestJS to connect to PostgreSQL (e.g., `postgresql://admin:password@localhost:5432/eco_tracker`).
- Frontend API base URLs can be pointed at the backend (default `http://localhost:4000`) via Next.js environment variables if needed (add to `frontend/.env.local`).

## Quickstart workflow
1. Start the database stack with `docker-compose up -d`.
2. In `backend`, set `DATABASE_URL`, install dependencies, and run `npm run start:dev`.
3. In `frontend`, install dependencies and run `npm run dev`.
4. Access the app UI at `http://localhost:3000` and the backend at `http://localhost:4000`; manage the database via Adminer at `http://localhost:8080`.
