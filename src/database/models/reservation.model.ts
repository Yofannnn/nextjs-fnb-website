import { Schema, model, models } from "mongoose";

const ReservationSchema = new Schema(
  {
    reservationId: { type: String, required: true },
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
    reservationType: {
      type: String,
      enum: ["table-only", "include-food"],
      required: true,
    },
    menus: {
      type: [
        {
          productId: { type: String, required: true },
          quantity: { type: Number, required: true },
          price: { type: Number, required: true }, // Price at the time of reservation
        },
      ],
      required: false,
      default: undefined,
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, required: false },
    total: { type: Number, required: true },
    downPayment: { type: Number, required: true },
    transactionId: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["downPayment", "paid"],
      required: true,
    },
    reservationStatus: {
      type: String,
      enum: ["pending", "confirmed", "rescheduled", "cancelled"],
      required: true,
      default: "pending",
    },
    reasonCancellation: { type: String, required: false },
    reasonPending: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const ReservationModel =
  models.Reservation || model("Reservation", ReservationSchema);

export default ReservationModel;
