"use client";

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
import { useFormState } from "react-dom";
import { addProduct } from "@/actions/product.action";

export default function AddProduct() {
  const [state, action] = useFormState(addProduct, {});

  return (
    <>
      <div className="w-full max-w-2xl px-2 py-10 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Add Product</CardTitle>
            <CardDescription className="text-center">
              Enter your new Product here
            </CardDescription>
          </CardHeader>
          <form action={action}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Name</Label>
                <Input id="title" name="title" type="text" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" name="price" type="number" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  className="min-h-[100px]"
                  id="description"
                  name="description"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
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
              <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/png, image/jpg, image/jpeg"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
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
