import { model, models, Schema } from "mongoose";
import { OnlineOrderStatus } from "@/types/order.type";

const OnlineOrderSchema = new Schema(
  {
    orderId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerAddress: { type: String, required: true },
    deliveryDate: { type: Date, required: true },
    items: {
      type: [
        {
          productId: { type: String, required: true },
          quantity: { type: Number, required: true },
          price: { type: Number, required: true },
        },
      ],
      required: true,
    },
    note: { type: String, required: false },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    discount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    orderStatus: {
      type: String,
      enum: OnlineOrderStatus,
      required: true,
      default: OnlineOrderStatus.PENDING,
    },
    reasonCancellation: { type: String, required: false },
    deliveredAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

const OnlineOrderModel = models.OnlineOrder || model("OnlineOrder", OnlineOrderSchema);

export default OnlineOrderModel;
