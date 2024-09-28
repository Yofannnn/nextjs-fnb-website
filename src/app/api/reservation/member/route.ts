import connectToDatabase from "@/lib/mongoose";
import { findUserByEmail, findUserById } from "@/services/auth.service";
import {
  createReservationList,
  getReservationByEmail,
  getReservationById,
  updateReservationById,
} from "@/services/reservation.service";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    await connectToDatabase();

    const isValidMember = await findUserByEmail(body.customerEmail);
    if (!isValidMember)
      return new Response(
        JSON.stringify({
          status: 404,
          statusText: "Sorry we can't find this email",
        }),
        { status: 404 }
      );

    const payload = { ...body, reservationStatus: "confirmed" };
    const newReservation = await createReservationList(payload);

    if (!newReservation)
      return new Response(
        JSON.stringify({
          status: 500,
          statusText: "Sorry, we can't create areservation",
        }),
        { status: 500 }
      );

    return new Response(
      JSON.stringify({
        status: 201,
        statusText: "Reservation created successfully",
      }),
      { status: 201 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        status: 500,
        statusText: error.message,
      }),
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("memberId");
  const reservationId = searchParams.get("reservationId");
  const body = await request.json();

  if (!userId)
    return new Response(
      JSON.stringify({
        status: 403,
        statusText: "Params memberId is require.",
      }),
      { status: 403 }
    );

  if (!reservationId)
    return new Response(
      JSON.stringify({
        status: 403,
        statusText: "Params reservationId is require.",
      }),
      { status: 403 }
    );

  try {
    await connectToDatabase();

    const isValidMember = await findUserById(userId);
    if (!isValidMember)
      return new Response(
        JSON.stringify({
          status: 404,
          statusText: "You are not Member, please register to become member",
        }),
        { status: 404 }
      );

    const updatedReservation = await updateReservationById(reservationId, body);
    if (!updatedReservation)
      return new Response(
        JSON.stringify({
          status: 422,
          statusText: "Failed to update reservation.",
        }),
        { status: 422 }
      );

    return new Response(
      JSON.stringify({
        status: 201,
        statusText: "Success to update reservation.",
      }),
      { status: 201 }
    );
  } catch (error: any) {
    if (!reservationId)
      return new Response(
        JSON.stringify({
          status: 500,
          statusText: error.message,
        }),
        { status: 500 }
      );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const reservationId = searchParams.get("reservationId");

  if (!userId)
    return new Response(
      JSON.stringify({
        status: 422,
        statusText: "Param userId was require",
      }),
      { status: 422 }
    );

  try {
    await connectToDatabase();

    const isValidMember = await findUserById(userId);
    if (!isValidMember)
      return new Response(
        JSON.stringify({
          status: 404,
          statusText: "Sorry you are not a member.",
        }),
        { status: 404 }
      );

    if (reservationId) {
      const reservation = await getReservationById(reservationId);
      return !reservation
        ? new Response(
            JSON.stringify({
              status: 404,
              statusText: "Sorry we can'tfind this reservation",
            }),
            { status: 404 }
          )
        : new Response(
            JSON.stringify({
              status: 200,
              statusText: "Success",
              data: reservation,
            }),
            { status: 200 }
          );
    }

    const memberReservationList = await getReservationByEmail(
      isValidMember.email
    );

    if (!memberReservationList)
      return new Response(
        JSON.stringify({
          status: 404,
          statusText: "Sorry we can't find this email",
        }),
        { status: 404 }
      );

    return new Response(
      JSON.stringify({
        status: 200,
        statusText: "Success",
        data: memberReservationList,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        status: 500,
        statusText: error.message,
      }),
      { status: 500 }
    );
  }
}
