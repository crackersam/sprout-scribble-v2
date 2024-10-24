"use client";
import React from "react";
import AuthCard from "./auth-card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/types/login-schema";
import z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { emailSignin } from "@/server/actions/email-signin";
import FormSuccess from "./form-success";
import FormError from "./form-error";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const LoginForm = () => {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [showTwoFactor, setShowTwoFactor] = React.useState(false);

  const { execute, status } = useAction(emailSignin, {
    onSuccess: (data) => {
      if (data.data?.error) setError(data.data.error);
      if (data.data?.success) setSuccess(data.data.success);
      if (data.data?.twoFactor) setShowTwoFactor(true);
    },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    execute(data);
  };
  return (
    <AuthCard
      cardTitle="Welcome back"
      backButtonHref="/auth/register"
      backButtonLabel="Create a new account"
      showSocials
    >
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              {showTwoFactor && (
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        We've sent a 2 factor authentication code to your email.
                      </FormLabel>
                      <FormControl>
                        <InputOTP
                          disabled={status === "executing"}
                          {...field}
                          maxLength={6}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {!showTwoFactor && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <FormSuccess message={success} />
              <FormError message={error} />
              <Button size="sm" className="px-0" variant={"link"} asChild>
                <Link href="/auth/reset">Forgotten your password?</Link>
              </Button>
            </div>
            <Button
              type="submit"
              disabled={status === "executing"}
              className="w-full my-4"
            >
              {showTwoFactor ? "Verify" : "Login"}
            </Button>
          </form>
        </Form>
      </div>
    </AuthCard>
  );
};

export default LoginForm;
