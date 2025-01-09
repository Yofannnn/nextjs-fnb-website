"use server";

import { confirmReservationService, initializeReservationService } from "@/services/reservation.service";
import { InitializeReservationPayload } from "@/types/order.type";
import { ReservationSchema } from "@/validations/reservation.validation";

export async function initializeReservationAction(payload: InitializeReservationPayload) {
  try {
    const validationBody = await ReservationSchema.safeParseAsync(payload);
    if (!validationBody.success) throw new Error(validationBody.error.message);

    const newReservation = await initializeReservationService(validationBody.data);
    if (!newReservation.success) throw new Error(newReservation.message);

    return newReservation;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function confirmReservationAction(reservationId: string) {
  try {
    const confirmReservation = await confirmReservationService(reservationId);
    if (!confirmReservation.success) throw new Error(confirmReservation.message);

    return confirmReservation;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
