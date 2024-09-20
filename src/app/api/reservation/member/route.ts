import connectToDatabase from "@/lib/mongoose";
import { findUserByEmail } from "@/services/auth.service";
import {
  createReservationList,
  getReservationByEmail,
  getReservationById,
} from "@/services/reservation.service";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    await connectToDatabase();

    const isValidMember = await findUserByEmail(body.email);
    if (!isValidMember)
      return new Response(
        JSON.stringify({
          status: 404,
          statusText: "Sorry we can't find this email",
        }),
        { status: 404 }
      );

    const newReservation = await createReservationList(body);

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const email = searchParams.get("email");

  try {
    await connectToDatabase();

    if (id) {
      const reservation = await getReservationById(id);
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

    const memberReservationList = await getReservationByEmail(email ?? "");

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
