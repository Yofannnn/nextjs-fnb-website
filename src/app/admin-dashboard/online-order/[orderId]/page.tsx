import AdminOnlineOrderDetails from "@/components/pages/AdminOnlineOrderDetails";

export default async function OnlineOrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  return <AdminOnlineOrderDetails orderId={orderId} />;
}
