"use client";

import { Transaction, TransactionSuccess } from "@/types/transaction.type";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { rupiah } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { handleTransactionComplete } from "@/midtrans/init";
import { useEffect, useState } from "react";

export default function MemberTransactionDetailsPage({
  userId,
  transaction,
}: {
  userId: string;
  transaction: Transaction;
}) {
  const router = useRouter();
  const handleClickOrderStatus = () => {
    if (transaction.transactionStatus === "pending") {
      window.snap.pay(transaction.transactionId, {
        onSuccess: async function (result: TransactionSuccess) {
          await handleTransactionComplete(
            userId,
            result.order_id,
            transaction.orderType
          );
          router.push(
            `/dashboard/${
              transaction.orderType === "online-order"
                ? "online-order"
                : "reservation"
            }/${result.order_id}`
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
        onClose: function () {
          router.push(`/dashboard/transaction`);
        },
      });
    }
    if (transaction.transactionStatus === "settlement") {
      router.back();
    }
  };

  const capitalize = (string: string, separator: "-" | "_"): string => {
    return string
      .split(separator)
      .map((word) =>
        word
          .split("")
          .map((letter, i) => (i === 0 ? letter.toUpperCase() : letter))
          .join("")
      )
      .join(" ");
  };

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    const handleTimer = () => {
      const now = new Date().getTime();
      const expTransaction =
        new Date(transaction.transactionTime).getTime() + 24 * 60 * 60 * 1000;
      const distance = expTransaction - now;

      if (distance <= 0) {
        setIsTimeUp(true);
        clearInterval(interval);
      } else {
        setHours(
          Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        );
        setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
        setSeconds(Math.floor((distance % (1000 * 60)) / 1000));
      }
    };

    const interval = setInterval(handleTimer, 1000);

    return () => clearInterval(interval);
  }, [transaction.transactionTime]);

  const countdownTransactionExpired = isTimeUp
    ? "Expired"
    : `${hours}h : ${minutes}m : ${seconds}s`;

  return (
    // this when payment success and settlement
    <div className="w-full h-[85svh] flex justify-center items-center px-4 py-6">
      <Card className="w-[600px]">
        <CardHeader className="relative flex flex-col items-center text-center">
          <CardTitle className="text-xl">
            {transaction.transactionStatus === "settlement"
              ? "Payment was successful"
              : `Payment is pending`}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {transaction.transactionStatus === "settlement"
              ? "Payment has been received successfully. Thank you for your payment."
              : `Payment has been panding. ${
                  !isTimeUp &&
                  `Transaction will expired in ` + countdownTransactionExpired
                }`}
          </CardDescription>
          <div className="absolute -bottom-8 bg-foreground text-background rounded-full px-3 py-1 text-xs md:text-sm">
            {rupiah.format(transaction.grossAmount)}
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 text-xs md:text-sm">
          <Separator className="w-full h-px bg-muted-foreground mb-10 mt-4" />
          <div className="w-full flex justify-between items-center">
            <span>Transaction Id</span>
            <span className="max-w-[50%] text-nowrap truncate">
              {transaction.transactionId}
            </span>
          </div>
          <div className="w-full flex justify-between items-center">
            <span>Order Type</span>
            <span>{capitalize(transaction.orderType, "-")}</span>
          </div>
          <div className="w-full flex justify-between items-center">
            <span>Payment Type</span>
            <span>
              {transaction.paymentType
                ? capitalize(transaction.paymentType, "_")
                : "-"}
            </span>
          </div>
          <div className="w-full flex justify-between items-center">
            <span>Total</span>
            <span>{rupiah.format(transaction.grossAmount)}</span>
          </div>
          <div className="w-full flex justify-between items-center">
            <span>Transaction Time</span>
            <span>{formatDate(transaction.transactionTime, "long")}</span>
          </div>
          <div className="w-full flex justify-between items-center">
            <span>Transaction Success</span>
            <span>
              {formatDate(transaction.settlementTime as Date, "long")}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              router.push(
                `/dashboard/${
                  transaction.orderType === "online-order"
                    ? "online-order"
                    : "reservation"
                }/${transaction.orderId}`
              )
            }
          >
            Details Order
          </Button>
          <Button className="w-full" onClick={handleClickOrderStatus}>
            {transaction.transactionStatus === "settlement" ? "Back" : "Pay"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
