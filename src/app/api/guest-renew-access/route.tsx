import { createUniqueLink } from "@/lib/guest-unique-link";
import { findUserByEmail } from "@/services/auth.service";

export async function POST(request: Request) {
  const { email } = await request.json();

  try {
    const isMember = await findUserByEmail(email);
    if (isMember.data)
      return new Response(
        JSON.stringify({
          status: 400,
          statusText:
            "You are already a member, Please login with your email and password.",
        }),
        { status: 400 }
      );

    // check apa punya transaksi, reservasi, atau online oreder, kalau ngga mungkin retrun 400

    const guestAccessToken = await createUniqueLink({ email });

    // send link to customer email

    return new Response(
      JSON.stringify({
        status: 200,
        statusText: "Success",
        data: { guestAccessToken },
      })
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
