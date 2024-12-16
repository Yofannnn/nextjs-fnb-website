import GuestRenewAccessPage from "@/components/pages/GuestRenewAccessPage";
import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function GuestRenewAccess() {
  const { isAuth } = await verifySession();

  if (isAuth) redirect("/dashboard");
  return <GuestRenewAccessPage />;
}
