import { createUniqueLink, verifyUniqueLink } from "@/lib/guest-unique-link";
import connectToDatabase from "@/lib/mongoose";
import { findUserByEmail, findUserById } from "@/services/auth.service";
import {
  createOnlineOrder,
  getOnlineOrderById,
  getOnlineOrdersByEmail,
  updateOnlineOrderById,
} from "@/services/online-order.service";
import { Product } from "@/types/product.type";
import { OnlineOrderSchema } from "@/validations/online-order.validation";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessId = searchParams.get("accessId");
  const orderId = searchParams.get("orderId");

  if (!accessId)
    return new Response(
      JSON.stringify({
        status: 400,
        statusText: "Access Id is required",
      }),
      { status: 400 }
    );

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
      const order = await getOnlineOrderById(orderId);

      if (!order.success) throw new Error(order.message);

      return new Response(
        JSON.stringify({
          status: 200,
          statusText: "Success",
          data: order.data,
        }),
        { status: 200 }
      );
    }

    const orders = await getOnlineOrdersByEmail(email);
    if (!orders.success) throw new Error(orders.message);

    return new Response(
      JSON.stringify({
        status: 200,
        statusText: "Success",
        data: orders.data,
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
  const accessId = searchParams.get("accessId"); //userId || guestAccessToken
  const orderId = searchParams.get("orderId");
  const action = searchParams.get("action");

  if (!orderId)
    return new Response(
      JSON.stringify({
        status: 400,
        statusText: "Order Id is required",
      }),
      { status: 400 }
    );

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
      // fetch and check this order id was complete the transaction or not
      const updateTransaction = await fetch(
        `${process.env.BASE_URL}/api/transaction?accessId=${
          isMember ? isMember._id : accessId
        }&orderId=${orderId}&action=transaction-complete`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      const resultUpdateTransaction = await updateTransaction.json();
      if (!updateTransaction.ok)
        return new Response(JSON.stringify(resultUpdateTransaction), {
          status: 500,
        });

      const { data: onlineOrder } = await getOnlineOrderById(orderId);
      const updateOnlineOrderPayload = {
        ...onlineOrder._doc,
        orderStatus: "confirmed",
      };
      const updateOnlineOrder = await updateOnlineOrderById(
        orderId,
        updateOnlineOrderPayload
      );

      if (!updateOnlineOrder.success)
        throw new Error(updateOnlineOrder.message);

      return new Response(
        JSON.stringify({ status: 201, statusText: "Success to update order." }),
        { status: 201 }
      );
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({ status: 500, statusText: error.message }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const validationBodyPayload = {
      ...body,
      deliveryDate: new Date(body.deliveryDate),
    };
    const validationBody = await OnlineOrderSchema.safeParseAsync(
      validationBodyPayload
    );

    if (!validationBody.success)
      return new Response(
        JSON.stringify({ status: 400, statusText: validationBody.error }),
        { status: 400 }
      );

    await connectToDatabase();

    const isMember = (await findUserByEmail(validationBody.data.customerEmail))
      .data;

    const orderId = uuidv4();
    const {
      customerName,
      customerEmail,
      customerAddress,
      deliveryDate,
      note,
      items,
    } = validationBody.data;
    const itemsFromDb = await getItemsFromDb(items);
    const subtotal = getSubtotal(itemsFromDb);
    const discount = getDiscount(!!isMember, subtotal);
    const shippingCost = getShippingCost();
    const totalAmount = getTotalAmount(subtotal, shippingCost, discount);

    const transactionPayload = {
      orderId,
      orderType: "online-order",
      grossAmount: totalAmount,
      paymentPurpose: "paid",
      transactionStatus: "pending",
      transactionTime: new Date(),
    };

    const storeTransaction = await fetch(
      `${process.env.BASE_URL}/api/transaction`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionPayload),
      }
    );

    if (!storeTransaction.ok)
      return new Response(
        JSON.stringify({
          status: 500,
          statusText: "Sorry, we can't store your transaction",
        }),
        { status: 500 }
      );

    const { midtransPaymentToken } = await storeTransaction.json();

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

    const onlineOrder = await createOnlineOrder(onlineOrderPayload);
    if (!onlineOrder.success) throw new Error(onlineOrder.message);

    const guestAccessToken = await createUniqueLink({
      email: customerEmail,
    });

    const dataResponse = isMember
      ? { transactionId: midtransPaymentToken }
      : { transactionId: midtransPaymentToken, guestAccessToken };

    return new Response(
      JSON.stringify({
        status: 201,
        statusText: "Success to create online order",
        data: dataResponse,
      }),
      { status: 201 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ status: 500, statusText: error.message }),
      { status: 500 }
    );
  }
}

async function getItemsFromDb(
  itemsFromClient: { productId: string; quantity: number }[]
) {
  try {
    const productsId = [
      ...new Set(itemsFromClient.map((item) => item.productId)),
    ].join("-");

    const res = await fetch(
      `${process.env.BASE_URL}/api/products?productsId=${productsId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = await res.json();

    if (!res.ok) throw new Error(result.statusText);
    const items = result.data.map((item: Product) => {
      const findProduct = itemsFromClient.find(
        (product) => product.productId === item._id
      );
      if (findProduct) {
        return {
          productId: findProduct.productId,
          quantity: findProduct.quantity,
          price: item.price,
        };
      }
    });
    return items;
  } catch (error: any) {
    return error.message;
  }
}

function getSubtotal(
  items: { productId: string; quantity: number; price: number }[]
): number {
  return items.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);
}

function getDiscount(member: boolean, total: number): number {
  const discount = 10; // 10 percent
  return !member ? 0 : (total * discount) / 100;
}

function getShippingCost(): number {
  return 0;
}

function getTotalAmount(
  subtotal: number,
  shippingCost: number,
  discount: number
): number {
  return subtotal + shippingCost - discount;
}
