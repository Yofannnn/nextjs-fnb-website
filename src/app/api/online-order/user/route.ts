import connectToDatabase from "@/database/mongoose";
import { getFilteredOnlineOrder } from "@/services/online-order.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deliveryDate = searchParams.get("deliveryDate") || undefined;
  const orderStatus = searchParams.get("orderStatus") || undefined;

  const email = request.headers.get("X-User-Email");
  const role = request.headers.get("X-User-Role");

  if (!role || !email)
    return new Response(JSON.stringify({ status: 403, statusText: "You are not allowed to access this route" }), {
      status: 403,
    });

  try {
    await connectToDatabase();

    if (orderStatus || deliveryDate || email) {
      const filteredOrders = await getFilteredOnlineOrder({ customerEmail: email, orderStatus, deliveryDate });
      if (!filteredOrders) throw new Error("Something went wrong");

      return new Response(JSON.stringify({ status: 200, statusText: "Success", data: filteredOrders }), { status: 200 });
    }

    const orders = await getFilteredOnlineOrder({ customerEmail: email });
    if (!orders) throw new Error("Something went wrong");

    return new Response(JSON.stringify({ status: 200, statusText: "Success", data: orders }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message || "Internal Server Error" }), {
      status: 500,
    });
  }
}
