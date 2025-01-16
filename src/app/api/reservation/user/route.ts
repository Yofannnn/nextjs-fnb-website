import connectToDatabase from "@/database/mongoose";
import { getFilteredReservations } from "@/services/reservation.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reservationDate = searchParams.get("reservationDate") || undefined;
  const reservationType = searchParams.get("reservationType") || undefined;
  const reservationStatus = searchParams.get("reservationStatus") || undefined;

  const email = request.headers.get("X-User-Email");
  const role = request.headers.get("X-User-Role");

  if (!role || !email)
    return new Response(JSON.stringify({ status: 403, statusText: "You are not allowed to access this route" }), {
      status: 403,
    });

  try {
    await connectToDatabase();
    if (reservationDate || reservationType || reservationStatus) {
      const reservations = await getFilteredReservations({
        customerEmail: email as string,
        reservationStatus,
        reservationType,
        reservationDate,
      });

      if (!reservations) throw new Error("Something went wrong");

      return new Response(JSON.stringify({ status: 200, statusText: "Success", data: reservations }), { status: 200 });
    }

    const reservations = await getFilteredReservations({ customerEmail: email });
    if (!reservations) throw new Error("Something went wrong");

    return new Response(JSON.stringify({ status: 200, statusText: "Success", data: reservations }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message || "Internal Server Error" }), {
      status: 500,
    });
  }
}
