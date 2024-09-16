"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { Product } from "@/types/product.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { editProduct } from "@/actions/product.action";

export default function EditProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [product, setProduct] = useState<Product>();
  const [isError, setIsError] = useState({ error: false, message: "" });
  const editProductWithId = editProduct.bind(
    null,
    product?._id ?? "",
    product?.image ?? ""
  );
  const [state, action] = useFormState(editProductWithId, {});

  useEffect(() => {
    async function getProduct() {
      try {
        const res = await fetch(`/api/products/read?id=${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(res.statusText);
        setProduct(await res.json());
      } catch (error: any) {
        setIsError({ error: true, message: error.message });
      }
    }

    getProduct();
    if (state.success) router.back();
  }, [id, router, state.success]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => {
      if (!prevProduct) return;
      return {
        ...prevProduct,
        [name]: value,
      };
    });
  };

  const handleCategoryChange = (value: string) => {
    setProduct((prevProduct) => {
      if (!prevProduct) return;
      return {
        ...prevProduct,
        category: value,
      };
    });
  };

  const handleAvailabilityChange = (value: string) => {
    setProduct((prevProduct) => {
      if (!prevProduct) return;
      return {
        ...prevProduct,
        isAvailable: value === "true",
      };
    });
  };

  if (!id) return <h1>Missing Id Product</h1>;

  if (isError.error) return <h1>Error: {isError.message}</h1>;

  return (
    <>
      <div className="w-full max-w-2xl px-2 py-10 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Edit Product</CardTitle>
            <CardDescription className="text-center">
              Edit Your Product here
            </CardDescription>
          </CardHeader>
          <form action={action}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Name</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  onChange={handleInputChange}
                  value={product?.title}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  onChange={handleInputChange}
                  value={product?.price.toString()}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  className="min-h-[200px]"
                  id="description"
                  name="description"
                  onChange={handleInputChange}
                  value={product?.description}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  name="category"
                  onValueChange={handleCategoryChange}
                  value={product?.category}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose category your product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="drink">Drink</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/png, image/jpg, image/jpeg"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="isAvailable">Status</Label>
                <Select
                  name="isAvailable"
                  onValueChange={handleAvailabilityChange}
                  value={product?.isAvailable ? "true" : "false"}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status Product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="true">Available</SelectItem>
                      <SelectItem value="false">Unavailable</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full">
                Save
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
