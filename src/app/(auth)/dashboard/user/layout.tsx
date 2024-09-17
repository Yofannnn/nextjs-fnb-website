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
  if (!isAuth) redirect("/login");
  return <UserDashboardLayout>{children}</UserDashboardLayout>;
}
