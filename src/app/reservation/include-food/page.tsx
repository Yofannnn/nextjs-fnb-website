import ReservationIncludeFoodPage from "@/components/pages/ReservationIncludeFoodPage";
import { getUser } from "@/lib/dal";

export default async function ReservationIncludeFood() {
  const { user } = await getUser();
  return (
    <ReservationIncludeFoodPage userName={user?.name} userEmail={user?.email} />
  );
}
