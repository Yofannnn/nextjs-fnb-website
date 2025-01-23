"use server";

import connectToDatabase from "@/database/mongoose";
import OTPModel from "@/database/models/otp.model";
import { findUserByEmail } from "@/services/auth.service";
import { getFilteredReservations } from "@/services/reservation.service";
import { getFilteredOnlineOrder } from "@/services/online-order.service";
import { sendEmail } from "@/services/email.service";
import { createSessionCookie } from "@/services/session.service";
import { UserRole } from "@/types/user.type";
import { comparePassword, hashPassword } from "@/lib/hash";
import { sendOTPHTML } from "@/lib/email-html";
import { z } from "zod";

/**
 * Send OTP to guest's email to renew access to their order or reservation.
 *
 * @param {string} clientEmail - The email of the guest.
 *
 * @returns {Promise<{ success: boolean, message: string }>} - A promise that resolves
 *     with an object containing a boolean indicating whether the OTP was sent
 *     successfully, and a message describing the outcome.
 *
 * @throws {Error} If the email is invalid, or if the guest is already a member.
 *
 * @example
 * const result = await sendOTPService("guest@example.com");
 * if (!result.success) {
 *   console.error(result.message);
 * }
 */
export async function sendOTPService(clientEmail: string) {
  const validationData = await z
    .string()
    .email({ message: "Please enter a valid email" })
    .trim()
    .safeParseAsync(clientEmail);
  if (!validationData.success) throw new Error(validationData.error.message);

  const validatedEmail = validationData.data;

  try {
    await connectToDatabase();

    const isMember = await findUserByEmail(validatedEmail);
    if (isMember) throw new Error("You are already a member, Please login with your email and password.");

    // send new OTP
    const existingOtp = await OTPModel.findOne({ email: validatedEmail });
    if (existingOtp) {
      const lastRequestedAt = existingOtp.updatedAt;

      if (Date.now() - new Date(lastRequestedAt).getTime() < 60000) {
        throw new Error("Please wait a minute before requesting another OTP.");
      }

      const newOtp = generateOTP();
      const storeNewOTP = await OTPModel.findOneAndUpdate(
        { email: validatedEmail },
        { otp: hashPassword(newOtp), otpExpiry: new Date().getTime() + 5 * 60 * 1000 },
        { new: true }
      );
      if (!storeNewOTP) throw new Error("Failed to generate OTP, please try again.");

      const sendingEmail = await sendEmail({
        to: validatedEmail,
        subject: "Renew Access",
        text: `Your OTP code is: ${newOtp}. It expires in 5 minutes`,
        html: sendOTPHTML(validatedEmail, newOtp),
      });
      if (!sendingEmail.success) throw new Error(sendingEmail.message);

      return { success: true, message: "A new OTP has been sent to your email." };
    }

    const [order, reserve] = await Promise.allSettled([
      getFilteredOnlineOrder({ customerEmail: validatedEmail }),
      getFilteredReservations({ customerEmail: validatedEmail }),
    ]);

    if (!order && !reserve) throw new Error("Sorry, you have no order or reservation.");

    const otp = generateOTP();
    const storeOTP = await OTPModel.create({
      email: validatedEmail,
      otp: hashPassword(otp),
      otpExpiry: new Date().getTime() + 5 * 60 * 1000,
    });
    if (!storeOTP) throw new Error("Failed to generate OTP, please try again.");

    const sendingEmail = await sendEmail({
      to: validatedEmail,
      subject: "Renew Access",
      text: `Your OTP code is: ${otp}. It expires in 5 minutes`,
      html: sendOTPHTML(validatedEmail, otp),
    });
    if (!sendingEmail.success) throw new Error(sendingEmail.message);

    return { success: true, message: "Success send otp to your account." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Verify OTP sent to the client's email
 * @param {string} clientEmail - email to verify OTP
 * @param {string} otp - OTP to verify
 * @returns {Promise<{success: boolean, message: string}>} - success object with message string
 * @throws {Error} if OTP is not valid, expired, or invalid
 * @throws {Error} if failed to create session cookie
 * @throws {Error} if failed to delete OTP record
 */
export async function verifyOTPService(clientEmail: string, otp: string) {
  const validationData = await z
    .string()
    .email({ message: "Please enter a valid email" })
    .trim()
    .safeParseAsync(clientEmail);
  if (!validationData.success) throw new Error(validationData.error.message);

  const validatedEmail = validationData.data;

  try {
    const record = await OTPModel.findOne({ email: validatedEmail });
    if (!record) throw new Error("OTP is not valid.");

    if (record.otpExpiry < Date.now()) throw new Error("OTP is expired.");

    if (!comparePassword(otp, record.otp)) throw new Error("OTP is not valid.");

    await createSessionCookie({ email: validatedEmail, role: UserRole.Guest });

    await OTPModel.findOneAndDelete({ email: validatedEmail });

    return { success: true, message: "Welcome back" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

function generateOTP() {
  let digits = "0123456789";
  let OTP = "";
  let len = digits.length;
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * len)];
  }
  return OTP;
}
