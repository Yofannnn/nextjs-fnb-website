import DashboardReservationDetails from "@/components/pages/DashboardReservationDetails";

export default async function MemberReservationDetails({ params }: { params: Promise<{ reservationId: string }> }) {
  const { reservationId } = await params;

  return <DashboardReservationDetails reservationId={reservationId} />;
}
