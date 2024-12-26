"use server";

import connectToDatabase from "@/database/mongoose";
import TransactionModel from "@/database/models/transaction.model";
import { getMidtransTransactionDetails, requestMidtransTransaction } from "@/midtrans/init";
import { TransactionSchema } from "@/validations/transaction.validation";

type Response<T = any> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; data?: undefined };

export async function initializeTransactionService(payload: any): Promise<Response> {
  try {
    const validationBody = await TransactionSchema.safeParseAsync({
      ...payload,
      transactionTime: new Date(payload.transactionTime),
    });

    if (!validationBody.success) return { success: false, message: "Sorry, your data is invalid" };

    const { orderId, grossAmount } = validationBody.data;

    await connectToDatabase();

    const requestMidtransTransactionPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      credit_card: { secure: true },
    };

    // get midtrans payment token
    const midtransPaymentToken = await requestMidtransTransaction(requestMidtransTransactionPayload);
    if (!midtransPaymentToken.success)
      return {
        success: false,
        message: midtransPaymentToken.errorMessage || "Midtrans payment token error",
      };

    // store transaction in database
    const transaction = await TransactionModel.create({
      ...validationBody.data,
      transactionId: midtransPaymentToken.data?.token,
    });
    if (!transaction) return { success: false, message: "Transaction error" };

    return {
      success: true,
      message: "success",
      data: { transaction, midtransPaymentToken: midtransPaymentToken.data?.token },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function settlementTransactionService(orderId: string): Promise<Response> {
  try {
    const midtransTransactionDetails = await getMidtransTransactionDetails(orderId);

    if (midtransTransactionDetails.data?.transaction_status !== "settlement") throw new Error("Transaction not valid");

    const updateTransactionPayload = {
      currency: midtransTransactionDetails.data?.currency,
      vaNumbers: midtransTransactionDetails.data?.va_numbers,
      paymentAmounts: midtransTransactionDetails.data?.payment_amounts.map((paymentAmount) => ({
        amount: Number(paymentAmount.amount),
        paidAt: paymentAmount.paid_at,
      })),
      paymentType: midtransTransactionDetails.data?.payment_type,
      transactionStatus: midtransTransactionDetails.data?.transaction_status,
      settlementTime: midtransTransactionDetails.data?.settlement_time,
    };

    const updateTransaction = await TransactionModel.findOneAndUpdate({ orderId }, updateTransactionPayload, {
      new: true,
    });

    if (!updateTransaction) throw new Error(updateTransaction);

    return { success: true, message: "success", data: updateTransaction };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getTransactionByOrderId(orderId: string) {
  return await TransactionModel.findOne({ orderId });
}

export async function getSomeTransactionsByOrderId(orderIds: string[]) {
  return await TransactionModel.find({ orderId: { $in: orderIds } });
}
