import connectToDatabase from "@/database/mongoose";
import { getOnlineOrderById, getOnlineOrdersByEmail } from "@/services/online-order.service";
import { findUserById } from "@/services/auth.service";
import { verifyGuestToken } from "@/services/guest-token.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessId = searchParams.get("accessId");
  const orderId = searchParams.get("orderId");

  if (!accessId)
    return new Response(JSON.stringify({ status: 400, statusText: "Access Id is required" }), { status: 400 });

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
      const order = await getOnlineOrderById(orderId);

      if (!order) throw new Error("Order not found");

      return new Response(JSON.stringify({ status: 200, statusText: "Success", data: order }), { status: 200 });
    }

    const orders = await getOnlineOrdersByEmail(email);
    if (!orders) throw new Error("Something went wrong");

    return new Response(JSON.stringify({ status: 200, statusText: "Success", data: orders }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message }), { status: 500 });
  }
}
