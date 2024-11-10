import connectToDatabase from "@/lib/mongoose";
import { getReservationList } from "@/services/reservation.service";

// add middleware for this api to prevent fetch by other user, this api admin only who can access
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const {
      success,
      data: reservationList,
      message,
    } = await getReservationList();

    return new Response(
      JSON.stringify({
        status: 200,
        statusText: "Success to get Reservations List",
        data: reservationList,
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
