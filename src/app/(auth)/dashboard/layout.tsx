import UserDashboardLayout from "@/components/layout/UserDashboard";
import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function UserDashboard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await verifySession();
  const isAuth = session.isAuth;
  const user = session.role;
  if (!isAuth && user !== "user") redirect("/login");
  return <UserDashboardLayout>{children}</UserDashboardLayout>;
}
