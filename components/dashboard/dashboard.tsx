import Sidebar from "@/components/sidebar/sidebar";
import Navbar from "@/components/navbar/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}