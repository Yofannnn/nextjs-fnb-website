import MemberReservationDetailsPage from "@/components/pages/MemberReservationDetailsPage";
import { verifySession } from "@/lib/dal";

async function getReservationDetails(userId: string, reservationId: string) {
  try {
    const res = await fetch(
      `${process.env.BASE_URL}/api/reservation?accessId=${userId}&reservationId=${reservationId}`,
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

export default async function MemberReservationDetails(
  props: {
    params: Promise<{ reservationId: string }>;
  }
) {
  const params = await props.params;
  const { isAuth, userId } = await verifySession();
  const { reservationId } = params;
  const { success, message, data } = await getReservationDetails(
    userId as string,
    reservationId
  );

  if (!userId) return null;
  return (
    <MemberReservationDetailsPage
      isMember={isAuth}
      userId={userId as string}
      reservation={data}
    />
  );
}
