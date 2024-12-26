import connectToDatabase from "@/database/mongoose";
import { getOnlineOrderById, getOnlineOrdersByEmail } from "@/services/online-order.service";
import { findUserById } from "@/services/auth.service";
import { verifyGuestToken } from "@/services/guest-token.service";
import { confirmOnlineOrderService, initializeOnlineOrderService } from "@/services/online-order.service";
import { OnlineOrderSchema } from "@/validations/online-order.validation";

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

enum OnlineOrderPost {
  order_confirmed = "order-confirmed",
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessId = searchParams.get("accessId"); //userId || guestAccessToken
  const orderId = searchParams.get("orderId");
  const action = searchParams.get("action");

  if (!orderId)
    return new Response(JSON.stringify({ status: 400, statusText: "Order Id is required" }), { status: 400 });

  try {
    await connectToDatabase();

    const guestEmail = await verifyGuestToken(accessId);
    const isMember = await findUserById(accessId as string);
    const correctEmail = guestEmail.email || isMember.email;

    if (!correctEmail)
      return new Response(JSON.stringify({ status: 400, statusText: "Sorry, your access id is invalid" }), {
        status: 400,
      });

    if (action === OnlineOrderPost.order_confirmed) {
      const confirmedOnlineOrder = await confirmOnlineOrderService(orderId);
      if (!confirmedOnlineOrder.success) throw new Error(confirmedOnlineOrder.message);

      return new Response(JSON.stringify({ status: 200, statusText: "Success to update order." }), { status: 200 });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message }), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationBody = await OnlineOrderSchema.safeParseAsync({
      ...body,
      deliveryDate: new Date(body.deliveryDate),
    });

    if (!validationBody.success)
      return new Response(JSON.stringify({ status: 400, statusText: validationBody.error }), { status: 400 });

    const newOnlineOrder = await initializeOnlineOrderService(validationBody.data);

    const { token, guestAccessToken } = newOnlineOrder.data;

    return new Response(
      JSON.stringify({ status: 201, statusText: "Success to create online order", data: { token, guestAccessToken } }),
      { status: 201 }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message }), { status: 500 });
  }
}
