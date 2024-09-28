import { createUniqueLink, verifyUniqueLink } from "@/lib/guest-unique-link";
import connectToDatabase from "@/lib/mongoose";
import { findUserByEmail } from "@/services/auth.service";
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

    const isValidMember = await findUserByEmail(body.email);
    if (isValidMember)
      return new Response(
        JSON.stringify({
          status: 400,
          statusText:
            "You are already a member, Please login to be continue your reservation",
        }),
        {
          status: 400,
        }
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

    const uniqueLink = await createUniqueLink({
      email: newReservation._doc.customerEmail,
    });

    return new Response(
      JSON.stringify({
        status: 201,
        statusText: "Reservation created successfully",
        link: uniqueLink,
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
  const token = searchParams.get("token");
  const reservationId = searchParams.get("reservationId");
  const email = await verifyUniqueLink(token ?? "");
  const body = await request.json();

  if (!email)
    return new Response(
      JSON.stringify({ status: 401, statusText: "Invalid Token" }),
      { status: 401 }
    );

  if (!reservationId)
    return new Response(
      JSON.stringify({ status: 400, statusText: "Invalid ID" }),
      { status: 400 }
    );

  try {
    await connectToDatabase();

    const isValidGuest = await getReservationByEmail(email);
    if (!isValidGuest)
      return new Response(
        JSON.stringify({ status: 404, statusText: "Not Found" }),
        { status: 404 }
      );

    const updatedReservation = await updateReservationById(reservationId, body);
    if (!updatedReservation)
      return new Response(
        JSON.stringify({
          status: 400,
          statusText: "Failed to Update Your Reservation.",
        }),
        { status: 400, statusText: "Failed to Update Your Reservation." }
      );

    return new Response(
      JSON.stringify({
        status: 201,
        statusText: "Success to Update Your Reservation.",
      }),
      { status: 201, statusText: "Success to Update Your Reservation." }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ status: 500, statusText: error.message }),
      { status: 500, statusText: error.message }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const id = searchParams.get("id");
  const email = await verifyUniqueLink(token ?? "");

  if (!email) {
    return new Response(
      JSON.stringify({ status: 401, statusText: "Invalid Token" }),
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();

    // if validated email and id is true it get data reservation with id (for details, edit, and cancel)
    if (email && id) {
      const reservation = await getReservationById(id);
      return !reservation
        ? new Response(
            JSON.stringify({ status: 404, statusText: "Not Found", data: {} }),
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

    // retrieve the entire list of reservation data with the same email (multiple reservation)
    const guestReservationList = await getReservationByEmail(email);

    if (!guestReservationList)
      return new Response(
        JSON.stringify({ status: 404, statusText: "Not Found" }),
        { status: 404 }
      );

    return new Response(
      JSON.stringify({
        status: 200,
        statusText: "Success",
        data: guestReservationList,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ status: 500, statusText: error.message }),
      { status: 500 }
    );
  }
}
