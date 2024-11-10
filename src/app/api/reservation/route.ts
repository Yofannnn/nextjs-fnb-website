import { createUniqueLink, verifyUniqueLink } from "@/lib/guest-unique-link";
import connectToDatabase from "@/lib/mongoose";
import { findUserByEmail, findUserById } from "@/services/auth.service";
import {
  createReservation,
  getReservationByEmail,
  getReservationById,
  getReservationList,
  updateReservationById,
} from "@/services/reservation.service";
import { MenuSelection, Reservation } from "@/types/order.type";
import { ReservationSchema } from "@/validations/reservation.validation";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessId = searchParams.get("accessId"); // user === userId, guest === guestAccessToken
  const reservationId = searchParams.get("reservationId");

  try {
    await connectToDatabase();

    const guestEmail = (await verifyUniqueLink(accessId)).email;
    const isMember = (await findUserById(accessId as string)).data;
    const correctEmail = guestEmail || isMember.email;

    if (!correctEmail)
      return new Response(
        JSON.stringify({
          status: 400,
          statusText: "Sorry, your access id is invalid",
        }),
        { status: 400 }
      );

    if (reservationId) {
      const reservation = await getReservationById(reservationId);

      if (!reservation.data)
        return new Response(
          JSON.stringify({
            status: 404,
            statusText: "Invalid ID",
          }),
          { status: 404 }
        );

      if (!reservation.success)
        return new Response(
          JSON.stringify({
            status: 500,
            statusText: reservation.message,
          }),
          { status: 500 }
        );

      if (reservation.data.customerEmail !== correctEmail) {
        return new Response(
          JSON.stringify({
            status: 403,
            statusText: "You are not allowed to access this reservation",
          }),
          { status: 403 }
        );
      }

      return new Response(
        JSON.stringify({
          status: 200,
          statusText: "Success",
          data: reservation.data,
        }),
        { status: 200 }
      );
    }

    const reservations = await getReservationByEmail(correctEmail);

    if (!reservations.success) throw new Error(reservations.message);

    if (!reservations.data)
      return new Response(
        JSON.stringify({
          status: 404,
          statusText: reservations.message,
        }),
        { status: 404 }
      );

    return new Response(
      JSON.stringify({
        status: 200,
        statusText: "Success to get Reservations List",
        data: reservations.data,
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

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const validationPayload = {
      ...body,
      reservationDate: new Date(body.reservationDate),
    };
    const validationBody = await ReservationSchema.safeParseAsync(
      validationPayload
    );

    if (!validationBody.success)
      return new Response(
        JSON.stringify({
          status: 400,
          statusText: "Sorry, your data is invalid",
        }),
        { status: 400 }
      );

    await connectToDatabase();

    const {
      customerName,
      customerEmail,
      reservationDate,
      partySize,
      seatingPreference,
      specialRequest,
      reservationType,
      paymentStatus,
      menus,
    } = validationBody.data;

    // Check if the time, date, and seating have already been booked within a 6-hour window
    const conflictReservation = await checkIsConflictReservation(
      reservationDate,
      seatingPreference
    );
    if (conflictReservation) {
      return new Response(
        JSON.stringify({
          status: 409,
          statusText:
            "Sorry, reservation conflict within the same time slot and seating preference.",
        }),
        { status: 409 }
      );
    }

    const isMember = (await findUserByEmail(validationBody.data.customerEmail))
      .data;
    const reservationId = uuidv4();
    const total = getTotal(isMember, menus);
    const downPayment = getDownPayment(reservationType, paymentStatus, total);
    const discount = getDiscount(isMember, !!menus, total);

    const transactionPayload = {
      orderId: reservationId,
      orderType: "reservation",
      grossAmount: downPayment,
      paymentPurpose: paymentStatus,
      transactionStatus: "pending",
      transactionTime: new Date(),
    };

    // store transaction to database and get midtrans payment token
    const storeTransaction = await fetch(
      `${process.env.BASE_URL}/api/transaction`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionPayload),
      }
    );

    if (!storeTransaction.ok)
      return new Response(
        JSON.stringify({
          status: 500,
          statusText: "Sorry, we can't store your transaction",
        }),
        { status: 500 }
      );

    const { midtransPaymentToken } = await storeTransaction.json();

    const reservationPayload = {
      reservationId,
      customerName,
      customerEmail,
      reservationDate,
      partySize,
      seatingPreference,
      specialRequest,
      reservationType,
      menus: menus || [],
      downPayment,
      discount,
      total,
      transactionId: midtransPaymentToken,
      paymentStatus,
      reservationStatus: "pending",
    };

    // store reservation to database
    const reservation = await createReservation(reservationPayload);
    if (!reservation.success)
      return new Response(
        JSON.stringify({
          status: 400,
          statusText: reservation.message,
        }),
        { status: 400 }
      );

    const guestAccessToken = await createUniqueLink({
      email: customerEmail,
    });

    const dataResponse = isMember
      ? { token: midtransPaymentToken }
      : { token: midtransPaymentToken, guestAccessToken };

    return new Response(
      JSON.stringify({
        status: 201,
        statusText: "Success",
        data: dataResponse,
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
  const accessId = searchParams.get("accessId"); // user === userId, guest === guestAccessToken
  const reservationId = searchParams.get("reservationId");
  const action = searchParams.get("action");

  if (!reservationId)
    return new Response(
      JSON.stringify({
        status: 400,
        statusText: "Order Id is required",
      }),
      { status: 400 }
    );
  try {
    await connectToDatabase();

    const guestEmail = (await verifyUniqueLink(accessId)).email;
    const isMember = (await findUserById(accessId as string)).data;
    const correctEmail = guestEmail || isMember.email;

    if (!correctEmail)
      return new Response(
        JSON.stringify({
          status: 400,
          statusText: "Sorry, your access id is invalid",
        }),
        { status: 400 }
      );

    if (action === "transaction-complete") {
      // fetch and check this order id was complete the transaction or not
      const updateTransaction = await fetch(
        `${process.env.BASE_URL}/api/transaction?accessId=${
          isMember ? isMember._id : accessId
        }&orderId=${reservationId}&action=transaction-complete`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );

      const resultUpdateTransaction = await updateTransaction.json();

      if (!updateTransaction.ok)
        return new Response(JSON.stringify(resultUpdateTransaction), {
          status: 500,
        });

      //  here start to update reservation status to confirmed
      const reservation = await getReservationById(reservationId);
      const { success, message, data } = reservation;

      const updateReservationPayload = {
        ...data._doc,
        reservationStatus: "confirmed",
      };
      const updateReservation = await updateReservationById(
        reservationId,
        updateReservationPayload
      );

      if (!updateReservation.success)
        return new Response(
          JSON.stringify({
            status: 500,
            statusText: "Error updating reservation",
          }),
          { status: 500 }
        );

      return new Response(
        JSON.stringify({ status: 200, statusText: "Success" }),
        { status: 200 }
      );
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({ status: 500, statusText: error.message }),
      { status: 500 }
    );
  }
}

function getDownPayment(
  reservationType: "table-only" | "include-food",
  paymentStatus: "downPayment" | "paid",
  total: number
): number {
  if (reservationType === "include-food") {
    return paymentStatus === "downPayment" ? total / 2 : total;
  }
  return 30000;
}

function getTotal(member: boolean, menus: MenuSelection[] | undefined): number {
  if (!menus) return 30000;
  const total = menus
    ?.map((menu) => menu.quantity * menu.price)
    .reduce((acc, cur) => acc + cur, 0);
  return member ? total - getDiscount(member, true, total) : total;
}

function getDiscount(
  member: boolean,
  includeFood: boolean,
  total: number
): number {
  if (!includeFood) return 0;

  const discount = 10; // 10 percent
  return !member ? 0 : (total * discount) / 100;
}

async function checkIsConflictReservation(
  date: Date,
  seatingPreference: "indoor" | "outdoor"
) {
  const { success, data: listReservation } = await getReservationList();
  const sixHoursInMillis = 6 * 60 * 60 * 1000;

  return listReservation.some((reservation: Reservation) => {
    const existingTime = new Date(reservation.reservationDate).getTime();
    const newTime = new Date(date).getTime();

    return (
      Math.abs(existingTime - newTime) < sixHoursInMillis &&
      reservation.reservationDate === date &&
      reservation.seatingPreference === seatingPreference
    );
  });
}
