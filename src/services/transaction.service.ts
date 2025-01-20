"use server";

import connectToDatabase from "@/database/mongoose";
import TransactionModel from "@/database/models/transaction.model";
import { TransactionSchema } from "@/validations/transaction.validation";
import { InitializeTransactionPayload, MidtransTransactionDetails } from "@/types/transaction.type";

const serverKey = process.env.MIDTRANS_SERVER_KEY;
if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY is not defined");
const auth = Buffer.from(serverKey + ":").toString("base64");

/**
 * Initialize a new transaction by storing the transaction to the database and
 * storing a new transaction to midtrans and get the midtrans payment token.
 *
 * @param {InitializeTransactionPayload} payload - The payload for initializing a new transaction.
 * @returns {Promise<{ success: boolean; message: string; data: { transaction: Transaction; midtransPaymentToken: string } | null }>} - The result of the initialization.
 *   If success is true, the data is the new transaction and the midtrans payment token, otherwise the data is null.
 */
export async function initializeTransactionService(payload: InitializeTransactionPayload) {
  try {
    const validationBody = await TransactionSchema.safeParseAsync({
      ...payload,
      transactionTime: new Date(payload.transactionTime),
    });

    if (!validationBody.success) return { success: false, message: validationBody.error };

    const { orderId, grossAmount } = validationBody.data;
    const serverKey = process.env.MIDTRANS_SERVER_KEY as string;
    const auth = Buffer.from(serverKey + ":").toString("base64");
    const requestMidtransTransactionPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      credit_card: { secure: true },
    };

    const requestMidtransTransaction = await fetch(process.env.MIDTRANS_REQUEST_TRANSACTION_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + auth,
      },
      body: JSON.stringify(requestMidtransTransactionPayload),
    });
    if (!requestMidtransTransaction.ok) throw new Error(requestMidtransTransaction.statusText);

    const midtransPaymentToken = (await requestMidtransTransaction.json()) as { token: string; redirect_url: string };

    await connectToDatabase();

    const transaction = await TransactionModel.create({ ...validationBody.data, transactionId: midtransPaymentToken.token });
    if (!transaction) return { success: false, message: "Transaction error" };

    return {
      success: true,
      message: "success",
      data: { transaction, midtransPaymentToken: midtransPaymentToken.token },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Settlement a transaction by updating the transaction status to "settlement" in the database
 * and storing the midtrans transaction details to the database.
 *
 * @param {string} orderId - The ID of the transaction to settle.
 * @returns {Promise<{ success: boolean; message: string; data: Transaction | null }>} - The result of the settlement.
 *   If success is true, the data is the updated transaction, otherwise the data is null.
 */
export async function settlementTransactionService(orderId: string) {
  try {
    const url = `https://api.sandbox.midtrans.com/v2/${orderId}/status`;
    const responseMidtransTransactionDetails = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: "Basic " + auth },
    });
    if (!responseMidtransTransactionDetails.ok) throw new Error(responseMidtransTransactionDetails.statusText);

    const midtransTransactionDetails = (await responseMidtransTransactionDetails.json()) as MidtransTransactionDetails;

    if (midtransTransactionDetails.transaction_status !== "settlement") throw new Error("Transaction not valid");

    const updateTransactionPayload = {
      currency: midtransTransactionDetails.currency,
      vaNumbers: midtransTransactionDetails.va_numbers,
      paymentAmounts: midtransTransactionDetails.payment_amounts.map((paymentAmount) => ({
        amount: Number(paymentAmount.amount),
        paidAt: paymentAmount.paid_at,
      })),
      paymentType: midtransTransactionDetails.payment_type,
      transactionStatus: midtransTransactionDetails.transaction_status,
      settlementTime: midtransTransactionDetails.settlement_time,
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

/**
 * Get a list of transactions that match the given filter criteria.
 *
 * @param {object} [filter] - The filter criteria.
 * @param {string[]} [filter.orderIds] - The order IDs to filter by.
 * @param {string} [filter.orderType] - The order type to filter by.
 * @param {string} [filter.paymentPurpose] - The payment purpose to filter by.
 * @param {string} [filter.transactionStatus] - The transaction status to filter by.
 * @param {string} [filter.transactionTime] - The transaction time to filter by in the format of
 *   a timestamp in milliseconds. The date will be adjusted to the start of the day in
 *   the user's timezone and the end of the day in the user's timezone.
 * @returns {Promise<Transaction[]>} - The list of transactions that match the filter criteria.
 */
export async function getFilteredTransaction({
  orderIds,
  orderType,
  paymentPurpose,
  transactionStatus,
  transactionTime,
}: {
  orderIds?: string[];
  orderType?: string;
  paymentPurpose?: string;
  transactionStatus?: string;
  transactionTime?: string;
}) {
  let dateQuery = {};

  if (transactionTime) {
    const providedTimestamp = Number(transactionTime);
    const timezoneOffsetInMs = 7 * 60 * 60 * 1000; // GMT+7 offset in milliseconds

    // Adjust providedTimestamp by adding 1 day (24 hours in milliseconds)
    const adjustedTimestamp = providedTimestamp + 24 * 60 * 60 * 1000;

    const startOfDay = new Date(adjustedTimestamp - timezoneOffsetInMs);
    startOfDay.setUTCHours(0, 0, 0, 0); // Start of day in UTC

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999); // End of day in UTC

    dateQuery = {
      transactionTime: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    };
  }

  return await TransactionModel.find({
    ...(orderIds && { orderId: { $in: orderIds } }),
    ...(orderType && { orderType }),
    ...(paymentPurpose && { paymentPurpose }),
    ...(transactionStatus && { transactionStatus }),
    ...dateQuery,
  });
}

export async function getTransactionByOrderId(orderId: string) {
  return await TransactionModel.findOne({ orderId });
}

export async function getSomeTransactionsByOrderId(orderIds: string[]) {
  return await TransactionModel.find({ orderId: { $in: orderIds } });
}

export async function getTransactionList() {
  return await TransactionModel.find();
}
