import OnlineOrderModel from "@/models/online-order.model";

interface Response {
  success: boolean;
  message: string;
  data: any;
}

export async function createOnlineOrder(payload: object): Promise<Response> {
  try {
    const data = await OnlineOrderModel.create(payload);
    if (!data) throw new Error("Failed to create online order");
    return { success: true, message: "Success to create online order", data };
  } catch (error: any) {
    return { success: false, message: error.message, data: null };
  }
}

export async function updateOnlineOrderById(
  orderId: string,
  payload: object
): Promise<Response> {
  try {
    const data = await OnlineOrderModel.findOneAndUpdate(
      { orderId },
      { $set: payload },
      { new: true }
    );
    if (!data) throw new Error("Failed to update online order");
    return { success: true, message: "Success to update online order", data };
  } catch (error: any) {
    return { success: false, message: error.message, data: null };
  }
}

export async function getOnlineOrderById(orderId: string): Promise<Response> {
  try {
    const data = await OnlineOrderModel.findOne({ orderId });
    if (!data) throw new Error("Failed to get order");
    return { success: true, message: "Success to get online order", data };
  } catch (error: any) {
    return { success: false, message: error.message, data: null };
  }
}

export async function getOnlineOrdersByEmail(
  customerEmail: string
): Promise<Response> {
  try {
    const data = await OnlineOrderModel.find({ customerEmail });
    if (!data) throw new Error("Failed to get order");
    return { success: true, message: "Success to get online order", data };
  } catch (error: any) {
    return { success: false, message: error.message, data: null };
  }
}

export async function getOnlineOrderList(orderId: string): Promise<Response> {
  try {
    const data = await OnlineOrderModel.find();
    if (!data) throw new Error("Failed to get online order list");
    return { success: true, message: "Success to get online order list", data };
  } catch (error: any) {
    return { success: false, message: error.message, data: null };
  }
}
