export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <h2 className="font-semibold">
        Inventory Dashboard
      </h2>

      <button>
        Logout
      </button>
    </header>
  );
}