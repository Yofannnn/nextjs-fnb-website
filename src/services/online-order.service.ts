import connectToDatabase from "@/database/mongoose";
import OnlineOrderModel from "@/database/models/online-order.model";
import { findUserByEmail } from "@/services/auth.service";
import { createGuestToken } from "@/services/guest-token.service";
import { getProductsSelectionFromDb } from "@/services/product.service";
import { initializeTransactionService, settlementTransactionService } from "@/services/transaction.service";
import { getDiscount, getShippingCost, getSubtotal } from "@/lib/calculation";
import { v4 as uuidv4 } from "uuid";

type Response<T = any> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; data?: undefined };

export async function initializeOnlineOrderService(payload: {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  deliveryDate: Date;
  items: { productId: string; quantity: number }[];
  note?: string;
}): Promise<Response> {
  try {
    await connectToDatabase();

    const isMember = await findUserByEmail(payload.customerEmail);

    const orderId = uuidv4();
    const { customerName, customerEmail, customerAddress, deliveryDate, note, items } = payload;
    const itemsFromDb = await getProductsSelectionFromDb(items);
    const subtotal = getSubtotal(itemsFromDb);
    const discount = getDiscount(!!isMember, subtotal);
    const shippingCost = getShippingCost();
    const totalAmount = subtotal + shippingCost - discount;
    const transactionPayload = {
      orderId,
      orderType: "online-order",
      grossAmount: totalAmount,
      paymentPurpose: "paid",
      transactionStatus: "pending",
      transactionTime: new Date(),
    };

    const newTransaction = await initializeTransactionService(transactionPayload);

    const { midtransPaymentToken } = newTransaction.data;

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

    const guestAccessToken = await createGuestToken({ email: customerEmail });

    const dataResponse = isMember
      ? { transactionId: midtransPaymentToken }
      : { transactionId: midtransPaymentToken, guestAccessToken };

    return { success: true, message: "Success.", data: dataResponse };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function confirmOnlineOrderService(orderId: string): Promise<Response> {
  try {
    const settlementTransaction = await settlementTransactionService(orderId);
    if (!settlementTransaction.success) throw new Error(settlementTransaction.message);

    const updateOnlineOrder = await OnlineOrderModel.findOneAndUpdate(
      { orderId },
      { orderStatus: "confirmed" },
      { new: true }
    );
    if (!updateOnlineOrder) throw new Error("Something went wrong");

    return { success: true, message: "Success.", data: updateOnlineOrder };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getOnlineOrderById(orderId: string) {
  return await OnlineOrderModel.findOne({ orderId });
}

export async function getOnlineOrdersByEmail(customerEmail: string) {
  return await OnlineOrderModel.find({ customerEmail });
}

export async function deleteOnlineOrderById(orderId: string) {
  return await OnlineOrderModel.findOneAndDelete({ orderId });
}

export async function getOnlineOrderList() {
  return await OnlineOrderModel.find();
}
