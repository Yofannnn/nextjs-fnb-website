import connectToDatabase from "@/database/mongoose";
import { getReservationById, getReservationByStatusByTypeByDate, getReservationList } from "@/services/reservation.service";
import { UserRole } from "@/types/user.type";

function isAdmin(role: string | null) {
  if (role !== UserRole.Admin)
    return new Response(JSON.stringify({ status: 403, statusText: "You are not allowed to access this route" }), {
      status: 403,
    });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reservationId = searchParams.get("reservationId");
  const reservationStatus = searchParams.get("reservationStatus");
  const reservationType = searchParams.get("reservationType");
  const reservationDate = searchParams.get("reservationDate");

  const email = request.headers.get("X-User-Email");
  const role = request.headers.get("X-User-Role");

  if (!role)
    return new Response(JSON.stringify({ status: 401, statusText: "Unauthenticated." }), {
      status: 401,
    });

  try {
    await connectToDatabase();

    if (reservationId) {
      const reservation = await getReservationById(reservationId);
      if (!reservation) return new Response(JSON.stringify({ status: 404, statusText: "Invalid ID" }), { status: 404 });

      if (reservation.customerEmail !== email && role !== UserRole.Admin) {
        return new Response(JSON.stringify({ status: 403, statusText: "You are not allowed to access this reservation" }), {
          status: 403,
        });
      }

      return new Response(JSON.stringify({ status: 200, statusText: "Success", data: reservation }), { status: 200 });
    }

    if (reservationStatus || reservationType || reservationDate) {
      isAdmin(role);

      const reservations = await getReservationByStatusByTypeByDate(
        reservationStatus || undefined,
        reservationType || undefined,
        reservationDate || undefined
      );
      if (!reservations) throw new Error("Something went wrong");

      return new Response(
        JSON.stringify({ status: 200, statusText: "Success to get Reservations List", data: reservations }),
        { status: 200 }
      );
    }

    // all reservation list
    isAdmin(role);

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
