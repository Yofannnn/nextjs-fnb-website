import CreateUniqueLinkForGuestToManageReservationsPage from "@/components/pages/CreateUniqueLinkForGuestToManageReservations";
import ManageGuestReservationListPage from "@/components/pages/GuestReservationListPage";

async function getReservationList(token: string) {
  try {
    const res = await fetch(
      `${process.env.BASE_URl}/api/reservation?accessId=${token}`,
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

export default async function ManageReservationsList({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const { success, message, data } = await getReservationList(token);
  // should improve the error handling
  if (!success) return <CreateUniqueLinkForGuestToManageReservationsPage />;

  return (
    <ManageGuestReservationListPage token={token} reservationList={data} />
  );
}
