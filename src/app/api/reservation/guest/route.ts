import { createUniqueLink, verifyUniqueLink } from "@/lib/guest-unique-link";
import connectToDatabase from "@/lib/mongoose";
import { findUserByEmail } from "@/services/auth.service";
import {
  createReservationList,
  getReservationById,
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

    const newReservation = await createReservationList(body);

    if (!newReservation)
      return new Response(
        JSON.stringify({
          status: 500,
          statusText: "Sorry, we can't create areservation",
        }),
        { status: 500 }
      );

    const uniqueLink = createUniqueLink({ id: newReservation._doc._id });

    return new Response(
      JSON.stringify({
        status: 201,
        statusText: "Reservation created successfully",
        link: uniqueLink,
      }),
      { status: 201 }
    );
  } catch (error: any) {}
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const verifyLink = await verifyUniqueLink(token ?? "");
  const id = verifyLink ?? "";

  try {
    await connectToDatabase();

    const reservationById = await getReservationById(id);

    if (!reservationById)
      return new Response(
        JSON.stringify({ status: 404, statusText: "Not Found" }),
        { status: 404 }
      );

    return new Response(
      JSON.stringify({
        status: 200,
        statusText: "Success",
        data: reservationById,
      }),
      reservationById
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ status: 500, statusText: error.message }),
      { status: 500 }
    );
  }
}
