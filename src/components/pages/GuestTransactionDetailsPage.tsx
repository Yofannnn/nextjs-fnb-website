"use client";

import { Transaction, TransactionSuccess } from "@/types/transaction.type";
import { useRouter } from "next/navigation";
import Script from "next/script";

export default function GuestTransactionDetailsPage({
  guestAccessToken,
  transaction,
}: {
  guestAccessToken: string;
  transaction: Transaction;
}) {
  const router = useRouter();

  const handleClick = () => {
    window.snap.pay(transaction.transactionId, {
      onSuccess: async function (result: TransactionSuccess) {
        await handleTransactionComplete(guestAccessToken, result.order_id);
        router.push(
          `/guest/reservation/${guestAccessToken}/${result.order_id}`
        );
      },
      onPending: function (result: any) {
        console.log(result);
      },
      onError: function (result: any) {
        alert("payment failed!");
        console.log(result);
        // display error message with toast and add button in toast to refrest page
      },
      onClose: function () {},
    });
  };

  return (
    <>
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL as string}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY as string}
        strategy="lazyOnload"
      />
      <div onClick={handleClick}>{transaction.transactionId}</div>
    </>
  );
}

async function handleTransactionComplete(
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
