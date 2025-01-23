"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendOTPService, verifyOTPService } from "@/services/guest-renew-access.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const RENEW_ACCESS_EMAIL_KEY = "renewAccessEmail";

export default function GuestRenewAccess() {
  const searchParams = useSearchParams();
  const submitOTP = searchParams.get("submit");

  return (
    <div className="flex items-center justify-center w-full h-svh p-4">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Renew Access</CardTitle>
          <CardDescription>
            {!submitOTP ? "Please enter your email to get otp code." : "Please enter your otp code from your email."}
          </CardDescription>
        </CardHeader>
        {!submitOTP ? <InputEmailComponent /> : <InputOTPComponent />}
      </Card>
    </div>
  );
}

function InputEmailComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmit, setIsSubmit] = useState(false);
  const [renewAccessEmail, setRenewAccessEmail] = useState("");

  useEffect(() => {
    const sessionEmail = JSON.parse(sessionStorage.getItem(RENEW_ACCESS_EMAIL_KEY) || JSON.stringify(""));
    setRenewAccessEmail(sessionEmail);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      sessionStorage.setItem(RENEW_ACCESS_EMAIL_KEY, JSON.stringify(renewAccessEmail));
    }, 300);
    return () => clearTimeout(timeout);
  }, [renewAccessEmail]);

  async function handleSubmitEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmit(true);

    if (isSubmit) return;

    try {
      const requestOTP = await sendOTPService(renewAccessEmail);
      if (!requestOTP.success) throw new Error(requestOTP.message);

      const params = new URLSearchParams(searchParams);
      params.set("submit", "otp");
      router.push(`?${params.toString()}`);
      toast({
        title: "OTP code has been sent to your email.",
        description: "Please check your email.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    } finally {
      setIsSubmit(false);
    }
  }

  return (
    <form onSubmit={handleSubmitEmail}>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={renewAccessEmail}
              onChange={(e) => setRenewAccessEmail(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full">
          {isSubmit ? (
            <>
              <Loader2 className="animate-spin size-4 mr-2" />
              Please wait
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </CardFooter>
    </form>
  );
}

function InputOTPComponent() {
  const router = useRouter();
  const [isSubmit, setIsSubmit] = useState(false);
  const [renewAccessEmail, setRenewAccessEmail] = useState("");

  useEffect(() => {
    const sessionEmail = JSON.parse(sessionStorage.getItem(RENEW_ACCESS_EMAIL_KEY) || JSON.stringify(""));
    setRenewAccessEmail(sessionEmail);
  }, []);

  async function handleSubmitOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmit(true);
    const otp = e.currentTarget["input-otp"].value;

    if (isSubmit) return;

    try {
      const isValidOTP = await verifyOTPService(renewAccessEmail, otp);
      if (!isValidOTP.success) throw new Error(isValidOTP.message);

      router.replace(`/guest/transaction`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    } finally {
      setIsSubmit(false);
    }
  }

  async function handleResendOTP() {
    toast({
      title: "Please wait...",
      description: "Generating new OTP code.",
    });

    try {
      const requestOTP = await sendOTPService(renewAccessEmail);
      if (!requestOTP.success) throw new Error(requestOTP.message);

      toast({
        title: "OTP code has been sent to your email.",
        description: "Please check your email.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    }
  }

  return (
    <form onSubmit={handleSubmitOTP}>
      <CardContent>
        <InputOTP maxLength={6} name="input-otp" className="border-2">
          <InputOTPGroup className="w-full flex justify-center">
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <InputOTPSlot key={i} index={i} className="basis-2/12 text-lg md:text-xl" />
              ))}
          </InputOTPGroup>
        </InputOTP>
        <div className="flex justify-between items-center mt-2 text-sm">
          <span>Resend OTP in 40 s</span>
          <Button variant="link" type="button" onClick={handleResendOTP}>
            Resend
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full">
          {isSubmit ? (
            <>
              <Loader2 className="animate-spin size-4 mr-2" />
              Please wait
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </CardFooter>
    </form>
  );
}
