"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useActionState, useEffect } from "react";
import { addProductAction } from "@/actions/product.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Loader2, Upload } from "lucide-react";
import { base64ToFile, fileToBase64 } from "@/lib/image-converter";

const STORAGE_NAME = "add-product-form-state";

interface FormValue {
  title?: string | "";
  price?: string | "";
  description?: string | "";
  category?: "food" | "drink" | "snack" | "";
  isAvailable?: "true" | "false" | "";
  image?: string | "";
}

export default function AddProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<{ file: File; url: string } | null>(null);
  const [formValue, setFormValue] = useState<FormValue>({
    title: "",
    price: "",
    description: "",
    category: "",
    isAvailable: "",
    image: "",
  });
  // binding image to action
  const bindAddProductAction = addProductAction.bind(null, formValue.image ? base64ToFile(formValue.image || "") : null);
  const [state, action, isPending] = useActionState(bindAddProductAction, null);

  /**
   * Handles the change event triggered by selecting an image file from the file input element.
   * Updates the `previewImage` state with the URL of the selected image file and also updates the
   * `formValue` state with the image in base64 format. The `formValue` state is also persisted into
   * the session storage with the key of `STORAGE_NAME`.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event triggered by the file input element
   */
  async function handleChangePreviewImage(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = e.target.files;
    if (newFiles && newFiles[0]) {
      const base64 = await fileToBase64(newFiles[0]);
      setFormValue((prev) => {
        const updated = { ...prev, image: base64 };
        sessionStorage.setItem(STORAGE_NAME, JSON.stringify(updated));
        return updated;
      });
      setPreviewImage({ file: newFiles[0], url: URL.createObjectURL(newFiles[0]) });
    }
  }

  /**
   * Handles the drop event triggered by dropping an image file onto the component.
   * Updates the `previewImage` state with the URL of the selected image file.
   *
   * @param {React.DragEvent<HTMLDivElement>} event - The drop event triggered by the component
   */
  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles.length > 0) {
      const newFiles = Array.from(droppedFiles);
      handleChangeInput("image", await fileToBase64(newFiles[0]));
      setPreviewImage({ file: newFiles[0], url: URL.createObjectURL(newFiles[0]) });
    }
  }

  /**
   * Handles the change event triggered by any input element that has a name attribute.
   * Updates the `formValue` state with the new value and also persists the updated state
   * into the session storage with the key of `STORAGE_NAME`.
   * @param {string} name - The name of the input element
   * @param {string} value - The new value of the input element
   */
  function handleChangeInput(name: string, value: string) {
    setFormValue((prev) => {
      const updated = { ...prev, [name]: value };
      sessionStorage.setItem(STORAGE_NAME, JSON.stringify(updated));
      return updated;
    });
  }

  useEffect(() => {
    // show toast and redirect if success
    if (state?.success) {
      toast({
        title: "Yeeaaayyy.",
        description: "Success to create new product",
      });
      sessionStorage.removeItem(STORAGE_NAME); // Remove form state from session storage
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

  useEffect(() => {
    // load form state from session storage
    const storageState = JSON.parse(sessionStorage.getItem(STORAGE_NAME) || "null");
    if (storageState) {
      setFormValue(storageState);
      if (storageState.image) {
        // if image is stored in session storage set preview image
        setPreviewImage({
          file: base64ToFile(storageState.image),
          url: URL.createObjectURL(base64ToFile(storageState.image)),
        });
      }
    }
  }, []);

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
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Add New Product
          </h1>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
              Discard
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (
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
                      onChange={(e) => handleChangeInput(e.target.name, e.target.value)}
                      value={formValue.title}
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
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      className="w-full"
                      onChange={(e) => handleChangeInput(e.target.name, e.target.value)}
                      value={formValue.price}
                      required
                    />
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
                      onChange={(e) => handleChangeInput(e.target.name, e.target.value)}
                      value={formValue.description}
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
                  <Select
                    name="category"
                    onValueChange={(value) => handleChangeInput("category", value)}
                    defaultValue={formValue.category}
                    required
                  >
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
                  <Select
                    name="isAvailable"
                    onValueChange={(value) => handleChangeInput("isAvailable", value)}
                    defaultValue={formValue.isAvailable}
                    required
                  >
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
                <CardDescription>
                  {!previewImage ? "Upload a product image" : "Change image by uploading new image"}
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full">
                {state?.errors?.fieldErrors?.image && (
                  <span className="text-xs bg-destructive text-destructive-foreground p-2 w-full rounded">
                    {state?.errors?.fieldErrors?.image}
                  </span>
                )}
                <div className="grid gap-2">
                  <div className="size-full rounded-md cursor-pointer">
                    {previewImage && (
                      <Image
                        src={previewImage.url}
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
                      className="flex flex-col justify-center items-center size-full border-dashed	border-2 rounded-md cursor-pointer py-14"
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 md:hidden">
          <Button type="button" variant="secondary" className="w-full">
            Discard
          </Button>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
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
