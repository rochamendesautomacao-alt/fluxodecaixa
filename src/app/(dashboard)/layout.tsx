import { AuthGuard } from "@/components/auth/auth-guard";
import { ContextHeader } from "@/components/company/context-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex flex-1 flex-col">
        <ContextHeader />
        <main className="flex flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
