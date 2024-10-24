"use server";
import { actionClient } from "@/lib/safe-action";
import { NewPasswordSchema } from "@/types/new-password-schema";
import { getPasswordResetTokenByToken } from "./tokens";
import { db } from "..";
import { eq } from "drizzle-orm";
import { passwordResetTokens, users } from "../schema";
import bcrypt from "bcryptjs";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
export const newPassword = actionClient
  .schema(NewPasswordSchema)
  .action(async ({ parsedInput: { password, token } }) => {
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
    const dbPool = drizzle(pool);
    if (!token) {
      return { error: "Token is required" };
    }
    const existingToken = await getPasswordResetTokenByToken(token);
    if (!existingToken) {
      return { error: "Invalid token" };
    }
    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      return { error: "Token expired" };
    }
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, existingToken.identifier),
    });
    if (!existingUser) {
      return { error: "Invalid token" };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await dbPool.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.email, existingToken.identifier));
      await tx
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.token, token));
    });
    return { success: "Password updated" };
  });
