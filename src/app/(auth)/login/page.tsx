"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useActionState, useState, useCallback } from "react";
import { loginAction } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const LOGIN_SESSION_KEY = "login";

interface FormValue {
  email: string;
  password: string;
}

const initialFormValue: FormValue = {
  email: "",
  password: "",
};

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const getRedirect = searchParams.get("redirect");
  const redirectTo = getRedirect?.split("_").join("/");
  const [state, action, isLoading] = useActionState(loginAction, {});
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState<FormValue>(initialFormValue);

  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem(LOGIN_SESSION_KEY) || JSON.stringify(initialFormValue));
    setFormState(session);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      sessionStorage.setItem(LOGIN_SESSION_KEY, JSON.stringify(formState));
    }, 500);
    return () => clearTimeout(timeout);
  }, [formState]);

  useEffect(() => {
    if (state.success) {
      router.push(redirectTo ? `/${redirectTo}` : "/");
    }

    if (state.errors?.formErrors?.length) {
      toast({ variant: "destructive", title: "Login Failed", description: state.errors.formErrors[0] });
    }
  }, [redirectTo, router, state.success, state.errors]);

  const updateFormState = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

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
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  onChange={updateFormState}
                  value={formState.email}
                  required
                />
                {state.errors?.fieldErrors?.name && (
                  <span className="text-xs md:text-sm bg-destructive text-destructive-foreground px-2 py-1">
                    {state.errors?.fieldErrors?.name}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={!showPassword ? "password" : "text"}
                    name="password"
                    onChange={updateFormState}
                    value={formState.password}
                    required
                  />
                  <span
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                  </span>
                </div>
                {state.errors?.fieldErrors?.password && (
                  <ul className="list-disc list-inside text-xs md:text-sm bg-destructive text-destructive-foreground px-2 py-1">
                    {state.errors?.fieldErrors?.password.split(",").map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin size-4 mr-2" />}
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
