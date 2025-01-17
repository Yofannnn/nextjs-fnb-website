import connectToDatabase from "@/database/mongoose";
import { getFilteredOnlineOrder } from "@/services/online-order.service";
import { getFilteredReservations } from "@/services/reservation.service";
import { getFilteredTransaction } from "@/services/transaction.service";

const getMappedAllOrderId = async (email: string) => {
  const [reservation, onlineOrder] = await Promise.all([
    getFilteredReservations({ customerEmail: email }),
    getFilteredOnlineOrder({ customerEmail: email }),
  ]);
  const mappedOrdersId = onlineOrder.map((order) => order.orderId);
  const mappedReservationId = reservation.map((reserve) => reserve.reservationId);
  return mappedOrdersId.concat(mappedReservationId);
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderType = searchParams.get("orderType") || undefined;
  const paymentPurpose = searchParams.get("paymentPurpose") || undefined;
  const transactionStatus = searchParams.get("transactionStatus") || undefined;

  const email = request.headers.get("X-User-Email");
  const role = request.headers.get("X-User-Role");

  if (!role || !email)
    return new Response(JSON.stringify({ status: 403, statusText: "You are not allowed to access this route" }), {
      status: 403,
    });

  try {
    await connectToDatabase();
    if (orderType || paymentPurpose || transactionStatus) {
      const mappedAllOrderId = await getMappedAllOrderId(email);
      if (mappedAllOrderId.length === 0)
        return new Response(JSON.stringify({ status: 200, statusText: "You have no transactions.", data: [] }), {
          status: 200,
        });

      const transactions = await getFilteredTransaction({
        orderIds: mappedAllOrderId,
        orderType,
        paymentPurpose,
        transactionStatus,
      });
      if (!transactions) throw new Error("Something went wrong");

      return new Response(JSON.stringify({ status: 200, statusText: "Success", data: transactions }), { status: 200 });
    }

    const orderIds = await getMappedAllOrderId(email);
    const transactions = await getFilteredTransaction({ orderIds });
    if (!transactions) throw new Error("Something went wrong");

    return new Response(JSON.stringify({ status: 200, statusText: "Success", data: transactions }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message || "Internal Server Error" }), {
      status: 500,
    });
  }
}
