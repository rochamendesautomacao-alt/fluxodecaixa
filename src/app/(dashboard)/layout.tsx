import { Toaster } from "sonner";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ContextHeader } from "@/components/company/context-header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileFab } from "@/components/layout/mobile-fab";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Toaster richColors position="top-center" />
      <div className="flex min-h-dvh flex-1 flex-col lg:flex-row">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <ContextHeader />
          <main className="flex flex-1">{children}</main>
        </div>
        <MobileFab />
      </div>
    </AuthGuard>
  );
}
