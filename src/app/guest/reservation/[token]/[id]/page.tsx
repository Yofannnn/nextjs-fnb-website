import GuestReservationDetailsPage from "@/components/pages/GuestReservationDetailsPage";

async function getReservationDetails(token: string, id: string) {
  try {
    const res = await fetch(
      `${process.env.BASE_URL}/api/reservation?accessId=${token}&reservationId=${id}`,

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

export default async function ManageReservationsDetails(
  props: {
    params: Promise<{ token: string; id: string }>;
  }
) {
  const params = await props.params;
  const { token, id } = params;
  const { success, message, data } = await getReservationDetails(token, id);
  // should improve error handling
  // if (reservation.error) return <InputWhenReservationListIsInvalid />;

  return <GuestReservationDetailsPage reservation={data} />;
}
