import connectToDatabase from "@/database/mongoose";
import { getFilteredTransaction, getTransactionList } from "@/services/transaction.service";
import { UserRole } from "@/types/user.type";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderType = searchParams.get("orderType") || undefined;
  const paymentPurpose = searchParams.get("paymentPurpose") || undefined;
  const transactionStatus = searchParams.get("transactionStatus") || undefined;
  const transactionTime = searchParams.get("transactionTime") || undefined;

  const role = request.headers.get("X-User-Role");

  if (role !== UserRole.Admin)
    return new Response(JSON.stringify({ status: 403, statusText: "You are not allowed to access this route" }), {
      status: 403,
    });

  try {
    await connectToDatabase();

    if (orderType || paymentPurpose || transactionStatus || transactionTime) {
      const transactions = await getFilteredTransaction({ orderType, paymentPurpose, transactionStatus, transactionTime });
      if (!transactions) throw new Error("Failed to fetch transactions");

      return new Response(
        JSON.stringify({ status: 200, statusText: "Transactions fetched successfully", data: transactions }),
        { status: 200 }
      );
    }

    const transactions = await getTransactionList();
    if (!transactions) throw new Error("Failed to fetch transactions");

    return new Response(
      JSON.stringify({ status: 200, statusText: "Transactions fetched successfully", data: transactions }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message || "Internal Server Error" }), {
      status: 500,
    });
  }
}
