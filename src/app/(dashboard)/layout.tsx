export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      <main className="flex-1">{children}</main>
    </div>
  );
}
