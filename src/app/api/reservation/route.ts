import connectToDatabase from "@/database/mongoose";
import { verifyGuestToken } from "@/services/guest-token.service";
import { findUserById } from "@/services/auth.service";
import { getReservationByEmail, getReservationById } from "@/services/reservation.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessId = searchParams.get("accessId"); // user === userId, guest === guestAccessToken
  const reservationId = searchParams.get("reservationId");

  try {
    await connectToDatabase();

    const guestEmail = await verifyGuestToken(accessId);
    const isMember = await findUserById(accessId as string);
    const correctEmail = guestEmail.email || isMember.email;

    if (!correctEmail)
      return new Response(JSON.stringify({ status: 400, statusText: "Sorry, your access id is invalid" }), {
        status: 400,
      });

    if (reservationId) {
      const reservation = await getReservationById(reservationId);

      if (!reservation) return new Response(JSON.stringify({ status: 404, statusText: "Invalid ID" }), { status: 404 });

      if (reservation.customerEmail !== correctEmail) {
        return new Response(
          JSON.stringify({ status: 403, statusText: "You are not allowed to access this reservation" }),
          { status: 403 }
        );
      }

      return new Response(JSON.stringify({ status: 200, statusText: "Success", data: reservation }), { status: 200 });
    }

    const reservations = await getReservationByEmail(correctEmail);

    if (!reservations)
      return new Response(JSON.stringify({ status: 404, statusText: "You have not made any reservation" }), {
        status: 404,
      });

    return new Response(
      JSON.stringify({ status: 200, statusText: "Success to get Reservations List", data: reservations }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message }), { status: 500 });
  }
}
