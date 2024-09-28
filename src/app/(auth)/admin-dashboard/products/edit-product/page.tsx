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
import Image from "next/image";
import { ChevronLeft, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  const [previewImage, setPreviewImage] = useState<string>();
  const handleChangePreviewImage = (e: any) => {
    setPreviewImage(URL.createObjectURL(e.target.files[0]));
  };

  if (!id)
    return (
      <>
        <div className="w-full h-svh flex flex-col justify-center items-center gap-4">
          <h1 className="text-4xl">Missing Product Id</h1>
          <Button type="button" onClick={() => router.back()}>
            <ChevronLeft />
            Back
          </Button>
        </div>
      </>
    );

  if (isError.error)
    return (
      <>
        <div className="w-full h-svh flex flex-col justify-center items-center gap-4">
          <h1 className="text-4xl">Error: {isError.message}</h1>
          <Button type="button" onClick={() => router.back()}>
            <ChevronLeft />
            Back
          </Button>
        </div>
      </>
    );

  return (
    <>
      <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <form action={action}>
          <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => router.back()}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                {product?.title}
              </h1>
              <Badge variant="outline" className="ml-auto sm:ml-0">
                {product?.isAvailable ? "In stock" : "Out stock"}
              </Badge>
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                >
                  Discard
                </Button>
                <Button type="submit" size="sm">
                  Save Product
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
              <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                    <CardDescription>
                      Enter the details you want to edit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Name</Label>
                        <Input
                          id="title"
                          name="title"
                          type="text"
                          className="w-full"
                          defaultValue={product?.title}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          className="w-full"
                          defaultValue={product?.price.toString()}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          className="min-h-48"
                          defaultValue={product?.description}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <Select
                        name="category"
                        value={product?.category}
                        onValueChange={handleCategoryChange}
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
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Product Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <Select
                        name="isAvailable"
                        value={product?.isAvailable.toString()}
                        onValueChange={handleAvailabilityChange}
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
                </Card>
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                    <CardDescription>
                      Change image by uploading new image
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <Image
                        src={product?.image ?? ""}
                        className="aspect-square w-full rounded-md object-cover"
                        height="300"
                        width="300"
                        alt="Product image"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="size-full	border-2 rounded-md cursor-pointer">
                          {previewImage && (
                            <Image
                              src={previewImage}
                              className="aspect-square w-full rounded-md object-cover"
                              height="84"
                              width="84"
                              alt="Product image"
                            />
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="image"
                            className="flex justify-center items-center size-full border-dashed	border-2 rounded-md cursor-pointer"
                          >
                            <Upload className="size-6 text-muted-foreground" />
                            <span className="sr-only">Upload</span>
                          </label>
                          <Input
                            className="hidden"
                            id="image"
                            name="image"
                            type="file"
                            accept="image/png, image/jpg, image/jpeg"
                            onChange={handleChangePreviewImage}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 md:hidden">
              <Button type="button" variant="outline" size="sm">
                Discard
              </Button>
              <Button type="submit" size="sm">
                Save Product
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
