"use client";

import Image from "next/image";
import { Product } from "@/types/product.type";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/slice/cart.slice";
import { AppDispatch } from "@/redux/store";

export default function MenuDetailsPage({ product }: { product: Product }) {
  const dispatch: AppDispatch = useDispatch();

  const handleAddToCart = (id: string) => dispatch(addItemToCart(id));

  return (
    <>
      <div>
        <div className="max-w-md p-2 mx-auto my-10 bg-background flex flex-col gap-3">
          <h1 className="text-2xl">{product.title}</h1>
          <Image
            src={product.image}
            width={500}
            height={500}
            alt="Product Image"
            priority={true}
          />
          <div>
            <Button onClick={() => handleAddToCart(product._id)}>
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
