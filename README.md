# Leadership Domestic Workers Service Center

A Next.js-based inventory and asset management system for tracking supplies, suppliers, assets, and operational expenses across multiple entities. The app includes a public-facing landing page and a protected dashboard for internal staff and administrators.

## Overview

This project is designed to help the organization manage:

- supplier records
- item inventory and purchase data
- asset tracking and ownership history
- printer toner and drum stock
- utility bill tracking
- entity-based reporting and access control

The application is built around a Prisma/PostgreSQL backend and a secure JWT-based auth flow using cookie sessions.

## Features

- Secure registration and login flow
- Role-based access control (`staff`, `admin`, and `super admin`)
- Multi-entity filtering and scoped access rules
- Supplier management and supplier-linked item records
- Item inventory tracking with price, quantity, serial data, and file uploads
- Asset management with status, ownership, and history tracking
- Printer inventory with toner and drum stock monitoring
- Dashboard summaries for total assets, suppliers, and item expenses
- Filtered reporting by month and year
- Vercel Blob support for item and asset document/image uploads

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- JWT-based authentication
- Vercel Blob storage
- Recharts and supporting dashboard utilities

## Project Structure

- `app/` – app routes, login/register screens, and protected dashboard pages
- `app/inventoryDashboard/` – main inventory and asset dashboard
- `components/` – reusable dashboard and UI components
- `lib/` – auth helpers, access rules, and Prisma setup
- `prisma/` – Prisma schema and database migrations
- `public/` – static assets and public files

## Prerequisites

Before running the project, make sure you have:

- Node.js 20+
- npm
- PostgreSQL database
- Vercel Blob token for upload features

## Environment Variables

Create a `.env` file in the project root with the following values:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database?schema=public"
JWT_SECRET="your_super_secret_key"
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"
```

If you are using a hosted PostgreSQL instance, replace the connection string accordingly.

## Installation

```bash
npm install
```

## Database Setup

Generate the Prisma client and apply the schema:

```bash
npx prisma generate
npx prisma migrate dev
```

If you want to rebuild the local database from scratch:

```bash
npx prisma migrate reset
```

## Run the App

Development mode:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm run start
```

Open the app in your browser at:

```text
http://localhost:3000
```

The dashboard is available after login at:

```text
http://localhost:3000/login
http://localhost:3000/register
http://localhost:3000/inventoryDashboard
```

## Access Model

The app uses role- and entity-based restrictions:

- `staff` users operate within their assigned entity and ownership scope
- `admin` users can access broader management features
- `super admin` users can switch across entities when applicable

## Useful Commands

```bash
npx prisma studio
npx prisma migrate dev
npx prisma generate
npm run lint
npm run build
```

## Notes

- Uploads for item and asset files depend on `BLOB_READ_WRITE_TOKEN`.
- Authentication uses JWT tokens stored in secure cookies.
- Expense totals are calculated from inventory item prices multiplied by quantity.
- This project is intended for internal business use and may be customized for specific company workflows.

## License

This project is for internal or local use unless otherwise specified by the project owner.
