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
  const isAdmin = session.role === "admin";
  if (!isAuth && !isAdmin) redirect("/dashboard");
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
