"use server";

import { actionClient } from "@/lib/safe-action";
import { loginSchema } from "@/types/login-schema";
import { db } from "..";
import { eq } from "drizzle-orm";
import { twoFactorTokens, users } from "../schema";
import {
  generateTwoFactorToken,
  generateVerificationToken,
  getTwoFactorTokenByEmail,
} from "./tokens";
import { sendTwoFactorTokenByEmail, sendVerificationEmail } from "./email";
import { signIn } from "../auth";
import { AuthError } from "next-auth";

export const emailSignin = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput: { email, password, code } }) => {
    try {
      console.log(email, password, code);
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (existingUser?.email !== email) {
        return { error: "User not found" };
      }
      if (!existingUser?.emailVerified) {
        const verificationToken = await generateVerificationToken(
          existingUser.email
        );
        if (verificationToken && verificationToken[0]) {
          await sendVerificationEmail(
            verificationToken[0].identifier,
            verificationToken[0].token
          );
          return { success: "Email verification resent" };
        } else {
          return { error: "Failed to generate verification token" };
        }
      }
      if (existingUser.twoFactorEnabled && existingUser.email) {
        if (code) {
          const twoFactorToken = await getTwoFactorTokenByEmail(
            existingUser.email
          );
          if (!twoFactorToken) {
            return { error: "Two factor token not found" };
          }
          if (twoFactorToken.token !== code) {
            return { error: "Two factor code incorrect" };
          }
          const hasExpired = new Date(twoFactorToken.expires) < new Date();
          if (hasExpired) {
            return { error: "Two factor code expired" };
          }
          await db
            .delete(twoFactorTokens)
            .where(eq(twoFactorTokens.identifier, twoFactorToken.identifier));
        } else {
          const token = await generateTwoFactorToken(existingUser.email);
          if (!token) {
            return { error: "Failed to generate verification token" };
          }
          await sendTwoFactorTokenByEmail(token[0].identifier, token[0].token);
          return { twoFactor: "Two factor code sent" };
        }
      }
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/",
      });

      return { success: "Signed in" };
    } catch (error) {
      console.log(error);
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            return { error: "Email or password incorrect" };
          case "AccessDenied":
            return { error: error.message };
          case "OAuthSignInError":
            return { error: error.message };
          default:
            return { error: "An error occurred" };
        }
      }
      throw error;
    }
  });
