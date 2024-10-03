import MemberReservationListPage from "@/components/pages/MemberReservationListPage";
import { verifySession } from "@/lib/dal";

async function getMemberReservationList(userId: string) {
  try {
    const res = await fetch(
      `${process.env.BASE_URL}/api/reservation/member?userId=${userId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!res.ok) throw new Error(res.statusText);
    const { data } = await res.json();
    return data;
  } catch (error: any) {
    return { error: error.message };
  }
}

export default async function DashboardReservation() {
  const { userId } = await verifySession();
  if (!userId) return null;
  const reservationList = await getMemberReservationList(userId as string);
  return <MemberReservationListPage reservationList={reservationList} />;
}
