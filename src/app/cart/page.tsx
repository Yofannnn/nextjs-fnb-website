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
import {
  saveCheckoutData,
  updateProductsCheckout,
} from "@/redux/slice/checkout.slice";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { rupiah } from "@/lib/format-currency";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function CartPage() {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const localCart = useSelector((state: RootState) => state.cart);
  const localCheckoutData = useSelector(
    (state: RootState) => state.clientCheckoutData
  );
  const { productsCheckout } = localCheckoutData;
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const uniqueProductIds = [
    ...new Set(localCart.map((item) => item.productId)),
  ].join("-");
  const [fetchStatus, setFetchStatus] = useState({
    loading: true,
    success: false,
    message: "",
  });

  const cartItemsMap = new Map(
    cartItems.map((product) => [product._id, product])
  );
  const renderedCartItems = localCart
    .map((item: { productId: string; quantity: number }) => {
      const product = cartItemsMap.get(item.productId);
      return product ? { ...product, quantity: item.quantity } : null;
    })
    .filter((item) => item !== null);

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

  function adjustProductQuantity(
    newProduct: { quantity: number } & Product,
    increase: boolean
  ) {
    dispatch(
      increase
        ? incrementItemInCart(newProduct._id)
        : decrementItemInCart(newProduct._id)
    );
    if (isSelectedProduct(newProduct._id)) {
      const currentProduct = productsCheckout.find(
        (item) => item._id === newProduct._id
      );
      if (!currentProduct) return;
      handleUpdateSelectedProducts({
        select: true,
        increase,
        product: currentProduct,
      });
    }
  }

  function removeProduct(productId: string) {
    dispatch(deleteItemInCart(productId));
    if (isSelectedProduct(productId)) {
      const currentProduct = productsCheckout.find(
        (item) => item._id === productId
      );
      if (!currentProduct) return;
      handleUpdateSelectedProducts({
        select: false,
        increase: false,
        product: currentProduct,
      });
    }
  }

  function handleUpdateSelectedProducts({
    select,
    increase,
    product,
  }: {
    select: boolean | string;
    increase: boolean;
    product: { quantity: number } & Product;
  }) {
    const updatedProductCheckout = updateProductsCheckout({
      remove: !select,
      increase,
      newProduct: product,
    });

    dispatch(
      saveCheckoutData({
        ...localCheckoutData,
        productsCheckout: updatedProductCheckout,
      })
    );
  }

  function isSelectedProduct(productId: string) {
    return productsCheckout.some((item) => item._id === productId);
  }

  function getSubtotal(): number {
    if (productsCheckout.length <= 0) return 0;
    return productsCheckout
      .map((item) => item.price * item.quantity)
      .reduce((acc, cur) => acc + cur, 0);
  }

  if (!localCart.length) return <h1>Cart is Empty</h1>;
  if (fetchStatus.loading) return <h1>Loading ...</h1>;
  if (!fetchStatus.success) return <h1>Error: {fetchStatus.message}</h1>;

  return (
    <div className="w-full pt-20">
      <div className="w-full grid grid-cols-5 px-2">
        <div className="col-span-5 md:col-span-3 px-1 md:px-4 mb-20 md:mb-4">
          <div className=" w-full flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Cart</h1>
            <div className="flex items-center gap-2">
              <Label htmlFor="check-all">Checkout All</Label>
              <Checkbox
                id="check-all"
                onCheckedChange={(checked) => {
                  renderedCartItems.forEach((product) => {
                    handleUpdateSelectedProducts({
                      select: checked,
                      increase: checked as boolean,
                      product,
                    });
                  });
                }}
                checked={localCart.length === productsCheckout.length}
              />
            </div>
          </div>
          <div>
            {renderedCartItems.length > 0 &&
              renderedCartItems?.map((product, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex outline-1 outline-white px-3 py-8 rounded-2xl mb-2 relative",
                    isSelectedProduct(product._id) && "bg-card"
                  )}
                >
                  <span className="w-full h-px absolute left-0 -bottom-1 bg-muted-foreground" />
                  <div className="pr-2 md:pr-4">
                    <Checkbox
                      className="size-4 md:size-5"
                      onCheckedChange={(e) =>
                        handleUpdateSelectedProducts({
                          select: e,
                          increase: true,
                          product,
                        })
                      }
                      checked={isSelectedProduct(product._id)}
                    />
                  </div>
                  <div className="max-w-[min-content]">
                    <Image
                      className="w-full object-cover aspect-square pointer-events-none"
                      src={product.image}
                      width={100}
                      height={100}
                      alt={product.title}
                      priority
                    />
                    <div className="flex items-center border border-foreground rounded-full gap-2 mt-4 md:mt-6">
                      <Button
                        className="rounded-full p-2 md:p-4"
                        variant="ghost"
                        onClick={() => adjustProductQuantity(product, false)}
                        disabled={product.quantity === 1}
                      >
                        <Minus className="size-3 md:size-4" />
                      </Button>
                      <h6 className="text-sm md:text-base">
                        {product.quantity}
                      </h6>
                      <Button
                        className="rounded-full p-2 md:p-4"
                        variant="ghost"
                        onClick={() => adjustProductQuantity(product, true)}
                      >
                        <Plus className="size-3 md:size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-full pl-4  text-nowrap truncate">
                    <h2 className="text-base md:text-xl font-medium">
                      {product.title}
                    </h2>
                    <h6 className="text-sm md:text-base text-muted-foreground">
                      {product.category}
                    </h6>
                    <h6 className="text-sm md:text-base mt-2">
                      {rupiah.format(product.price)}
                    </h6>
                  </div>
                  <div className="relative">
                    <h6 className="text-sm md:text-base absolute top-0 right-0">
                      {rupiah.format(product.price * (product.quantity || 0))}
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
              ))}
          </div>
        </div>
        <div className="hidden md:block md:col-span-2 px-4">
          <div className="sticky top-20">
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
        <DrawerTotalAmount
          subtotal={getSubtotal()}
          total={getSubtotal()}
          isDisableCheckout={productsCheckout.length === 0}
        />
      </div>
    </div>
  );
}

const DrawerTotalAmount = ({
  subtotal,
  total,
  isDisableCheckout,
}: {
  subtotal: number;
  total: number;
  isDisableCheckout: boolean;
}) => {
  const router = useRouter();

  return (
    <Drawer>
      <div className="col-span-full md:hidden px-2 py-4 bg-background fixed bottom-0 left-0 right-0">
        <DrawerTrigger asChild>
          <Button className="w-full">Summary</Button>
        </DrawerTrigger>
      </div>
      <DrawerContent>
        <DrawerHeader className="mb-4">
          <DrawerTitle className="text-2xl font-semibold">Summary</DrawerTitle>
          <DrawerDescription>Summary of your order</DrawerDescription>
        </DrawerHeader>
        <div className="leading-8 px-4">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{rupiah.format(subtotal)}</span>
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
            <span>{rupiah.format(total)}</span>
          </div>
          <Separator className="bg-foreground my-6 h-[0.5px]" />
        </div>
        <DrawerFooter className="flex justify-center items-center flex-row gap-2">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
          <Button
            className="w-full"
            onClick={() => router.push("/checkout")}
            disabled={isDisableCheckout}
          >
            Checkout
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
