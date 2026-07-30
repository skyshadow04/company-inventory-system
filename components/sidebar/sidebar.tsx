export default function Sidebar() {
  return (
    <aside className="h-screen w-64 border-r bg-white p-5">
      <h1 className="text-xl font-bold">
        Inventory System
      </h1>

      <nav className="mt-8 space-y-4">
        <p>Dashboard</p>
        <p>Products</p>
        <p>Categories</p>
        <p>Suppliers</p>
        <p>Reports</p>
      </nav>
    </aside>
  );
}