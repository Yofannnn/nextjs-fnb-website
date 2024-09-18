import ReservationIncludeFoodPage from "@/components/pages/ReservationIncludeFoodPage";
import { verifySession } from "@/lib/dal";

export default async function ReservationIncludeFood() {
  const session = await verifySession();
  return <ReservationIncludeFoodPage isAuth={session.isAuth} />;
}
