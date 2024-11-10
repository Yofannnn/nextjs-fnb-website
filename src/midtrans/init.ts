interface Response {
  success: boolean;
  errorMessage?: string;
}

interface GetToken extends Response {
  data?: {
    token: string;
    redirect_url: string;
  };
}

interface MidtransTransactionDetails extends Response {
  data?: {
    status_code: string;
    transaction_id: string;
    gross_amount: string;
    currency: string;
    order_id: string;
    payment_type: string;
    signature_key: string;
    transaction_status: string;
    fraud_status: string;
    status_message: string;
    merchant_id: string;
    va_numbers: {
      bank: string;
      va_number: string;
    }[];
    payment_amounts: {
      amount: string;
      paid_at: string;
    }[];
    transaction_time: string;
    settlement_time: string;
    expiry_time: string;
  };
}

export async function requestMidtransTransaction(
  payload: any
): Promise<GetToken> {
  const url = "https://app.sandbox.midtrans.com/snap/v1/transactions"; // is not production environment
  const serverKey = process.env.MIDTRANS_SERVER_KEY as string;
  const auth = Buffer.from(serverKey + ":").toString("base64");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + auth,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, errorMessage: error.message };
  }
}

export async function getMidtransTransactionDetails(
  orderId: string
): Promise<MidtransTransactionDetails> {
  const url = `https://api.sandbox.midtrans.com/v2/${orderId}/status`; // is not production environment
  const serverKey = process.env.MIDTRANS_SERVER_KEY as string;
  const auth = Buffer.from(serverKey + ":").toString("base64");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + auth,
      },
    });

    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, errorMessage: error.message };
  }
}

export async function handleTransactionComplete(
  accessId: string,
  reservationId: string
) {
  try {
    const res = await fetch(
      `/api/reservation?accessId=${accessId}&reservationId=${reservationId}&action=transaction-complete`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      }
    );
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
