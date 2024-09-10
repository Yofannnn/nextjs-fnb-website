import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function UserDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await verifySession();
  const isAuth = session.isAuth;
  if (!isAuth) redirect("/login");
  return (
    <main className="w-full h-full">
      <h1>Layout dashboard user</h1>
      {children}
    </main>
  );
}
