import DashboardTransactionDetails from "@/components/pages/DashboardTransactionDetails";

export default async function DashboardTransactionDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  return <DashboardTransactionDetails orderId={orderId} />;
}
