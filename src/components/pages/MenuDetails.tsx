"use client";

import Image from "next/image";
import { Product } from "@/types/product.type";
import { Button } from "@/components/ui/button";
import { Cart } from "@/types/cart.type";

export default function MenuDetailsPage({ product }: { product: Product }) {
  console.log(product);

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
          />
          <div>
            <Button>Add to Cart</Button>
          </div>
        </div>
      </div>
    </>
  );
}
