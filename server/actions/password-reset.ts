"use server";

import { actionClient } from "@/lib/safe-action";
import { ResetSchema } from "@/types/reset-schema";
import { db } from "..";
import { eq } from "drizzle-orm";
import { users } from "../schema";
import { generatePasswordResetToken } from "./tokens";
import { sendPasswordResetEmail } from "./email";

export const PasswordReset = actionClient
  .schema(ResetSchema)
  .action(async ({ parsedInput: { email } }) => {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    const passwordResetToken = await generatePasswordResetToken(email);
    if (!passwordResetToken) {
      return { error: "Failed to generate password reset token" };
    }
    if (!existingUser) {
      return { error: "User not found" };
    }
    await sendPasswordResetEmail(
      passwordResetToken[0].identifier,
      passwordResetToken[0].token
    );
    return { success: "Passwword reset email sent" };
  });
