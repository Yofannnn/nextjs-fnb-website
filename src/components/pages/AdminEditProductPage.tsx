"use client";

import { useActionState, useEffect, useState } from "react";
import { editProductDetailsAction } from "@/actions/product.action";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Loader2, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

export default function AdminEditProductPage({ product }: { product: Product }) {
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<{ file: File; url: string } | null>(null);
  const bindingEditProductAction = editProductDetailsAction.bind(null, product.productId, previewImage?.file);
  const [state, action, pending] = useActionState(bindingEditProductAction, null);

  /**
   * Handles the drop event of the image file from the file input element.
   * Checks if the dropped file is an image file and if true, updates the `previewImage` state
   * with the URL of the selected image file.
   *
   * @param {React.DragEvent<HTMLDivElement>} event - The drop event of the file input element
   */
  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const image = event.dataTransfer?.items[0]?.getAsFile()?.type?.includes("image/");
    if (!image) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Only image files are allowed.",
      });
      return;
    } // image only

    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles.length > 0) {
      const newFiles = Array.from(droppedFiles);
      setPreviewImage({ file: newFiles[0], url: URL.createObjectURL(newFiles[0]) });
    }
  }

  /**
   * Handles the change event triggered by selecting an image file from the file input element.
   * Updates the `previewImage` state with the URL of the selected image file.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event triggered by the file input element
   */
  async function handleChangePreviewImage(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = e.target.files;
    if (newFiles && newFiles[0]) {
      setPreviewImage({ file: newFiles[0], url: URL.createObjectURL(newFiles[0]) });
    }
  }

  useEffect(() => {
    // show toast and redirect if success
    if (state?.success) {
      toast({
        title: "Yeeaaayyy, Success to edit product.",
        description: `${product.productId} has been updated.`,
      });
      setTimeout(() => router.back(), 2500); // Delay redirect
    }
    // show error toast
    if (state?.errors?.formErrors) {
      toast({
        variant: "destructive",
        title: "Upsss! Something went wrong.",
        description: state?.errors?.formErrors.join(","),
      });
    }
  }, [state, router]);

  return (
    <form action={action}>
      <div
        className="grid auto-rows-max p-3 sm:p-4 md:p-5 gap-4"
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">Edit Product</h1>
          <Badge variant="outline" className="ml-auto sm:ml-0">
            {product.isAvailable ? "In stock" : "Out stock"}
          </Badge>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
              Discard
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="animate-spin size-4 mr-2" />
                  Please wait
                </>
              ) : (
                "Save Product"
              )}
            </Button>
          </div>
        </div>
        <div className="grid md:grid-cols-[1fr_250px] lg:grid-cols-3 gap-4">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Enter details for new product</CardDescription>
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
                      placeholder="Enter name"
                      defaultValue={product.title}
                      required
                    />
                    {state?.errors?.fieldErrors?.title && (
                      <span className="text-xs bg-destructive text-destructive-foreground p-2 w-full rounded">
                        {state?.errors?.fieldErrors?.title}
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" name="price" type="number" className="w-full" defaultValue={product.price} required />
                    {state?.errors?.fieldErrors?.price && (
                      <span className="text-xs bg-destructive text-destructive-foreground p-2 w-full rounded">
                        {state?.errors?.fieldErrors?.price}
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      className="min-h-48"
                      defaultValue={product.description}
                      required
                    />
                    {state?.errors?.fieldErrors?.description && (
                      <span className="text-xs bg-destructive text-destructive-foreground p-2 w-full rounded">
                        {state?.errors?.fieldErrors?.description}
                      </span>
                    )}
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
                  <Select name="category" defaultValue={product.category} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose category of your product" />
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
                  <Select name="isAvailable" defaultValue={String(product.isAvailable)} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose status of your product" />
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
                <CardDescription>Change image by uploading new image</CardDescription>
              </CardHeader>
              <CardContent className="w-full">
                {state?.errors?.fieldErrors?.image && (
                  <span className="text-xs bg-destructive text-destructive-foreground p-2 w-full rounded">
                    {state?.errors?.fieldErrors?.image}
                  </span>
                )}
                <div className="grid gap-3">
                  <div>
                    <label
                      htmlFor="image"
                      className="flex flex-col justify-center items-center size-full border-dashed	border-2 rounded-md cursor-pointer py-12"
                    >
                      <Upload className="size-6 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">Select or Drop Image here.</span>
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
                  <div className="size-full rounded-md cursor-pointer">
                    <Image
                      src={previewImage ? previewImage.url : product.image}
                      className="aspect-square w-full rounded-md object-cover"
                      height="84"
                      width="84"
                      alt="Product image"
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
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="animate-spin size-4 mr-2" />
                Please wait
              </>
            ) : (
              "Save Product"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
