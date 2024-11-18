"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  decrementItemInCart,
  deleteItemInCart,
  incrementItemInCart,
} from "@/redux/slice/cart.slice";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { Product } from "@/types/product.type";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Cart } from "@/types/cart.type";
import { updateProductsCheckout } from "@/redux/slice/products-checkout.slice";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { rupiah } from "@/lib/format-currency";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const localCart = useSelector((state: RootState) => state.cart);
  const productsCheckout = useSelector(
    (state: RootState) => state.productsCheckout
  );
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const uniqueProductIds = [
    ...new Set(localCart.map((item) => item.productId)),
  ].join("-");
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
        setCartItems(result.data);
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

  function adjustProductQuantity(productId: string, increase: boolean) {
    dispatch(
      increase ? incrementItemInCart(productId) : decrementItemInCart(productId)
    );
    if (isSelectedProduct(productId)) {
      const currentProduct = productsCheckout.find(
        (item) => item.productId === productId
      );
      if (!currentProduct) return;
      handleUpdateSelectedProducts(true, {
        ...currentProduct,
        quantity: currentProduct.quantity + (increase ? 1 : -1),
      });
    }
  }

  function removeProduct(productId: string) {
    dispatch(deleteItemInCart(productId));
    if (isSelectedProduct(productId)) {
      const currentProduct = productsCheckout.find(
        (item) => item.productId === productId
      );
      if (!currentProduct) return;
      handleUpdateSelectedProducts(false, currentProduct);
    }
  }

  function handleUpdateSelectedProducts(
    select: boolean | string,
    product: Cart
  ) {
    dispatch(updateProductsCheckout({ remove: !select as boolean, product }));
  }

  function isSelectedProduct(productId: string) {
    return productsCheckout.some((item) => item.productId === productId);
  }

  function getSubtotal(): number {
    return productsCheckout.length === 0
      ? 0
      : productsCheckout
          .map((item) => {
            const findIdx = cartItems.findIndex(
              (products) => products._id === item.productId
            );
            const currentItem = cartItems[findIdx];
            return currentItem.price * item.quantity;
          })
          .reduce((acc, cur) => acc + cur, 0);
  }

  if (!localCart.length) return <h1>Cart is Empty</h1>;
  if (fetchStatus.loading) return <h1>Loading ...</h1>;
  if (!fetchStatus.success) return <h1>Error: {fetchStatus.message}</h1>;

  return (
    <>
      <div className="w-full grid grid-cols-5 mt-6 px-2">
        <div className="col-span-5 md:col-span-3 px-4">
          <div className=" w-full flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Cart</h1>
            <div className="flex items-center gap-2">
              <Label htmlFor="check-all">Checkout All</Label>
              <Checkbox
                id="check-all"
                onCheckedChange={(checked) => {
                  localCart.forEach((product) => {
                    dispatch(
                      updateProductsCheckout({
                        remove: !checked as boolean,
                        product,
                      })
                    );
                  });
                }}
                checked={localCart.length === productsCheckout.length}
              />
            </div>
          </div>
          <div>
            {cartItems.map((product, i) => {
              const quantity = localCart.find(
                (item) => item.productId === product._id
              )?.quantity;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex outline-1 outline-white px-3 py-8 rounded-2xl mb-2 relative",
                    isSelectedProduct(product._id) && "bg-card"
                  )}
                >
                  <span className="w-full h-px absolute left-0 -bottom-1 bg-muted-foreground" />
                  <div className="pr-4">
                    <Checkbox
                      className="size-5"
                      onCheckedChange={(e) =>
                        handleUpdateSelectedProducts(e, {
                          productId: product._id,
                          quantity: quantity || 0,
                        })
                      }
                      checked={isSelectedProduct(product._id)}
                    />
                  </div>
                  <div className="max-w-[min-content]">
                    <Image
                      className="w-full object-cover aspect-square pointer-events-none"
                      src={product.image}
                      width={200}
                      height={200}
                      alt={product.title}
                      priority
                    />
                    <div className="flex items-center border border-foreground rounded-full gap-2 mt-6">
                      <Button
                        className="rounded-full p-4"
                        variant="ghost"
                        onClick={() =>
                          adjustProductQuantity(product._id, false)
                        }
                        disabled={quantity === 1}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <h6>{quantity}</h6>
                      <Button
                        className="rounded-full p-4"
                        variant="ghost"
                        onClick={() => adjustProductQuantity(product._id, true)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-full pl-4">
                    <h2 className="text-xl font-medium">{product.title}</h2>
                    <h6 className="text-base text-muted-foreground">
                      {product.category}
                    </h6>
                    <h6 className="text-base mt-2">
                      {rupiah.format(product.price)}
                    </h6>
                  </div>
                  <div className="relative">
                    <h6 className="absolute top-0 right-0">
                      {rupiah.format(product.price * (quantity || 0))}
                    </h6>
                    <Button
                      className="absolute bottom-0 right-0 rounded-full p-3"
                      variant="ghost"
                      onClick={() => removeProduct(product._id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="hidden md:block md:col-span-2 px-4">
          <h1 className="text-2xl font-semibold mb-8">Summary</h1>
          <div className="leading-8">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{rupiah.format(getSubtotal())}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span>-</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Estimated Delivery & Handling</span>
              <span>-</span>
            </div>
            <Separator className="bg-foreground my-6 h-[0.5px]" />
            <div className="flex items-center justify-between">
              <span>Total</span>
              <span>{rupiah.format(getSubtotal())}</span>
            </div>
            <Separator className="bg-foreground my-6 h-[0.5px]" />
            <Button
              className="w-full rounded-full"
              onClick={() => router.push("/checkout")}
              disabled={productsCheckout.length === 0}
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
