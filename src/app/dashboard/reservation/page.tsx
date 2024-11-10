import MemberReservationListPage from "@/components/pages/MemberReservationListPage";
import { verifySession } from "@/lib/dal";

async function getMemberReservationList(userId: string) {
  try {
    const res = await fetch(
      `${process.env.BASE_URL}/api/reservation?accessId=${userId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    const result = await res.json();
    if (!res.ok) throw new Error(result.statusText);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export default async function DashboardReservation() {
  const { isAuth, userId } = await verifySession();
  const { success, message, data } = await getMemberReservationList(
    userId as string
  );

  if (!isAuth) return null;
  return <MemberReservationListPage reservationList={data} />;
}
