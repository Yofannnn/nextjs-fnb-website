import connectToDatabase from "@/database/mongoose";
import { getFilteredReservations, getReservationList } from "@/services/reservation.service";
import { UserRole } from "@/types/user.type";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reservationStatus = searchParams.get("reservationStatus") || undefined;
  const reservationType = searchParams.get("reservationType") || undefined;
  const reservationDate = searchParams.get("reservationDate") || undefined;

  const role = request.headers.get("X-User-Role");

  if (role !== UserRole.Admin)
    return new Response(JSON.stringify({ status: 403, statusText: "You are not allowed to access this route" }), {
      status: 403,
    });

  try {
    await connectToDatabase();

    if (reservationStatus || reservationType || reservationDate) {
      const filteredReservations = await getFilteredReservations({ reservationStatus, reservationType, reservationDate });
      if (!filteredReservations) throw new Error("Something went wrong");

      return new Response(
        JSON.stringify({ status: 200, statusText: "Success to get Reservations List", data: filteredReservations }),
        { status: 200 }
      );
    }

    const reservationList = await getReservationList();
    if (!reservationList) throw new Error("Something went wrong");

    return new Response(
      JSON.stringify({ status: 200, statusText: "Success to get Reservations List", data: reservationList }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message }), { status: 500 });
  }
}
