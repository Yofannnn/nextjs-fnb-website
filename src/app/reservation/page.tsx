import ReservationPage from "@/components/pages/ReservationPage";
import { verifySession } from "@/lib/dal";

export default async function Reservation() {
  const session = await verifySession();
  return <ReservationPage isAuth={session.isAuth} />;
}
