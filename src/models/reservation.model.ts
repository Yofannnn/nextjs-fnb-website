import { Schema, model, models } from "mongoose";

const ReservationSchema = new Schema(
  {
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    reservationDate: { type: Date, required: true },
    reservationTime: { type: String, required: true },
    partySize: { type: Number, required: true },
    seatingPreference: { type: String, required: true },
    specialRequest: { type: String, required: false },
    tableOnly: { type: Boolean, required: true },
    menus: {
      type: [
        {
          productId: { type: String, require: true },
          quantity: { type: Number, require: true },
        },
      ],
      default: [],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const ReservationModel =
  models.Reservation || model("Reservation", ReservationSchema);

export default ReservationModel;
