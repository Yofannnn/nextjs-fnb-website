"use server";

import connectToDatabase from "@/database/mongoose";
import OnlineOrderModel from "@/database/models/online-order.model";
import { prepareProductSelections } from "@/services/product.service";
import { initializeTransactionService, settlementTransactionService } from "@/services/transaction.service";
import { createSessionCookie } from "@/services/session.service";
import { verifySession } from "@/services/session.service";
import { sendEmail } from "@/services/email.service";
import { v4 as uuidv4 } from "uuid";
import { UserRole } from "@/types/user.type";
import { InitializeOnlineOrderPayload, OnlineOrderStatus } from "@/types/order.type";
import { getDiscount, getShippingCost, getSubtotal } from "@/lib/calculation";
import { confirmOnlineOrderHTML } from "@/lib/email-html";
import { TransactionOrderType, TransactionPaymentPurpose, TransactionStatus } from "@/types/transaction.type";

/**
 * Initialize a new online order by storing the online order to the database and
 * storing a new transaction to the database and get the midtrans payment token.
 * If the user is not a member, set a cookie with the user's email and role.
 *
 * @param {InitializeOnlineOrderPayload} payload - The payload for initializing a new online order.
 * @returns {Promise<{ success: boolean; message: string; data: string | null }>} - The result of the initialization.
 *   If success is true, the data is the midtrans payment token, otherwise the data is null.
 */
