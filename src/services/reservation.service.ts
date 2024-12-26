"use server";

import connectToDatabase from "@/database/mongoose";
import ReservationModel from "@/database/models/reservation.model";
import { findUserByEmail } from "@/services/auth.service";
import { createGuestToken } from "@/services/guest-token.service";
import { getProductsSelectionFromDb } from "@/services/product.service";
import { initializeTransactionService, settlementTransactionService } from "@/services/transaction.service";
import { Reservation } from "@/types/order.type";
import { getDiscount, getReservationDownPayment, getSubtotal } from "@/lib/calculation";
import { v4 as uuidv4 } from "uuid";

type Response<T = any> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; data?: undefined };

export async function initializeBookingService(payload: {
  customerName: string;
  customerEmail: string;
  reservationDate: Date;
  partySize: number;
  seatingPreference: "indoor" | "outdoor";
  paymentStatus: "downPayment" | "paid";
  specialRequest?: string | undefined;
  menus?: { productId: string; quantity: number }[];
}): Promise<Response> {
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

    const isMember = await findUserByEmail(customerEmail);
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

    if (!reservation) return { success: false, message: "Reservation failed" };

    const guestAccessToken = await createGuestToken({ email: customerEmail });

    const dataResponse = isMember ? { token: midtransPaymentToken } : { token: midtransPaymentToken, guestAccessToken };

    return { success: true, message: "Reservation success", data: dataResponse };
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

export async function checkIsConflictReservation(date: Date, seatingPreference: "indoor" | "outdoor") {
  const listReservation = await getReservationList();
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

export async function getReservationById(reservationId: string) {
  return await ReservationModel.findOne({ reservationId });
}

export async function getReservationByEmail(customerEmail: string) {
  return await ReservationModel.find({ customerEmail });
}

export async function getReservationList() {
  return await ReservationModel.find();
}
