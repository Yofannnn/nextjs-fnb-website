import { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema(
  {
    transactionId: { type: String, required: true },
    orderId: { type: String, required: true },
    orderType: {
      type: String,
      enum: ["reservation", "online-order"],
      required: true,
    },
    grossAmount: { type: Number, required: true },
    currency: { type: String, required: false },
    vaNumbers: {
      type: [{ bank: { type: String }, vaNumber: { type: String } }],
      required: false,
    },
    paymentAmounts: {
      type: [{ amount: { type: Number }, paidAt: { type: Date } }],
      required: false,
    },
    paymentType: { type: String, required: false },
    paymentPurpose: {
      type: String,
      enum: ["downPayment", "paid"],
      required: true,
    },
    transactionStatus: {
      type: String,
      enum: ["settlement", "pending", "expire", "deny", "cancel", "refund"],
      required: true,
    },
    transactionTime: { type: Date, required: true },
    settlementTime: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

const TransactionModel =
  models.Transaction || model("Transaction", TransactionSchema);

export default TransactionModel;
