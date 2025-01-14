import connectToDatabase from "@/database/mongoose";
import { getFilteredOnlineOrder, getOnlineOrderList } from "@/services/online-order.service";
import { UserRole } from "@/types/user.type";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deliveryDate = searchParams.get("deliveryDate") || undefined;
  const orderStatus = searchParams.get("orderStatus") || undefined;

  const role = request.headers.get("X-User-Role");

  if (role !== UserRole.Admin)
    return new Response(JSON.stringify({ status: 403, statusText: "You are not allowed to access this route" }), {
      status: 403,
    });

  try {
    await connectToDatabase();

    if (deliveryDate || orderStatus) {
      const filteredOrders = await getFilteredOnlineOrder({ deliveryDate, orderStatus });
      if (!filteredOrders) throw new Error("Something went wrong");

      return new Response(JSON.stringify({ status: 200, statusText: "Success", data: filteredOrders }), { status: 200 });
    }

    const orders = await getOnlineOrderList();
    if (!orders) throw new Error("Something went wrong");

    return new Response(JSON.stringify({ status: 200, statusText: "Success", data: orders }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message }), { status: 500 });
  }
}
