import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-ink-900 flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 px-6 py-8 sm:px-10 overflow-y-auto">{children}</main>
    </div>
  );
}
