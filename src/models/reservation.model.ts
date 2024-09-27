import { Schema, model, models } from "mongoose";

const ReservationSchema = new Schema(
  {
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    reservationDate: { type: Date, required: true },
    partySize: { type: Number, required: true },
    seatingPreference: {
      type: String,
      enum: ["indoor", "outdoor"],
      required: true,
    },
    specialRequest: { type: String, required: false },
    tableOnly: { type: Boolean, required: true },
    menus: {
      type: [
        {
          productId: { type: String, require: true },
          quantity: { type: Number, require: true },
        },
      ],
      required: false,
    },
    downPayment: { type: Number, require: true },
    discount: { type: Number, require: false },
    total: { type: Number, require: true },
    paymentStatus: {
      type: String,
      enum: ["downPayment", "paid"],
      required: true,
    },
    reservationStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      required: true,
      default: "confirmed",
    },
    reasonCancellation: { type: String, require: false },
    reasonPending: { type: String, require: false },
  },
  {
    timestamps: true,
  }
);

const ReservationModel =
  models.Reservation || model("Reservation", ReservationSchema);

export default ReservationModel;
