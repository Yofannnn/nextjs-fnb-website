import ReservationPage from "@/components/pages/ReservationPage";
import { getUser } from "@/lib/dal";

export default async function Reservation() {
  const { user } = await getUser();
  const userDetails = user ? { ...user, _id: user._id.toString() } : undefined;

  return <ReservationPage isAuth={!!user} user={userDetails} />;
}
