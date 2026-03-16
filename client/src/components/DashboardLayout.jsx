import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface-50 text-white">
      <Sidebar />
      <main className="ml-64 p-8 min-h-screen relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
