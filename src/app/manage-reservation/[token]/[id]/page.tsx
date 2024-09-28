import GuestReservationDetailsPage from "@/components/pages/GuestReservationDetailsPage";

async function getReservationDetails(token: string, id: string) {
  try {
    const res = await fetch(
      `${process.env.BASE_URL}/api/reservation/guest?token=${token}&id=${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!res.ok) {
      const errorData = await res.json();
      return {
        error: errorData.statusText || "Error fetching reservation data",
      };
    }
    const { data } = await res.json();
    return data;
  } catch (error: any) {
    return error.message;
  }
}

export default async function ManageReservationsDetails({
  params,
}: {
  params: { token: string; id: string };
}) {
  const { token, id } = params;
  const reservation = await getReservationDetails(token, id);

  // should improve error handling
  // if (reservation.error) return <InputWhenReservationListIsInvalid />;

  return <GuestReservationDetailsPage reservation={reservation} />;
}
