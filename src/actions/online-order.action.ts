import { confirmOnlineOrderService, initializeOnlineOrderService } from "@/services/online-order.service";
import { InitializeOnlineOrderPayload } from "@/types/order.type";
import { OnlineOrderSchema } from "@/validations/online-order.validation";

export async function checkoutAction(payload: InitializeOnlineOrderPayload) {
  try {
    const validationBody = await OnlineOrderSchema.safeParseAsync(payload);

    if (!validationBody.success) throw new Error(validationBody.error.message);

    const newOnlineOrder = await initializeOnlineOrderService(validationBody.data);
    if (!newOnlineOrder.success) throw new Error(newOnlineOrder.message);

    return newOnlineOrder;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function confirmOnlineOrderAction(orderId: string) {
  try {
    const confirmOnlineOrder = await confirmOnlineOrderService(orderId);
    if (!confirmOnlineOrder.success) throw new Error(confirmOnlineOrder.message);

    return confirmOnlineOrder;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
