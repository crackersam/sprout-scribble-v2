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
import z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import FormSuccess from "./form-success";
import FormError from "./form-error";
import { ResetSchema } from "@/types/reset-schema";
import { PasswordReset } from "@/server/actions/password-reset";

const ResetForm = () => {
  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { email: "" },
  });

  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const { execute, status } = useAction(PasswordReset, {
    onSuccess: (data) => {
      if (data.data?.error) setError(data.data.error);
      if (data.data?.success) setSuccess(data.data.success);
    },
  });

  const onSubmit = (data: z.infer<typeof ResetSchema>) => {
    execute(data);
  };
  return (
    <AuthCard
      cardTitle="Forgotten your password?"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="bob@example.com"
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

export default ResetForm;
