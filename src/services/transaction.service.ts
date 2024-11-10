import TransactionModel from "@/models/transaction.model";

interface Response {
  success: boolean;
  data: any;
  message: string;
}

export async function createTransaction(payload: object): Promise<Response> {
  try {
    const transaction = await TransactionModel.create(payload);
    return {
      success: true,
      data: transaction,
      message: "Transaction created successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message || "Transaction creation failed",
    };
  }
}

export async function updateTransactionByOrderId(
  orderId: string,
  payload: object
): Promise<Response> {
  try {
    const transaction = await TransactionModel.findOneAndUpdate(
      { orderId },
      { $set: payload },
      { new: true }
    );
    return {
      success: true,
      data: transaction,
      message: "Transaction updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message || "Transaction update failed",
    };
  }
}

export async function getTransactionByOrderId(
  orderId: string
): Promise<Response> {
  try {
    const transaction = await TransactionModel.findOne({ orderId });
    return {
      success: true,
      data: transaction,
      message: "Transaction fetched successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message || "Transaction fetch failed",
    };
  }
}

export async function getSomeTransactionsByOrderId(
  orderIds: string[]
): Promise<Response> {
  try {
    if (orderIds.length === 0)
      throw new Error("No valid transaction Ids provided");

    const transactions = await TransactionModel.find({
      orderId: { $in: orderIds },
    });
    return {
      success: true,
      data: transactions,
      message: "Transactions fetched successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message || "Transaction fetch failed",
    };
  }
}
