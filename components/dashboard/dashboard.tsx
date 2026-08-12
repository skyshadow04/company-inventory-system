import Sidebar from "@/components/sidebar/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1">
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}