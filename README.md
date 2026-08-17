# Inventory Management System

A Next.js inventory and asset management application for tracking suppliers, items, assets, and dashboard expenses. The project includes authentication, role-based access, Prisma database integration, and admin management screens.

## Features

- Admin login and user authentication
- Inventory items management with supplier linking
- Asset management with status and asset type tracking
- Supplier dashboard and management
- Dashboard overview with:
  - total assets
  - asset type breakdown
  - total suppliers
  - item expense totals
  - monthly and yearly filters
  - item type summaries
- Prisma ORM with PostgreSQL
- Vercel Blob file uploads for documents and images

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- shadcn-style UI components

## Project Structure

- `app/` – application routes and pages
- `components/` – UI dashboard and shared components
- `lib/` – auth and Prisma utilities
- `prisma/` – Prisma schema and migrations
- `types/` – shared types

## Prerequisites

Before running the project, make sure you have:

- Node.js 20+
- npm
- PostgreSQL database
- Access to a Vercel Blob token if file uploads are enabled

## Environment Variables

Create a `.env` file in the project root with the following values:

```env
DATABASE_URL="postgresql://username:password@host:5432/database_name?schema=public"
JWT_SECRET="your_super_secret_key"
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"
```

If your database is local, use the appropriate PostgreSQL connection string.

## Installation

```bash
npm install
```

## Database Setup

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

If you want to reset the database and apply migrations fresh:

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

Then open:

```text
http://localhost:3000
```

## Default Access

After registering or seeding users, the application expects an admin role for actions such as creating items, assets, and suppliers.

## Useful Commands

```bash
npx prisma studio
npx prisma migrate dev
npx prisma generate
npm run lint
```

## Notes

- File uploads for item documents/photos depend on `BLOB_READ_WRITE_TOKEN`.
- Authentication is cookie-based and uses JWTs.
- The dashboard expense totals are calculated from item price and quantity values in the database.

## License

This project is for internal or local inventory management use unless otherwise specified by the project owner.
