import Link from "next/link";

export default function Home() {
  return (
    <main className="flex h-screen items-center justify-center">

      <div className="text-center">

        <h1 className="text-4xl font-bold">
          Inventory Management System
        </h1>

        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded bg-black px-5 py-3 text-white"
        >
          Go to Dashboard
        </Link>

      </div>

    </main>
  );
}