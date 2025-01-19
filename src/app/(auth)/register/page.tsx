"use client";

import Link from "next/link";
import { useEffect, useActionState, useState, useCallback, memo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { registerAction } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const REGISTER_SESSION_KEY = "register";

const fields = [
  { id: "name", type: "text", name: "name", placeholder: "Max Verstappen" },
  { id: "email", type: "email", name: "email", placeholder: "maxverstappen@gmail.com" },
  { id: "address", type: "text", name: "address", placeholder: "1234 Main St" },
];

interface FormValue {
  name: string;
  email: string;
  address: string;
  password: string;
}

const initialFormValue: FormValue = {
  name: "",
  email: "",
  address: "",
  password: "",
};

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const getRedirect = searchParams.get("redirect");
  const redirectTo = getRedirect?.split("_").join("/");
  const [state, action, isLoading] = useActionState(registerAction, {});
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState<FormValue>(initialFormValue);

  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem(REGISTER_SESSION_KEY) || JSON.stringify(initialFormValue));
    setFormState(session);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      sessionStorage.setItem(REGISTER_SESSION_KEY, JSON.stringify(formState));
    }, 500);
    return () => clearTimeout(timeout);
  }, [formState]);

  useEffect(() => {
    if (state.success) {
      router.push(redirectTo ? `/${redirectTo}` : "/");
      sessionStorage.removeItem(REGISTER_SESSION_KEY);
    }

    if (state.errors?.formErrors?.length) {
      toast({ variant: "destructive", title: "Sign Up Failed", description: state.errors.formErrors[0] });
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
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <div className="grid gap-4">
              {fields.map(({ id, type, name, placeholder }) => (
                <InputField
                  key={id}
                  id={id}
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  value={formState[name as keyof FormValue]}
                  onChange={updateFormState}
                  error={state.errors?.fieldErrors?.[name]}
                />
              ))}
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
                Create an account
              </Button>
            </div>
          </form>
          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href={getRedirect ? `/login?redirect=${getRedirect}` : "/login"} className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const InputField = memo(
  ({
    id,
    type,
    name,
    placeholder,
    value,
    onChange,
    error,
  }: {
    id: string;
    type: string;
    name: string;
    placeholder: string;
    value: string;
    onChange: any;
    error?: string;
  }) => (
    <div className="grid gap-2">
      <Label htmlFor={id}>{name}</Label>
      <Input id={id} type={type} name={name} placeholder={placeholder} onChange={onChange} value={value} required />
      {error && (
        <ul className="list-disc list-inside text-xs md:text-sm bg-destructive text-destructive-foreground px-2 py-1">
          {error.split(",").map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  )
);
