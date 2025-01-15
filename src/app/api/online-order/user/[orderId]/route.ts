import connectToDatabase from "@/database/mongoose";
import { getOnlineOrderById } from "@/services/online-order.service";
import { UserRole } from "@/types/user.type";

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  const email = request.headers.get("X-User-Email");
  const role = request.headers.get("X-User-Role");

  if (!role)
    return new Response(JSON.stringify({ status: 403, statusText: "You are not allowed to access this route" }), {
      status: 403,
    });

  try {
    await connectToDatabase();

    const orderById = await getOnlineOrderById(orderId);
    if (!orderById) throw new Error("Something went wrong");

    if (orderById.cutomerEmail !== email && role !== UserRole.Admin)
      return new Response(JSON.stringify({ status: 403, statusText: "You are not allowed to access this order" }), {
        status: 403,
      });

    return new Response(JSON.stringify({ status: 200, statusText: "Success", data: orderById }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message || "Internal Server Error" }), {
      status: 500,
    });
  }
}
