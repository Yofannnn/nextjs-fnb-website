import ReservationModel from "@/models/reservation.model";

export async function createReservationList(payload: object) {
  return ReservationModel.create(payload);
}

export async function updateReservationById(
  reservationId: string,
  payload: object
) {
  return ReservationModel.findByIdAndUpdate(
    reservationId,
    { $set: payload },
    { new: true }
  );
}

export async function deleteReservationList(reservationId: string) {
  return ReservationModel.findByIdAndDelete(reservationId);
}

export async function getReservationById(reservationId: string) {
  return ReservationModel.findById(reservationId);
}

export async function getReservationByEmail(customerEmail: string) {
  return ReservationModel.find({ customerEmail });
}

export async function getReservationList() {
  return ReservationModel.find();
}
