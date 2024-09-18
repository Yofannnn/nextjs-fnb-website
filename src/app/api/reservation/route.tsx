import connectToDatabase from "@/lib/mongoose";
import {
  addReservationList,
  getReservationById,
  getReservationList,
} from "@/services/reservation.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await connectToDatabase();

  const body = await request.json();

  try {
    const listReservation = await getReservationList();
    const checkUserCanReservationOrNot =
      listReservation.find(
        (list) => new Date(list.reservationDate + list.reservationTime)
      ) === new Date(body.reservationDate + body.reservationTime);

    if (checkUserCanReservationOrNot)
      return NextResponse.json({
        status: 422,
        statusText: "Sorry can't reservation for this time",
      });

    const newReservationList = await addReservationList(body);
    if (!newReservationList)
      return NextResponse.json({
        status: 422,
        statusText: "Failed to reservation",
      });
    return NextResponse.json({ status: 201, statusText: "Success" });
  } catch (error: any) {
    return NextResponse.json({ status: 500, statusText: error.message });
  }
}

export async function GET(request: Request) {
  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("reservationId");

  try {
    if (id) {
      const reservationById = await getReservationById(id);
      if (!reservationById)
        return NextResponse.json({ status: 404, statusText: "Not Found" });

      return NextResponse.json(reservationById, {
        status: 200,
        statusText: "Success",
      });
    }
    const listReservation = await getReservationList();
    return NextResponse.json(listReservation, {
      status: 201,
      statusText: "Success",
    });
  } catch (error: any) {
    return NextResponse.json({ status: 500, statusText: error.message });
  }
}
