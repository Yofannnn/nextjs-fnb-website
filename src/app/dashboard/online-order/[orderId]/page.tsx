import DashboardOnlineOrderDetails from "@/components/pages/DashboardOnlineOrderDetails";

export default async function DashboardOnlineOrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  return <DashboardOnlineOrderDetails orderId={orderId} />;
}
