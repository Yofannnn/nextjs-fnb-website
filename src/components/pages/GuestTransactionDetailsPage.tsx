"use client";

import { handleTransactionComplete } from "@/midtrans/init";
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
        await handleTransactionComplete(
          guestAccessToken,
          result.order_id,
          transaction.orderType === "reservation"
            ? "reservation"
            : "online-order"
        );
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
      <div onClick={handleClick}>{transaction.transactionId}</div>
    </>
  );
}
