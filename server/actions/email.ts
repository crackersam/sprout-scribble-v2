"use server";

import BaseUrl from "@/lib/base-url";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = BaseUrl();

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${baseUrl}/auth/new-verification?token=${token}`;
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Please confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm your email</p>`,
  });
  if (error) return console.log(error);
  if (data) return data;
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const confirmLink = `${baseUrl}/auth/new-password?token=${token}`;
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${confirmLink}">here</a> to reset your password.</p>`,
  });
  if (error) return console.log(error);
  if (data) return data;
};

export const sendTwoFactorTokenByEmail = async (
  email: string,
  token: string
) => {
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Your 2 factor authentication code",
    html: `<p>Your 2 factor code: ${token}</p>`,
  });
  if (error) return console.log(error);
  if (data) return data;
};
