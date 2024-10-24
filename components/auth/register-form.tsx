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
import { set, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@/types/register-schema";
import z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { EmailRegister } from "@/server/actions/email-register";
import FormSuccess from "./form-success";
import FormError from "./form-error";

const RegisterForm = () => {
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { email: "", password: "", name: "" },
  });

  const { execute, status } = useAction(EmailRegister, {
    onSuccess: (data) => {
      if (data.data?.errror) setError(data.data.errror);
      if (data.data?.success) setSuccess(data.data.success);
    },
  });

  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const onSubmit = (data: z.infer<typeof RegisterSchema>) => {
    execute(data);
  };
  return (
    <AuthCard
      cardTitle="Create an account to get started"
      backButtonHref="/auth/login"
      backButtonLabel="Already have an account?"
      showSocials
    >
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Joe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              {"Register"}
            </Button>
          </form>
        </Form>
      </div>
    </AuthCard>
  );
};

export default RegisterForm;
