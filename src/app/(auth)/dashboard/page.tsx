import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await verifySession();
  const userRole = session.role;

  if (userRole === "admin") {
    redirect("/dashboard/admin/home");
  } else if (userRole === "user") {
    redirect("/dashboard/user/home");
  } else {
    redirect("/login");
  }
}
