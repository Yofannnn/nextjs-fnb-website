import GuestTransactionListPage from "@/components/pages/GuestTransactionListPage";

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
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export default async function ManageReservationsList(
  props: {
    params: Promise<{ token: string }>;
  }
) {
  const params = await props.params;
  const { token } = params;
  const transactions = await getTransactions(token);

  if (!transactions.success || !transactions.data)
    return <p>{transactions.error}</p>;
  //   handling error should be improved, because the error have 2 types : server error(400 / failed to fetch data from db) and client error(500 / user never try transaction or order but want to check transaction list)

  return (
    <GuestTransactionListPage token={token} transactions={transactions.data} />
  );
}
