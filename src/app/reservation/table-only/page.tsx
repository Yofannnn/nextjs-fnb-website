import ReservationTableOnlyPage from "@/components/pages/ReservationTableOnly";
import { getUser } from "@/lib/dal";

export default async function ReservationTableOnly() {
  const user = await getUser();
  return (
    <ReservationTableOnlyPage memberName={user.name} memberEmail={user.email} />
  );
}
