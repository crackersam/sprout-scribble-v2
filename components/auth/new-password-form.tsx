"use client";
import React, { use } from "react";
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
import z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { emailSignin } from "@/server/actions/email-signin";
import FormSuccess from "./form-success";
import FormError from "./form-error";
import { NewPasswordSchema } from "@/types/new-password-schema";
import { newPassword } from "@/server/actions/new-password";
import { useSearchParams } from "next/navigation";

const NewPasswordForm = () => {
  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: { password: "" },
  });

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const { execute, status } = useAction(newPassword, {
    onSuccess: (data) => {
      if (data.data?.error) setError(data.data.error);
      if (data.data?.success) setSuccess(data.data.success);
    },
  });

  const onSubmit = (data: z.infer<typeof NewPasswordSchema>) => {
    execute({ password: data.password, token });
  };
  return (
    <AuthCard
      cardTitle="Enter your new password"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
      showSocials
    >
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div>
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
                        disabled={status === "executing"}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormSuccess message={success} />
              <FormError message={error} />
              <Button size="sm" variant={"link"} asChild>
                <Link href="/auth/reset">Forgotten your password?</Link>
              </Button>
            </div>
            <Button
              type="submit"
              disabled={status === "executing"}
              className="w-full my-2"
            >
              {"Reset password"}
            </Button>
          </form>
        </Form>
      </div>
    </AuthCard>
  );
};

export default NewPasswordForm;
