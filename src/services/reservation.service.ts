import ReservationModel from "@/models/reservation.model";

interface Response {
  success: boolean;
  data: any;
  message: string;
}

export async function createReservation(payload: object): Promise<Response> {
  const data = await ReservationModel.create(payload);
  try {
    return {
      success: true,
      data,
      message: "Reservation created successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
}

export async function updateReservationById(
  reservationId: string,
  payload: object
): Promise<Response> {
  try {
    const data = await ReservationModel.findOneAndUpdate(
      { reservationId },
      { $set: payload },
      { new: true }
    );
    return {
      success: true,
      data,
      message: "Reservation updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
}

export async function deleteReservationById(reservationId: string) {
  try {
    const data = await ReservationModel.findByIdAndDelete(reservationId);
    return {
      success: true,
      data,
      message: "Reservation deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
}

export async function getReservationById(
  reservationId: string
): Promise<Response> {
  try {
    const data = await ReservationModel.findOne({ reservationId });
    return {
      success: true,
      data,
      message: "Reservation fetched successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
}

export async function getReservationByEmail(
  customerEmail: string
): Promise<Response> {
  try {
    const data = await ReservationModel.find({ customerEmail });
    return {
      success: true,
      data,
      message: "Reservation fetched successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
}

export async function getReservationList(): Promise<Response> {
  try {
    const data = await ReservationModel.find();
    return {
      success: true,
      data,
      message: "Reservation list fetched successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
}
