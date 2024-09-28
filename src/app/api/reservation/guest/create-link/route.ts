import { createUniqueLink } from "@/lib/guest-unique-link";
import connectToDatabase from "@/lib/mongoose";
import { findUserByEmail } from "@/services/auth.service";
import { getReservationByEmail } from "@/services/reservation.service";

export async function POST(request: Request) {
  const { email } = await request.json();
  try {
    await connectToDatabase();

    const isValidMember = await findUserByEmail(email);
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

    const guestReservation = await getReservationByEmail(email);

    if (!guestReservation)
      return new Response(
        JSON.stringify({
          status: 422,
          statusText: "Sorry you have no reservation right now",
        }),
        { status: 422 }
      );

    const link = await createUniqueLink({ email });

    return new Response(
      JSON.stringify({
        status: 200,
        statusText: "Success to create new Link",
        link,
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
