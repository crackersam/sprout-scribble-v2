"use server";

import { eq } from "drizzle-orm";
import { db } from "..";
import {
  passwordResetTokens,
  twoFactorTokens,
  users,
  verificationTokens,
} from "../schema";
import crypto from "crypto";

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await db.query.verificationTokens.findFirst({
      where: eq(verificationTokens.identifier, email),
    });
    return verificationToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};
export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await db.query.verificationTokens.findFirst({
      where: eq(verificationTokens.token, token),
    });
    return verificationToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};
export const generateVerificationToken = async (email: string) => {
  try {
    const emailToken = crypto.randomUUID();
    const expires = new Date(new Date().getTime() + 1000 * 3600);
    const existingToken = await getVerificationTokenByEmail(email);
    if (existingToken) {
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.identifier, email));
    }
    const verificationToken = await db
      .insert(verificationTokens)
      .values({
        identifier: email,
        token: emailToken,
        expires,
      })
      .returning();
    return verificationToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const newVerification = async (token: string) => {
  try {
    const verificationToken = await getVerificationTokenByToken(token);
    if (!verificationToken) return { error: "No token provided" };
    if (new Date(verificationToken.expires) < new Date()) {
      return { error: "Token expired" };
    }
    const user = await db.query.users.findFirst({
      where: eq(users.email, verificationToken.identifier),
    });
    if (!user) return { error: "User not found" };
    await db
      .update(users)
      .set({
        emailVerified: new Date(),
        email: verificationToken.identifier,
      })
      .where(eq(users.email, verificationToken.identifier));
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.token, token));
    return { success: "Email verified" };
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.token, token),
    });
    return passwordResetToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    const passwordResetToken = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.identifier, email),
    });
    return passwordResetToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getTwoFactorTokenByEmail = async (email: string) => {
  try {
    const twoFactorToken = await db.query.twoFactorTokens.findFirst({
      where: eq(twoFactorTokens.identifier, email),
    });
    return twoFactorToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getTwo0FactorTokenByToken = async (token: string) => {
  try {
    const twoFactorToken = await db.query.twoFactorTokens.findFirst({
      where: eq(twoFactorTokens.token, token),
    });
    return twoFactorToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const generatePasswordResetToken = async (email: string) => {
  try {
    const resetToken = crypto.randomUUID();
    const expires = new Date(new Date().getTime() + 1000 * 3600);
    const existingToken = await getPasswordResetTokenByEmail(email);
    if (existingToken) {
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.identifier, email));
    }
    const passwordResetToken = await db
      .insert(passwordResetTokens)
      .values({
        identifier: email,
        token: resetToken,
        expires,
      })
      .returning();
    return passwordResetToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const generateTwoFactorToken = async (email: string) => {
  try {
    const twoFactorToken = crypto.randomInt(100_000, 1_000_000).toString();
    const expires = new Date(new Date().getTime() + 1000 * 3600);
    const existingToken = await getTwoFactorTokenByEmail(email);
    if (existingToken) {
      await db
        .delete(twoFactorTokens)
        .where(eq(twoFactorTokens.identifier, email));
    }
    const twoFactorAuthToken = await db
      .insert(twoFactorTokens)
      .values({
        identifier: email,
        token: twoFactorToken,
        expires,
      })
      .returning();
    return twoFactorAuthToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};
