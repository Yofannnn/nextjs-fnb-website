import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";
import AdminDashboardLayout from "@/components/layout/AdminDashboard";

export default async function AdminDashboard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuth, role } = await verifySession();
  if (role === "user") redirect("/dashboard");
  if (!isAuth && role !== "admin") redirect("/login?redirect=dashboard");
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
