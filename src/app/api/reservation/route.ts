import connectToDatabase from "@/database/mongoose";
import { verifyGuestToken } from "@/services/guest-token.service";
import { findUserById } from "@/services/auth.service";
import { getReservationByEmail, getReservationById } from "@/services/reservation.service";
import {
  checkIsConflictReservation,
  confirmReservationService,
  initializeBookingService,
} from "@/services/reservation.service";
import { ReservationSchema } from "@/validations/reservation.validation";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationBody = await ReservationSchema.safeParseAsync({
      ...body,
      reservationDate: new Date(body.reservationDate),
    });

    if (!validationBody.success)
      return new Response(JSON.stringify({ status: 400, statusText: "Sorry, your data is invalid" }), {
        status: 400,
      });

    // Check if the time, date, and seating have already been booked within a 6-hour window
    const conflictReservation = await checkIsConflictReservation(
      validationBody.data.reservationDate,
      validationBody.data.seatingPreference
    );
    if (conflictReservation)
      return new Response(
        JSON.stringify({ status: 409, statusText: "Sorry, your time, date, and seating have already been booked" }),
        { status: 409 }
      );

    const newReservation = await initializeBookingService(validationBody.data);
    if (!newReservation.success) throw new Error(newReservation.message);

    const { token, guestAccessToken } = newReservation.data;

    return new Response(JSON.stringify({ status: 201, statusText: "Success", data: { token, guestAccessToken } }), {
      status: 201,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message }), { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessId = searchParams.get("accessId"); // user === userId, guest === guestAccessToken
  const reservationId = searchParams.get("reservationId");
  const action = searchParams.get("action");

  if (!reservationId)
    return new Response(JSON.stringify({ status: 400, statusText: "Order Id is required" }), { status: 400 });

  try {
    await connectToDatabase();

    const guestEmail = await verifyGuestToken(accessId);
    const isMember = await findUserById(accessId as string);
    const correctEmail = isMember.email || guestEmail.email;

    if (!correctEmail)
      return new Response(JSON.stringify({ status: 400, statusText: "Sorry, your access id is invalid" }), {
        status: 400,
      });

    if (action === "transaction-complete") {
      const confirmResevation = await confirmReservationService(reservationId);
      if (!confirmResevation.success) throw new Error(confirmResevation.message);

      return new Response(JSON.stringify({ status: 200, statusText: "Success" }), { status: 200 });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message }), { status: 500 });
  }
}
