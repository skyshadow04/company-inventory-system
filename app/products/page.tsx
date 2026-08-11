import Link from "next/link";

export default function ProductsPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Products</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage your inventory products.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">No products available yet</h2>
          <p className="mt-3 text-slate-600">
            Add items through the dashboard or import them from your database.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
