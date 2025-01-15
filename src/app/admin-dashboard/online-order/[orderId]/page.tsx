export default async function OnlineOrderDetails({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  return <p>Online order details {orderId}</p>;
}
