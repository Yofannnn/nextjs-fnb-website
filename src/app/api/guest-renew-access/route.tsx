import { createUniqueLink } from "@/lib/guest-unique-link";
import { findUserByEmail } from "@/services/auth.service";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get("redirect");
  const { email } = await request.json();

  try {
    const isMember = await findUserByEmail(email);
    if (isMember)
      return new Response(
        JSON.stringify({
          status: 400,
          statusText:
            "You are already a member, Please login to menage your reservation",
        }),
        { status: 400 }
      );

    // check apa punya transaksi, reservasi, atau online oreder, kalau ngga mungkin retrun 400

    const token = await createUniqueLink({ email });
    const redirect_url = `http://localhost:3000/guest/${redirect}/${token}`;

    // send link to customer email

    return new Response(
      JSON.stringify({
        status: 200,
        statusText: "Success",
        data: { redirect_url },
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
