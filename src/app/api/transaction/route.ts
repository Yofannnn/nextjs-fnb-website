import connectToDatabase from "@/lib/mongoose";
import { verifyUniqueLink } from "@/lib/guest-unique-link";
import {
  createTransaction,
  getSomeTransactionsByOrderId,
  getTransactionByOrderId,
  updateTransactionByOrderId,
} from "@/services/transaction.service";
import { TransactionSchema } from "@/validations/transaction.validation";
import {
  getReservationByEmail,
  getReservationById,
} from "@/services/reservation.service";
import { Reservation } from "@/types/order.type";
import {
  getMidtransTransactionDetails,
  requestMidtransTransaction,
} from "@/midtrans/init";
import { findUserById } from "@/services/auth.service";
import {
  getOnlineOrderById,
  getOnlineOrdersByEmail,
} from "@/services/online-order.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessId = searchParams.get("accessId"); // user === userId, guest === guestAccessToken
  const orderId = searchParams.get("orderId");

  try {
    await connectToDatabase();

    const guestEmail = (await verifyUniqueLink(accessId)).email;
    const isMember = (await findUserById(accessId as string)).data;
    const email = guestEmail || isMember.email;

    if (!email)
      return new Response(
        JSON.stringify({
          status: 400,
          statusText: "Sorry, your access id is invalid",
        }),
        { status: 400 }
      );

    if (orderId) {
      const reservationMemberEmail = (await getReservationById(orderId)).data;
      const onlineOrderMemberEmail = (await getOnlineOrderById(orderId)).data;

      const customerEmail = reservationMemberEmail || onlineOrderMemberEmail;

      if (customerEmail.customerEmail !== email)
        return new Response(
          JSON.stringify({
            status: 403,
            statusText: "You are not allowed to access this transaction",
          }),
          { status: 403 }
        );

      const transaction = await getTransactionByOrderId(orderId);

      if (!transaction.data)
        return new Response(
          JSON.stringify({
            status: 404,
            statusText: "Invalid ID",
          }),
          { status: 404 }
        );

      return new Response(
        JSON.stringify({
          status: 200,
          statusText: "Transaction fetched successfully",
          data: transaction.data,
        }),
        { status: 200 }
      );
    }

    const reservationsData = await getReservationByEmail(email);
    const onlineOrdersData = await getOnlineOrdersByEmail(email);
    const uniqueOrderIds = reservationsData.data
      .map((reservation: Reservation) => reservation.reservationId)
      .concat(onlineOrdersData.data.map((order: any) => order.orderId));

    const transactions = await getSomeTransactionsByOrderId(uniqueOrderIds);

    if (!transactions.success) throw new Error(transactions.message);

    if (!transactions.data)
      return new Response(
        JSON.stringify({
          status: 404,
          statusText: "Transactions not found",
        }),
        { status: 404 }
      );

    return new Response(
      JSON.stringify({
        status: 200,
        statusText: "Transactions fetched successfully",
        data: transactions.data,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        status: 500,
        statusText: error.message,
      }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const validationPayload = {
      ...body,
      transactionTime: new Date(body.transactionTime),
    };
    const validationBody = await TransactionSchema.safeParseAsync(
      validationPayload
    );

    if (!validationBody.success)
      return new Response(
        JSON.stringify({
          status: 400,
          statusText: "Sorry, your data is invalid",
        }),
        { status: 400 }
      );

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
    const midtransPaymentToken = await requestMidtransTransaction(
      requestMidtransTransactionPayload
    );
    if (!midtransPaymentToken.success)
      return new Response(
        JSON.stringify({
          status: 400,
          statusText: midtransPaymentToken.errorMessage,
        }),
        { status: 400 }
      );

    // store transaction in database
    const transaction = await createTransaction({
      ...validationBody.data,
      transactionId: midtransPaymentToken.data?.token,
    });
    if (!transaction.success)
      return new Response(
        JSON.stringify({
          status: 400,
          statusText: transaction.message,
        }),
        { status: 400 }
      );

    return new Response(
      JSON.stringify({
        status: 200,
        statusText: "Success",
        data: transaction.data,
        midtransPaymentToken: midtransPaymentToken.data?.token,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ status: 500, statusText: error.message }),
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessId = searchParams.get("accessId"); // user === userId, guest === guestAccessToken
  const orderId = searchParams.get("orderId");
  const action = searchParams.get("action");

  try {
    await connectToDatabase();

    const guestEmail = (await verifyUniqueLink(accessId)).email;
    const isMember = (await findUserById(accessId as string)).data;
    const correctEmail = guestEmail || isMember.email;

    if (!correctEmail)
      return new Response(
        JSON.stringify({
          status: 400,
          statusText: "Sorry, your access id is invalid",
        }),
        { status: 400 }
      );

    if (action === "transaction-complete") {
      // check valid member or guest request

      // check transaction status in midtrans is seattlement or not
      const midtransTransactionDetails = await getMidtransTransactionDetails(
        orderId as string
      );

      if (midtransTransactionDetails.data?.transaction_status !== "settlement")
        return new Response(
          JSON.stringify({ status: 400, statusText: "Transaction not valid" }),
          { status: 400 }
        );

      const { success, message, data } = await getTransactionByOrderId(
        orderId as string
      );

      const updateTransactionPayload = {
        ...data._doc,
        currency: midtransTransactionDetails.data?.currency,
        vaNumbers: midtransTransactionDetails.data?.va_numbers,
        paymentAmounts: midtransTransactionDetails.data?.payment_amounts.map(
          (paymentAmount) => ({
            amount: Number(paymentAmount.amount),
            paidAt: paymentAmount.paid_at,
          })
        ),
        paymentType: midtransTransactionDetails.data?.payment_type,
        transactionStatus: midtransTransactionDetails.data?.transaction_status,
        settlementTime: midtransTransactionDetails.data?.settlement_time,
      };

      const updateTransaction = await updateTransactionByOrderId(
        orderId as string,
        updateTransactionPayload
      );

      if (!updateTransaction.success)
        throw new Error(updateTransaction.message);

      return new Response(
        JSON.stringify({
          status: 200,
          statusText: "Transaction completed successfully",
        }),
        { status: 200 }
      );
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({ status: 500, statusText: error.message }),
      { status: 500 }
    );
  }
}
