import UserDashboardLayout from "@/components/layout/UserDashboard";
import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function UserDashboard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuth, role } = await verifySession();
  if (role === "admin") redirect("/admin-dashboard");
  if (!isAuth && role !== "user") redirect("/login?redirect=dashboard");
  return <UserDashboardLayout>{children}</UserDashboardLayout>;
}
