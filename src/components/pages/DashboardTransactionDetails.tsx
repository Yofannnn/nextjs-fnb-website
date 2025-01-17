"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { confirmOnlineOrderAction } from "@/actions/online-order.action";
import { confirmReservationAction } from "@/actions/reservation.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderComponent } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { rupiah } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { Transaction, TransactionOrderType, TransactionStatus, TransactionSuccess } from "@/types/transaction.type";

export default function DashboardTransactionDetails({ orderId }: { orderId: string }) {
  const router = useRouter();
  const queryKey = ["transaction", orderId];
  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/transaction/user/${orderId}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.statusText);
      return result.data;
    },
    staleTime: 60 * 1000 * 5,
  });

  const transaction = data as Transaction;

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
  const countdownTransactionExpired = `${hours}h : ${minutes}m : ${seconds}s`;

  useEffect(() => {
    const handleTimer = () => {
      const now = new Date().getTime();
      const expTransaction = new Date(transaction.transactionTime).getTime() + 24 * 60 * 60 * 1000;
      const distance = expTransaction - now;

      if (distance <= 0) {
        setIsTimeUp(true);
        clearInterval(interval);
      } else {
        setHours(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
        setSeconds(Math.floor((distance % (1000 * 60)) / 1000));
      }
    };

    const interval = setInterval(handleTimer, 1000);

    return () => clearInterval(interval);
  }, [transaction]);

  function handleClickOrderStatus() {
    if (transaction.transactionStatus === TransactionStatus.PENDING) {
      window.snap.pay(transaction.transactionId, {
        onSuccess: async function (result: TransactionSuccess) {
          transaction.orderType === TransactionOrderType.ONLINEORDER
            ? await confirmOnlineOrderAction(result.order_id)
            : await confirmReservationAction(result.order_id);
          router.push(
            `/dashboard/${transaction.orderType === "online-order" ? "online-order" : "reservation"}/${result.order_id}`
          );
        },
        onPending: function (result: any) {
          router.push(`/dashboard/transaction`);
        },
        onError: function (result: any) {
          router.push(`/dashboard/transaction`);
        },
        onClose: function () {
          router.push(`/dashboard/transaction`);
        },
      });
    }

    router.back();
  }

  if (isLoading) return <LoaderComponent />;

  if (error)
    return (
      <div className="w-full h-svh flex justify-center items-center">
        <p className="text-lg text-center">Error: {error.message}</p>
      </div>
    );

  return (
    <div className="w-full h-[85svh] flex justify-center items-center px-4 py-6">
      <Card className="w-[600px]">
        <CardHeader className="relative flex flex-col items-center text-center">
          <CardTitle className="text-xl">
            {transaction.transactionStatus === TransactionStatus.PENDING && "Payment is pending"}
            {transaction.transactionStatus === TransactionStatus.SETTLEMENT && "Payment was successful"}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {transaction.transactionStatus === TransactionStatus.PENDING && isTimeUp
              ? "Transaction was expired. Please create new order again."
              : `Payment has been panding. Transaction will expired in ${countdownTransactionExpired}`}
            {transaction.transactionStatus === TransactionStatus.SETTLEMENT &&
              "Payment has been received successfully. Thank you for your payment."}
          </CardDescription>
          <div className="absolute -bottom-8 bg-foreground text-background rounded-full px-3 py-1 text-xs md:text-sm">
            {rupiah.format(transaction.grossAmount)}
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 text-xs md:text-sm">
          <Separator className="w-full h-px bg-muted-foreground mb-10 mt-4" />
          <div className="w-full flex justify-between items-center">
            <span>Transaction Id</span>
            <span className="max-w-[50%] text-nowrap truncate">{transaction.transactionId}</span>
          </div>
          <div className="w-full flex justify-between items-center">
            <span>Order Type</span>
            <span>{capitalize(transaction.orderType, "-")}</span>
          </div>
          <div className="w-full flex justify-between items-center">
            <span>Payment Type</span>
            <span>{transaction.paymentType ? capitalize(transaction.paymentType, "_") : "-"}</span>
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
            <span>{transaction.settlementTime ? formatDate(transaction.settlementTime as Date, "long") : "-"}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              router.push(
                `/dashboard/${
                  transaction.orderType === TransactionOrderType.ONLINEORDER
                    ? TransactionOrderType.ONLINEORDER
                    : TransactionOrderType.RESERVATION
                }/${transaction.orderId}`
              )
            }
          >
            Details Order
          </Button>
          <Button className="w-full" onClick={handleClickOrderStatus}>
            {transaction.transactionStatus === TransactionStatus.PENDING ? "Pay" : "Back"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