export async function initializeOnlineOrderService(payload: InitializeOnlineOrderPayload) {
  try {
    await connectToDatabase();

    const session = await verifySession();
    const isMember = session?.role === UserRole.Member;
    const orderId = uuidv4();
    const { customerName, customerEmail, customerAddress, deliveryDate, note, items } = payload;
    const itemsFromDb = await prepareProductSelections(items);
    const subtotal = getSubtotal(itemsFromDb);
    const discount = getDiscount(!!isMember, subtotal);
    const shippingCost = getShippingCost();
    const totalAmount = subtotal + shippingCost - discount;
    const transactionPayload = {
      orderId,
      orderType: TransactionOrderType.ONLINEORDER,
      grossAmount: totalAmount,
      paymentPurpose: TransactionPaymentPurpose.PAID,
      transactionStatus: TransactionStatus.PENDING,
      transactionTime: new Date(),
    };

    const newTransaction = await initializeTransactionService(transactionPayload);
    if (!newTransaction.success) throw new Error(newTransaction.message);

    const midtransPaymentToken = newTransaction.data?.midtransPaymentToken;

    const onlineOrderPayload = {
      orderId,
      customerName,
      customerEmail,
      customerAddress,
      deliveryDate,
      items: itemsFromDb,
      note,
      subtotal,
      shippingCost,
      discount,
      totalAmount,
      transactionId: midtransPaymentToken,
      orderStatus: "pending",
    };

    const onlineOrder = await OnlineOrderModel.create(onlineOrderPayload);
    if (!onlineOrder) throw new Error("Sorry, we can't create your online order.");

    if (!isMember) await createSessionCookie({ email: customerEmail, role: UserRole.Guest });

    return { success: true, message: "Success.", data: midtransPaymentToken };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Updates the status of an online order in the database and performs related actions.
 *
 * This function updates the status of an online order to one of the specified statuses:
 * - CONFIRMED: Settles the transaction and sends a confirmation email to the customer.
 * - PROCESSING: Updates the status to processing if the current status is confirmed.
 * - SHIPPING: Updates the status to shipping if the current status is processing.
 * - DELIVERED: Updates the status to delivered if the current status is shipping.
 *
 * @param {string} orderId - The ID of the online order to update.
 * @param {OnlineOrderStatus} action - The new status to apply to the order.
 * @returns {Promise<{ success: boolean; message: string }>} - An object indicating the success
 *   of the operation and a message with additional information.
 *
 * @throws Will throw an error if the order cannot be found, if the status transition is invalid,
 *   or if the action is not supported.
 */
export async function updateOnlineOrderStatusService(orderId: string, action: OnlineOrderStatus) {
  try {
    await connectToDatabase();

    // confirm online order -- after user transaction
    if (action === OnlineOrderStatus.CONFIRMED) {
      const settlementTransaction = await settlementTransactionService(orderId);
      if (!settlementTransaction.success) throw new Error(settlementTransaction.message);

      const updateOnlineOrder = await updateOnlineOrderStatusByOrderId(orderId, action);
      if (!updateOnlineOrder) throw new Error("Something went wrong");

      const sendingEmail = await sendEmail({
        to: updateOnlineOrder.customerEmail,
        subject: "Online Order Confirmation",
        text: "Your order has been confirmed.",
        html: confirmOnlineOrderHTML(updateOnlineOrder),
      });

      return { success: true, message: "Success." };
    }

    const order = await getOnlineOrderById(orderId);
    if (!order) throw new Error("Sorry, we can't find your online order.");

    const orderStatus = order.orderStatus as OnlineOrderStatus;

    // process online order
    if (action === OnlineOrderStatus.PROCESSING) {
      if (orderStatus !== OnlineOrderStatus.CONFIRMED) throw new Error("Sorry, we can't update the online order status.");
      const updateOnlineOrder = await updateOnlineOrderStatusByOrderId(orderId, action);
      if (!updateOnlineOrder) throw new Error("Something went wrong");
      return { success: true, message: "Success." };
    }

    // shipping online order
    if (action === OnlineOrderStatus.SHIPPING) {
      if (orderStatus !== OnlineOrderStatus.PROCESSING) throw new Error("Sorry, we can't update the online order status.");
      const updateOnlineOrder = await updateOnlineOrderStatusByOrderId(orderId, action);
      if (!updateOnlineOrder) throw new Error("Something went wrong");
      return { success: true, message: "Success." };
    }

    // deliver online order
    if (action === OnlineOrderStatus.DELIVERED) {
      if (orderStatus !== OnlineOrderStatus.SHIPPING) throw new Error("Sorry, we can't update the online order status.");
      const updateOnlineOrder = await OnlineOrderModel.findOneAndUpdate(
        { orderId },
        { orderStatus: action, deliveredAt: new Date().toISOString() },
        { new: true }
      );
      if (!updateOnlineOrder) throw new Error("Something went wrong");
      return { success: true, message: "Success." };
    }

    throw new Error("Action is not supported.");
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

async function updateOnlineOrderStatusByOrderId(orderId: string, orderStatus: OnlineOrderStatus) {
  return await OnlineOrderModel.findOneAndUpdate({ orderId }, { orderStatus }, { new: true });
}

/**
 * Get a list of online orders that match the given filter criteria.
 *
 * @param {object} [filter] - The filter criteria.
 * @param {string} [filter.customerEmail] - The customer email to filter by.
 * @param {string} [filter.deliveryDate] - The delivery date to filter by in the format of
 *   a timestamp in milliseconds. The date will be adjusted to the start of the day in
 *   the user's timezone and the end of the day in the user's timezone.
 * @param {string} [filter.orderStatus] - The order status to filter by.
 * @returns {Promise<OnlineOrder[]>} - The list of online orders that match the filter criteria.
 */
export async function getFilteredOnlineOrder({
  customerEmail,
  deliveryDate,
  orderStatus,
}: {
  customerEmail?: string;
  deliveryDate?: string;
  orderStatus?: string;
}) {
  let dateQuery = {};

  // Check if deliveryDate is provided and compute start and end of the day
  if (deliveryDate) {
    const providedTimestamp = Number(deliveryDate); // Timestamp from the frontend
    const timezoneOffsetInMs = 7 * 60 * 60 * 1000; // GMT+7 offset in milliseconds

    // Adjust providedTimestamp by adding 1 day (24 hours in milliseconds)
    const adjustedTimestamp = providedTimestamp + 24 * 60 * 60 * 1000;

    // Compute start and end of the day in UTC
    const startOfDay = new Date(adjustedTimestamp - timezoneOffsetInMs);
    startOfDay.setUTCHours(0, 0, 0, 0); // Start of day in UTC

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999); // End of day in UTC

    dateQuery = {
      deliveryDate: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    };
  }

  return await OnlineOrderModel.find({
    ...(customerEmail && { customerEmail }),
    ...(orderStatus && { orderStatus }),
    ...dateQuery,
  });
}

export async function getOnlineOrderById(orderId: string) {
  return await OnlineOrderModel.findOne({ orderId });
}

export async function deleteOnlineOrderById(orderId: string) {
  return await OnlineOrderModel.findOneAndDelete({ orderId });
}

export async function getOnlineOrderList() {
  return await OnlineOrderModel.find();
}
