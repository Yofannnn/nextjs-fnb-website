import ReservationTableOnlyPage from "@/components/pages/ReservationTableOnly";
import { getUser } from "@/lib/dal";

export default async function ReservationTableOnly() {
  const user = await getUser();
  const userData = user ? JSON.parse(JSON.stringify(user)) : undefined;
  return <ReservationTableOnlyPage user={userData} />;
}
