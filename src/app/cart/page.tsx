"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { decrementItemInCart, deleteItemInCart, incrementItemInCart } from "@/redux/slice/cart.slice";
import { saveCheckoutData, updateProductsCheckout } from "@/redux/slice/checkout.slice";
import { Product } from "@/types/product.type";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
import { LoaderComponent } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2 } from "lucide-react";
import { rupiah } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const localCart = useSelector((state: RootState) => state.cart);
  const localCheckoutData = useSelector((state: RootState) => state.clientCheckoutData);
  const { productsCheckout } = localCheckoutData;
  const uniqueProductIds = [...new Set(localCart.map((item) => encodeURIComponent(item.productId)))].join(",") || undefined;
  const queryKey = ["cart", uniqueProductIds];

  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!uniqueProductIds) return []; // Prevent fetch if no product IDs
      const response = await fetch(`/api/products?cart=${uniqueProductIds}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.statusText);
      return result.data;
    },
    enabled: localCart.length > 0 && uniqueProductIds !== "",
    staleTime(query) {
      return 60 * 1000 * 5;
    },
  });

  const cartFromDB = (data as Product[]) || [];
  const cartItemsMap = new Map(cartFromDB.map((product: Product) => [product.productId, product]));

  // product combine from local and db to be rendered
  const renderedCartItems = localCart
    .map((item: { productId: string; quantity: number }) => {
      const product = cartItemsMap.get(item.productId);
      return product ? { ...product, quantity: item.quantity } : null;
    })
    .filter((item) => item !== null);

  /**
   * Adjust the quantity of the product in the cart.
   *
   * This function will increase or decrease the quantity of the product based
   * on the `increase` parameter. If `increase` is true, the quantity will be
   * increased by 1. If `increase` is false, the quantity will be decreased by 1.
   *
   * @param newProduct The product to be adjusted.
   * @param increase A boolean indicating whether to increase or decrease the
   * quantity.
   */
  function adjustProductQuantity(newProduct: { quantity: number } & Product, increase: boolean) {
    /**
     * Dispatch an action to update the cart in the Redux store.
     *
     * If the product is already in the cart, the quantity will be updated.
     * If the product is not in the cart, it will be added with a quantity of 1.
     */
    dispatch(increase ? incrementItemInCart(newProduct.productId) : decrementItemInCart(newProduct.productId));

    /**
     * If the product is already in the checkout data, update the quantity.
     *
     * If the product is not in the checkout data, add it with a quantity of 1.
     */
    if (isSelectedProduct(newProduct.productId)) {
      const currentProduct = productsCheckout.find((item) => item.productId === newProduct.productId);
      if (!currentProduct) return;
      handleUpdateSelectedProducts({
        select: true,
        increase,
        product: currentProduct,
      });
    }
  }

  /**
   * Remove a product from the cart.
   *
   * This function will remove the product with the given `productId` from the
   * cart. If the product is also in the checkout data, it will be removed from
   * there as well.
   *
   * @param productId The ID of the product to be removed.
   */
  function removeProduct(productId: string) {
    dispatch(deleteItemInCart(productId));

    /**
     * If the product is also in the checkout data, remove it from there as well.
     */
    if (isSelectedProduct(productId)) {
      const currentProduct = productsCheckout.find((item) => item.productId === productId);
      if (!currentProduct) return;
      handleUpdateSelectedProducts({
        select: false,
        increase: false,
        product: currentProduct,
      });
    }
  }

  /**
   * Updates the selected products in the checkout data.
   *
   * This function takes an object with three properties: `select`, `increase`, and
   * `product`. The `select` property determines if the product is selected or not,
   * the `increase` property determines if the product quantity should be increased
   * by 1, and the `product` property is the product object itself.
   *
   * If the `select` property is set to `true`, the product will be added to the
   * checkout data. If the `select` property is set to `false`, the product will be
   * removed from the checkout data. If the `increase` property is set to `true` and
   * the product is already in the checkout data, the quantity of the product will
   * be increased by 1.
   *
   * @param {{ select: boolean|string, increase: boolean, product: { quantity: number } & Product }} param0
   * - An object with three properties: `select`, `increase`, and `product`.
   */
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

  /**
   * Checks if a product is selected in the checkout data.
   *
   * This function takes a product ID as an argument and checks if the product is
   * selected in the checkout data. If the product is selected, the function returns
   * `true`, otherwise it returns `false`.
   *
   * @param {string} productId - The ID of the product to check.
   * @returns {boolean} - `true` if the product is selected, `false` otherwise.
   */
  function isSelectedProduct(productId: string) {
    return productsCheckout.some((item) => item.productId === productId);
  }

  /**
   * Calculates the subtotal of the checkout data.
   *
   * This function calculates the subtotal of the checkout data by summing up the
   * prices of all the products in the checkout data multiplied by their
   * quantities.
   *
   * @returns {number} - The subtotal of the checkout data.
   */
  function getSubtotal(): number {
    if (productsCheckout.length <= 0) return 0;
    return productsCheckout.map((item) => item.price * item.quantity).reduce((acc, cur) => acc + cur, 0);
  }

  /**
   * If the cart is empty, renders a message saying "Cart is empty".
   *
   * This function is called when the cart is empty and there are no products in
   * the cart.
   */
  if (!localCart.length)
    return (
      <div className="w-full h-svh flex justify-center items-center">
        <h1 className="text-center text-2xl">Cart is Empty</h1>
      </div>
    );

  /**
   * If the data is loading, renders a loading component.
   *
   * This function is called when the data is still loading and there are no
   * products in the cart.
   */
  if (isLoading)
    return (
      <div className="w-full h-svh flex justify-center items-center">
        <LoaderComponent />
      </div>
    );

  if (error) throw new Error(error.message);

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
                    if (product.isAvailable)
                      handleUpdateSelectedProducts({
                        select: checked,
                        increase: checked as boolean,
                        product,
                      });
                  });
                }}
                checked={renderedCartItems.filter((item) => item.isAvailable).length === productsCheckout.length}
                disabled={renderedCartItems.every((item) => !item.isAvailable)}
              />
            </div>
          </div>
          <div>
            {renderedCartItems.length > 0 &&
              renderedCartItems?.map((product) => (
                <div
                  key={product.productId}
                  className={cn(
                    "flex outline-1 outline-white px-3 py-8 rounded-2xl mb-2 relative",
                    isSelectedProduct(product.productId) && "bg-card",
                    !product.isAvailable && "bg-muted"
                  )}
                >
                  <span className="w-full h-px absolute left-0 -bottom-1 bg-muted-foreground" />
                  {!product.isAvailable && (
                    <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center">
                      <p className="text-orange-500 text-sm text-center py-3">Product is not available</p>
                    </div>
                  )}
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
                      checked={isSelectedProduct(product.productId)}
                      disabled={!product.isAvailable}
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
                      <h6 className="text-sm md:text-base">{product.quantity}</h6>
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
                    <h2 className="text-base md:text-xl font-medium">{product.title}</h2>
                    <h6 className="text-sm md:text-base text-muted-foreground">{product.category}</h6>
                    <h6 className="text-sm md:text-base mt-2">{rupiah.format(product.price)}</h6>
                  </div>
                  <div className="relative">
                    <h6 className="text-sm md:text-base absolute top-0 right-0">
                      {rupiah.format(product.price * (product.quantity || 0))}
                    </h6>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="absolute bottom-0 right-0 rounded-full p-3" variant="ghost">
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle />
                          <AlertDialogDescription>Wanna remove {product.title} from cart?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeProduct(product.productId)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
          <Button className="w-full" onClick={() => router.push("/checkout")} disabled={isDisableCheckout}>
            Checkout
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
