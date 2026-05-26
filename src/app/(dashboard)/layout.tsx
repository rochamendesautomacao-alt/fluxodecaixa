import { AuthGuard } from "@/components/auth/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex flex-1">
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
