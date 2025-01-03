"use server";

import connectToDatabase from "@/database/mongoose";
import ReservationModel from "@/database/models/reservation.model";
import { getProductsSelectionFromDb } from "@/services/product.service";
import { initializeTransactionService, settlementTransactionService } from "@/services/transaction.service";
import { InitializeReservationPayload, Reservation } from "@/types/order.type";
import { getDiscount, getReservationDownPayment, getSubtotal } from "@/lib/calculation";
import { v4 as uuidv4 } from "uuid";
import { verifySession } from "@/lib/dal";
import { UserRole } from "@/types/user.type";
import { createSessionCookie } from "./session.service";

type Response<T = any> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; data?: undefined };

async function checkIsConflictReservation(date: Date, seatingPreference: "indoor" | "outdoor") {
  const listReservation = await getReservationList();
  const confirmedReservation = listReservation.filter((reservation) => reservation.reservationStatus === "confirmed");
  const sixHoursInMillis = 6 * 60 * 60 * 1000;

  return confirmedReservation.some((reservation: Reservation) => {
    const existingTime = new Date(reservation.reservationDate).getTime();
    const newTime = new Date(date).getTime();

    return (
      Math.abs(existingTime - newTime) < sixHoursInMillis &&
      reservation.reservationDate === date &&
      reservation.seatingPreference === seatingPreference
    );
  });
}

export async function initializeReservationService(payload: InitializeReservationPayload): Promise<Response> {
  try {
    await connectToDatabase();

    const {
      customerName,
      customerEmail,
      reservationDate,
      partySize,
      seatingPreference,
      specialRequest,
      paymentStatus,
      menus,
    } = payload;

    // Check if the time, date, and seating have already been booked within a 6-hour window
    const conflictReservation = await checkIsConflictReservation(reservationDate, seatingPreference);
    if (conflictReservation) throw new Error("Sorry, your time, date, and seating have already been booked");

    const session = await verifySession();
    const isMember = session?.role === UserRole.Member;
    const reservationId = uuidv4();
    const menusFromDb = await getProductsSelectionFromDb(menus || []);
    const reservationType = menusFromDb.length > 0 ? "include-food" : "table-only";
    const subtotal = getSubtotal(menusFromDb);
    const discount = !menusFromDb.length ? 0 : getDiscount(isMember, subtotal);
    const total = subtotal - discount;
    const downPayment = getReservationDownPayment(reservationType, paymentStatus, total);

    const transactionPayload = {
      orderId: reservationId,
      orderType: "reservation",
      grossAmount: downPayment,
      paymentPurpose: paymentStatus,
      transactionStatus: "pending",
      transactionTime: new Date(),
    };

    // store transaction to database and get midtrans payment token
    const storeTransaction = await initializeTransactionService(transactionPayload);

    const { midtransPaymentToken } = storeTransaction.data;

    const reservationPayload = {
      reservationId,
      customerName,
      customerEmail,
      reservationDate,
      partySize,
      seatingPreference,
      specialRequest,
      reservationType,
      menus: menusFromDb || [],
      subtotal,
      discount,
      total,
      downPayment,
      transactionId: midtransPaymentToken,
      paymentStatus,
      reservationStatus: "pending",
    };

    // store reservation to database
    const reservation = await ReservationModel.create(reservationPayload);
    if (!reservation) throw new Error("Reservation failed");

    // set cookies if user is not member(guest)
    if (!isMember) await createSessionCookie({ email: customerEmail, role: UserRole.Guest });

    // logic send email to customer

    return { success: true, message: "Reservation success", data: midtransPaymentToken };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function confirmReservationService(reservationId: string) {
  try {
    const settlementTransaction = await settlementTransactionService(reservationId);
    if (!settlementTransaction.success) throw new Error(settlementTransaction.message);

    const updateReservation = await await ReservationModel.findOneAndUpdate(
      { reservationId },
      { reservationStatus: "confirmed" },
      { new: true }
    );

    if (!updateReservation) throw new Error("Error updating reservation");

    return { success: true, message: "Success.", data: updateReservation };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getReservationById(reservationId: string) {
  return await ReservationModel.findOne({ reservationId });
}

export async function getReservationByEmail(customerEmail: string) {
  return await ReservationModel.find({ customerEmail });
}

export async function getReservationList() {
  return await ReservationModel.find();
}
