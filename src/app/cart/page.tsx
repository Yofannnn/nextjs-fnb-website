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

export default function CartPage() {
  const [fetchState, setFetchState] = useState({
    isLoading: true,
    isError: false,
    errorMessage: "",
  });

  const cartFromLocal = useSelector((state: RootState) => state.cart);
  const productIds = [...new Set(cartFromLocal.map((item) => item.id))].join(
    "-"
  );

  const [cart, setCart] = useState<Product[]>([]);

  useEffect(() => {
    if (!productIds) return;

    async function fetchCart() {
      try {
        const res = await fetch(`/api/cart?ids=${productIds}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        setCart(data);
        setFetchState((prev) => ({ ...prev, isLoading: false }));
      } catch (error) {
        setFetchState({
          isLoading: false,
          isError: true,
          errorMessage:
            error instanceof Error ? error.message : "An error occurred",
        });
      }
    }

    fetchCart();
  }, [productIds]);

  const dispatch: AppDispatch = useDispatch();

  function handleDecrement(productId: string) {
    dispatch(decrementItemInCart(productId));
  }

  function handleIncrement(productId: string) {
    dispatch(incrementItemInCart(productId));
  }

  function handleDelete(productId: string) {
    dispatch(deleteItemInCart(productId));
  }

  if (!cartFromLocal.length) return <h1>Cart is Empty</h1>;

  if (fetchState.isLoading) return <h1>Loading ...</h1>;

  if (fetchState.isError) return <h1>Error: {fetchState.errorMessage}</h1>;

  return (
    <>
      <div>Cart Page</div>
      <div>
        {cart.length > 0 &&
          cart.map((product, i) => {
            const quantity = cartFromLocal.find(
              (item) => item.id === product._id
            )?.quantity;
            return (
              <div key={i}>
                <h1>{product.title}</h1>
                <h1>{product.price}</h1>
                <h1>{quantity}</h1>
                <Button
                  onClick={() => handleDecrement(product._id)}
                  disabled={quantity === 1}
                >
                  min
                </Button>
                <Button onClick={() => handleIncrement(product._id)}>
                  plus
                </Button>
                <Button onClick={() => handleDelete(product._id)}>
                  remove
                </Button>
              </div>
            );
          })}
      </div>
    </>
  );
}
