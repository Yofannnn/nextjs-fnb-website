"use server";

import connectToDatabase from "@/database/mongoose";
import ReservationModel from "@/database/models/reservation.model";
import { getProductsSelectionFromDb } from "@/services/product.service";
import { initializeTransactionService, settlementTransactionService } from "@/services/transaction.service";
import { createSessionCookie, verifySession } from "@/services/session.service";
import { sendEmail } from "@/services/email.service";
import { getDiscount, getReservationDownPayment, getSubtotal } from "@/lib/calculation";
import { InitializeReservationPayload, Reservation } from "@/types/order.type";
import { UserRole } from "@/types/user.type";
import { v4 as uuidv4 } from "uuid";

/**
 * Check if there is a conflict reservation with the given date and seating preference.
 * A conflict reservation is defined as a reservation with the same date and seating preference
 * and the time difference between the two reservations is less than 6 hours.
 *
 * @param {Date} date - The date to check for conflict reservations.
 * @param {"indoor"|"outdoor"} seatingPreference - The seating preference to check for conflict reservations.
 * @returns {Promise<boolean>} - True if there is a conflict reservation, false otherwise.
 */
async function checkIsConflictReservation(date: Date, seatingPreference: "indoor" | "outdoor"): Promise<boolean> {
  const listReservation = await getReservationList();
  const confirmedReservation = listReservation.filter((reservation) => reservation.reservationStatus === "confirmed");
  const sixHoursInMillis = 6 * 60 * 60 * 1000;

  // Check if there is a conflict reservation by comparing the time difference between the given date and the existing reservations.
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

/**
 * Initialize a new reservation by storing the reservation to the database and
 * storing a new transaction to the database and get the midtrans payment token.
 * If the user is not a member, set a cookie with the user's email and role.
 *
 * @param {InitializeReservationPayload} payload - The payload for initializing a new reservation.
 * @returns {Promise<{ success: boolean; message: string; data: string | null }>} - The result of the initialization.
 *   If success is true, the data is the midtrans payment token, otherwise the data is null.
 */
export async function initializeReservationService(payload: InitializeReservationPayload) {
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

    // menunya error njir
    // check lagi indikasi dibagian sini, soalnya di action menu berhasil di log
    // email ga kekirim, gatau apakah harus pake gmail atau gimana

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

    return { success: true, message: "Reservation success", data: midtransPaymentToken };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Confirm a reservation by updating the reservation status to "confirmed" in the database
 * and sending an email to the customer.
 *
 * @param {string} reservationId - The ID of the reservation to confirm.
 * @returns {Promise<{ success: boolean; message: string; data: Reservation | null }>} - The result of the confirmation.
 *   If success is true, the data is the confirmed reservation, otherwise the data is null.
 */
export async function confirmReservationService(reservationId: string) {
  try {
    // settlement transaction will update the transaction status to "settlement"
    const settlementTransaction = await settlementTransactionService(reservationId);
    if (!settlementTransaction.success) throw new Error(settlementTransaction.message);

    // update the reservation status to "confirmed"
    const updateReservation = await ReservationModel.findOneAndUpdate(
      { reservationId },
      { reservationStatus: "confirmed" },
      { new: true }
    );

    if (!updateReservation) throw new Error("Error updating reservation");

    // send a confirmation email to the customer
    await sendEmail({
      to: updateReservation.email,
      subject: "Reservation Confirmation",
      text: "Your reservation has been confirmed.",
    });

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
