import { createGuestToken } from "@/services/guest-token.service";
import { findUserByEmail } from "@/services/auth.service";
import { getOnlineOrdersByEmail } from "@/services/online-order.service";
import { getReservationByEmail } from "@/services/reservation.service";

export async function POST(request: Request) {
  const { email } = await request.json();

  try {
    const isMember = await findUserByEmail(email);
    if (isMember)
      return new Response(
        JSON.stringify({
          status: 400,
          statusText: "You are already a member, Please login with your email and password.",
        }),
        { status: 400 }
      );

    const guestOrder = await Promise.all([getReservationByEmail(email), getOnlineOrdersByEmail(email)]);

    if (!guestOrder[0].length || !guestOrder[1].length)
      return new Response(JSON.stringify({ status: 400, statusText: "You have not made any reservation or order" }), {
        status: 400,
      });

    const guestAccessToken = await createGuestToken({ email });

    return new Response(JSON.stringify({ status: 200, statusText: "Success", data: { guestAccessToken } }));
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 500, statusText: error.message }), { status: 500 });
  }
}
