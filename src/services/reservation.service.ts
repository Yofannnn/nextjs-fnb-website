import ReservationModel from "@/models/reservation.model";

export async function addReservationList(payload: object) {
  return ReservationModel.create(payload);
}

export async function updateReservationList(
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

export async function getReservationList() {
  return ReservationModel.find();
}
