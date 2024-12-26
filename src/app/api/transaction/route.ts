import connectToDatabase from "@/database/mongoose";
import { findUserById } from "@/services/auth.service";
import { verifyGuestToken } from "@/services/guest-token.service";
import { getReservationByEmail, getReservationById } from "@/services/reservation.service";
import { getOnlineOrderById, getOnlineOrdersByEmail } from "@/services/online-order.service";
import { getSomeTransactionsByOrderId, getTransactionByOrderId } from "@/services/transaction.service";
import { Reservation } from "@/types/order.type";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessId = searchParams.get("accessId"); // user === userId, guest === guestAccessToken
  const orderId = searchParams.get("orderId");

  try {
    await connectToDatabase();

    const guestEmail = await verifyGuestToken(accessId);
    const isMember = await findUserById(accessId as string);
    const email = guestEmail.email || isMember.email;

    if (!email)
      return new Response(JSON.stringify({ status: 400, statusText: "Sorry, your access id is invalid" }), {
        status: 400,
      });

    if (orderId) {
      const [reservationMemberEmail, onlineOrderMemberEmail] = await Promise.all([
        getReservationById(orderId),
        getOnlineOrderById(orderId),
      ]);

      const customerEmail = reservationMemberEmail || onlineOrderMemberEmail;

      if (customerEmail.customerEmail !== email)
        return new Response(
          JSON.stringify({ status: 403, statusText: "You are not allowed to access this transaction" }),
          { status: 403 }
        );

      const transaction = await getTransactionByOrderId(orderId);

      if (!transaction.data)
        return new Response(JSON.stringify({ status: 404, statusText: "Invalid ID" }), { status: 404 });

      return new Response(
        JSON.stringify({ status: 200, statusText: "Transaction fetched successfully", data: transaction }),
        { status: 200 }
      );
    }

    const reservationsData = await getReservationByEmail(email);
    const onlineOrdersData = await getOnlineOrdersByEmail(email);
    const uniqueOrderIds = reservationsData
      .map((reservation: Reservation) => reservation.reservationId)
      .concat(onlineOrdersData.map((order: any) => order.orderId));

    const transactions = await getSomeTransactionsByOrderId(uniqueOrderIds);
    if (!transactions) throw new Error("Failed to fetch transactions");

    return new Response(
      JSON.stringify({ status: 200, statusText: "Transactions fetched successfully", data: transactions }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error }), { status: 500 });
  }
}
