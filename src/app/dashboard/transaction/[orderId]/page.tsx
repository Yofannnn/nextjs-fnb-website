import MemberTransactionDetailsPage from "@/components/pages/MemberTransactionDetailsPage";
import { verifySession } from "@/lib/dal";

async function getTransactionDetails(accessId: string, orderId: string) {
  try {
    const res = await fetch(
      `${process.env.BASE_URL}/api/transaction?accessId=${accessId}&orderId=${orderId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = await res.json();
    if (!res.ok) throw new Error(result.statusText);
    return {
      success: true,
      data: result.data,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export default async function DashboardTransactionDetails({
  params,
}: {
  params: { orderId: string };
}) {
  const { orderId } = params;
  const { isAuth, userId } = await verifySession();
  const { success, message, data } = await getTransactionDetails(
    userId as string,
    orderId
  );

  if (!isAuth) return null;
  if (!success) throw new Error(message);
  return <MemberTransactionDetailsPage userId={userId} transaction={data} />;
}
