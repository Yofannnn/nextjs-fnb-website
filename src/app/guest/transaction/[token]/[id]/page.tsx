import GuestTransactionDetailsPage from "@/components/pages/GuestTransactionDetailsPage";

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
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export default async function GuestTransactionDetails(
  props: {
    params: Promise<{ token: string; id: string }>;
  }
) {
  const params = await props.params;
  const { token, id } = params;
  const transaction = await getTransactionDetails(token, id);

  if (!transaction.success || !transaction.data)
    return <p>{transaction.error}</p>;

  return (
    <GuestTransactionDetailsPage
      guestAccessToken={token}
      transaction={transaction.data}
    />
  );
}
