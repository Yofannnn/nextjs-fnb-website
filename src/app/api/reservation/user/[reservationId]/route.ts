import connectToDatabase from "@/database/mongoose";
import { getReservationById } from "@/services/reservation.service";
import { UserRole } from "@/types/user.type";

export async function GET(request: Request, { params }: { params: Promise<{ reservationId: string }> }) {
  const { reservationId } = await params;

  const email = request.headers.get("X-User-Email");
  const role = request.headers.get("X-User-Role");

  if (!role || !email)
    return new Response(JSON.stringify({ status: 403, statusText: "You are not allowed to access this route" }), {
      status: 403,
    });

  try {
    await connectToDatabase();

    const reservation = await getReservationById(reservationId);
    if (!reservation) throw new Error("Something went wrong");

    if (reservation.customerEmail !== email && role !== UserRole.Admin)
      return new Response(JSON.stringify({ status: 403, statusText: "You are not allowed to access this reservation" }), {
        status: 403,
      });

    return new Response(JSON.stringify({ status: 200, statusText: "Success", data: reservation }), {
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message || "Internal Server Error" }), {
      status: 500,
    });
  }
}
