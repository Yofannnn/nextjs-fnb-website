"use client";

import Link from "next/link";
import { useEffect, useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const [state, action] = useActionState(loginAction, {});
  const searchParams = useSearchParams();
  const getRedirect = searchParams.get("redirect");
  const redirectTo = getRedirect?.split("_").join("/");
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push(redirectTo ? `/${redirectTo}` : "/");
    }
  }, [redirectTo, router, state.success]);

  return (
    <div className="w-full min-h-svh flex justify-center items-center px-2 py-10">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Log In</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" name="email" placeholder="m@example.com" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" name="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href={getRedirect ? `/register?redirect=${getRedirect}` : "/register"} className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
