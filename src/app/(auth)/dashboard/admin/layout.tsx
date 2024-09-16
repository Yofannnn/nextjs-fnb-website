import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";
import AdminDashboardLayout from "@/components/layout/AdminDashboard";

export default async function AdminDashboard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await verifySession();
  const isAuth = session.isAuth;
  if (!isAuth) redirect("/login");

  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
