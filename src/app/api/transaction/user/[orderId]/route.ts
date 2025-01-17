import connectToDatabase from "@/database/mongoose";
import { getOnlineOrderById } from "@/services/online-order.service";
import { getReservationById } from "@/services/reservation.service";
import { getTransactionByOrderId } from "@/services/transaction.service";
import { UserRole } from "@/types/user.type";

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  const email = request.headers.get("X-User-Email");
  const role = request.headers.get("X-User-Role");

  if (!email || !role)
    return new Response(JSON.stringify({ status: 403, statusText: "You are not allowed to access this route" }), {
      status: 403,
    });

  try {
    await connectToDatabase();

    const getEmail = (await getReservationById(orderId)) || (await getOnlineOrderById(orderId));
    if (!getEmail) throw new Error("Something went wrong");

    if (getEmail.customerEmail !== email && role !== UserRole.Admin)
      return new Response(JSON.stringify({ status: 403, statusText: "You are not allowed to access this route" }), {
        status: 403,
      });

    const transactionByOrderId = await getTransactionByOrderId(orderId);
    if (!transactionByOrderId) throw new Error("Something went wrong.");

    return new Response(JSON.stringify({ status: 200, statusText: "Success", data: transactionByOrderId }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message || "Internal Server Error" }), {
      status: 500,
    });
  }
}
