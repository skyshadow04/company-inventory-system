import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    verifyToken(token);
  } catch {
    redirect("/login");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>
      <div className="mt-6 grid grid-cols-3 gap-5">
        <div className="rounded-lg border p-5">
          <h2>Total Items</h2>
          <p className="text-3xl font-bold">
            0
          </p>
        </div>
        <div className="rounded-lg border p-5">
          <h2>Low Stock</h2>
          <p className="text-3xl font-bold">
            0
          </p>
        </div>
        <div className="rounded-lg border p-5">
          <h2>Expenses</h2>
          <p className="text-3xl font-bold">
            $0
          </p>
        </div>
      </div>
    </div>
  );
}