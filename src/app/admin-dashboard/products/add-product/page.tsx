"use client";

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
import { addProduct } from "@/actions/product.action";
import { ChevronLeft, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useActionState } from "react";

export default function AddProductPage() {
  const [state, action] = useActionState(addProduct, {});
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string>();
  const handleChangePreviewImage = (e: any) => {
    setPreviewImage(URL.createObjectURL(e.target.files[0]));
  };

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
                Add New Product
              </h1>
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
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          className="min-h-48"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid auto-rows-max items-start gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <Select name="category" required>
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
                      <Select name="isAvailable" required>
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
                      <div className="size-full rounded-md cursor-pointer">
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
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 md:hidden">
              <Button type="button" variant="secondary" className="w-full">
                Discard
              </Button>
              <Button type="submit" className="w-full">
                Save Product
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
