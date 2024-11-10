import MemberTransactionListPage from "@/components/pages/MemberTransactionListPage";
import { verifySession } from "@/lib/dal";

async function getTransactions(accessId: string) {
  try {
    const res = await fetch(
      `${process.env.BASE_URL}/api/transaction?accessId=${accessId}`,
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

export default async function DashboardTransaction() {
  const { isAuth, userId } = await verifySession();
  const { success, message, data } = await getTransactions(userId as string);

  if (!isAuth) return null;
  if (!success) throw new Error(message);
  return <MemberTransactionListPage transactionList={data} />;
}
