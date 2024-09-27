import CreateUniqueLinkForGuestToManageReservationsPage from "@/components/pages/CreateUniqueLinkForGuestToManageReservations";
import ManageGuestReservationListPage from "@/components/pages/ManageGuestReservationList";

async function getReservationList(token: string) {
  try {
    const res = await fetch(
      `${process.env.BASE_URl}/api/reservation/guest?token=${token}`,
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
    return { error: error.message };
  }
}

export default async function ManageReservationsList({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const reservationInfo = await getReservationList(token);

  // should improve the error handling
  if (reservationInfo.error)
    return <CreateUniqueLinkForGuestToManageReservationsPage />;

  return (
    <ManageGuestReservationListPage
      token={token}
      reservationList={reservationInfo || []}
    />
  );
}
