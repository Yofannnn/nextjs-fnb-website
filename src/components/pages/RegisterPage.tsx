"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/actions/auth.action";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useActionState } from "react";

export default function RegisterPage({ isAuth }: { isAuth: boolean }) {
  const [state, action] = useActionState(registerAction, {});
  const searchParams = useSearchParams();
  const getRedirect = searchParams.get("redirect");
  const redirectTo = getRedirect?.split("_").join("/");
  const router = useRouter();

  useEffect(() => {
    if (isAuth) router.push("/dashboard");
  }, [isAuth, router]);

  useEffect(() => {
    if (state.success) {
      router.push(redirectTo ? `/${redirectTo}` : "/");
    }
  }, [redirectTo, router, state.success]);

  return (
    <div className="w-full min-h-svh flex justify-center items-center px-2 py-10">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Max Verstappen"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="mverstappen@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  name="address"
                  placeholder="1234 Main St"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" name="password" required />
              </div>
              <Button type="submit" className="w-full">
                Create an account
              </Button>
            </div>
          </form>
          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link
              href={getRedirect ? `/login?redirect=${getRedirect}` : "/login"}
              className="underline"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
