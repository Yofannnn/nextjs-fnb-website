import { Schema, model, models } from "mongoose";

const OTPSchema = new Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    otpExpiry: { type: Date, required: true },
  },
  { timestamps: true }
);

const OTPModel = models.OTP || model("OTP", OTPSchema);

export default OTPModel;
