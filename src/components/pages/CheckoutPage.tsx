"use client";

import { Button } from "@/components/ui/button";
import { RootState } from "@/redux/store";
import { Product } from "@/types/product.type";
import { User } from "@/types/user.type";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TransactionSuccess } from "@/types/transaction.type";
import { Textarea } from "@/components/ui/textarea";
import { handleTransactionComplete } from "@/midtrans/init";
import Image from "next/image";
import { rupiah } from "@/lib/format-currency";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage({
  isAuth,
  user,
}: {
  isAuth: boolean;
  user: Omit<User, "password"> | undefined;
}) {
  const router = useRouter();
  const localProductsCheckout = useSelector(
    (state: RootState) => state.productsCheckout
  );
  const uniqueProductIds = [
    ...new Set(localProductsCheckout.map((item) => item.productId)),
  ].join("-");

  const [productsCheckout, setProductsCheckout] = useState<Product[]>([]);
  const [fetchStatus, setFetchStatus] = useState({
    loading: true,
    success: false,
    message: "",
  });

  useEffect(() => {
    if (!uniqueProductIds) return;

    async function fetchCart() {
      try {
        const res = await fetch(
          `/api/products?productsId=${uniqueProductIds}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const result = await res.json();
        if (!res.ok) throw new Error(result.statusText);
        setProductsCheckout(result.data);
        setFetchStatus({ success: true, loading: false, message: "" });
      } catch (error: any) {
        setFetchStatus({
          loading: false,
          success: true,
          message: error.message,
        });
      }
    }

    fetchCart();
  }, [uniqueProductIds]);

  function getSubtotal(): number {
    return productsCheckout.length === 0
      ? 0
      : localProductsCheckout
          .map((item) => {
            const findIdx = productsCheckout.findIndex(
              (products) => products._id === item.productId
            );
            const currentItem = productsCheckout[findIdx];
            return currentItem.price * item.quantity;
          })
          .reduce((acc, cur) => acc + cur, 0);
  }

  function getDiscount(): number {
    const discount = 10; // 10 percent
    return !isAuth ? 0 : (getSubtotal() * discount) / 100;
  }

  async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const body = {
      customerName: isAuth ? user?.name : form.get("customerName"),
      customerEmail: isAuth ? user?.email : form.get("customerEmail"),
      customerAddress: isAuth ? user?.address : form.get("customerAddress"),
      deliveryDate: form.get("deliveryDate"),
      items: localProductsCheckout,
      note: form.get("note") || undefined,
    };

    try {
      const response = await fetch(`/api/online-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.statusText);
      const { transactionId, guestAccessToken } = result.data;

      window.snap.pay(transactionId, {
        onSuccess: async function (result: TransactionSuccess) {
          await handleTransactionComplete(
            user?._id || guestAccessToken,
            result.order_id,
            "online-order"
          );
          router.push(
            isAuth
              ? `/dashboard/online-order/${result.order_id}`
              : `/guest/online-order/${guestAccessToken}/${result.order_id}`
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
          router.push(
            isAuth
              ? `/dashboard/transaction`
              : `/guest/transaction/${guestAccessToken}`
          );
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL as string}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY as string}
        strategy="lazyOnload"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-8">
        <div className="col-span-1 px-2">
          <div className="w-full flex justify-between items-center">
            <h2 className="text-2xl font-semibold mb-4">Billing Information</h2>
            {!isAuth && (
              <Link
                href="/register?redirect=checkout"
                className="underline underline-offset-2"
              >
                Become a member?
              </Link>
            )}
          </div>
          <div>
            <form onSubmit={handleCheckout}>
              <div className="grid gap-4">
                {!isAuth && (
                  <>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="email">email</Label>
                        <Link
                          href="/login"
                          className="ml-auto inline-block text-sm underline"
                        >
                          Already have account?
                        </Link>
                      </div>
                      <Input
                        id="email"
                        type="email"
                        name="customerEmail"
                        placeholder="example@gmail.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">name</Label>
                      <Input
                        id="name"
                        type="text"
                        name="customerName"
                        placeholder="max verstappen"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">address</Label>
                      <Input
                        id="address"
                        type="text"
                        name="customerAddress"
                        placeholder="Enter your current address"
                        required
                      />
                    </div>
                  </>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="deliveryDate">Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    name="deliveryDate"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    name="note"
                    placeholder="Type your message here."
                    className="min-h-[120px]"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full mt-8">
                Checkout now
              </Button>
            </form>
          </div>
        </div>
        <div className="col-span-1 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
          <div className="px-3">
            <div>
              {productsCheckout.map((product, i) => {
                const quantity =
                  localProductsCheckout.find(
                    (item) => item.productId === product._id
                  )?.quantity || 0;
                return (
                  <div key={i} className="flex gap-4 py-2">
                    <div>
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={100}
                        height={100}
                        className="w-full object-cover aspect-square pointer-events-none"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-xl">{product.title}</h4>
                      <h6 className="text-muted-foreground text-sm">
                        {product.category}
                      </h6>
                      <div className="flex gap-8 text-base mt-1">
                        <span>Qty: {quantity}</span>
                        <span>{rupiah.format(product.price * quantity)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Separator className="w-full bg-muted-foreground my-4" />
            <div className="grid gap-1">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Subtotal</span>
                <span>{rupiah.format(getSubtotal())}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Discount</span>
                <span>- {rupiah.format(getDiscount())}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Delivery/Shipping</span>
                <span>+ {rupiah.format(0)}</span>
              </div>
              <div className="flex justify-between items-center font-medium">
                <span>Total</span>
                <span>{rupiah.format(getSubtotal() - getDiscount()) + 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
