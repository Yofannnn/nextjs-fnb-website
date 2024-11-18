import MemberOnlineOrderListPage from "@/components/pages/MemberOnlineOrderListPage";
import { verifySession } from "@/lib/dal";

async function fetchMemberOnlineOrderList(userId: string) {
  try {
    const res = await fetch(
      `${process.env.BASE_URL}/api/online-order?accessId=${userId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    const result = await res.json();
    if (!res.ok) throw new Error(result.statusText);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export default async function MemberOnlineOrderList() {
  const { isAuth, userId } = await verifySession();
  const onlineOrderList = await fetchMemberOnlineOrderList(userId as string);

  if (!isAuth) return null;
  if (!onlineOrderList.success) throw new Error(onlineOrderList.error);
  if (onlineOrderList.data.length === 0)
    return <h1>Sorry you have no Online Order</h1>;

  return <MemberOnlineOrderListPage onlineOrderList={onlineOrderList.data} />;
}
