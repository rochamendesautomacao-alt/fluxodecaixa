import { AuthGuard } from "@/components/auth/auth-guard";
import { ContextHeader } from "@/components/company/context-header";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-dvh flex-1 flex-col lg:flex-row">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <ContextHeader />
          <main className="flex flex-1">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
