import MemberReservationDetailsPage from "@/components/pages/MemberReservationDetailsPage";
import { verifySession } from "@/lib/dal";

async function getReservationDetails(userId: string, reservationId: string) {
  try {
    const res = await fetch(
      `${process.env.BASE_URL}/api/reservation/member?userId=${userId}&reservationId=${reservationId}`,
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

export default async function MemberReservationDetails({
  params,
}: {
  params: { reservationId: string };
}) {
  const { isAuth, userId } = await verifySession();
  const { reservationId } = params;
  if (!userId) return null;
  const reservationDetails = await getReservationDetails(
    userId as string,
    reservationId
  );
  return (
    <MemberReservationDetailsPage
      isMember={isAuth}
      userId={userId as string}
      reservation={reservationDetails}
    />
  );
}
