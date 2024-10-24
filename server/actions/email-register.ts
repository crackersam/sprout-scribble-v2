"use server";

import { actionClient } from "@/lib/safe-action";
import { RegisterSchema } from "@/types/register-schema";
import bcrypt from "bcryptjs";
import { hash } from "crypto";
import { db } from "..";
import { eq } from "drizzle-orm";
import { users } from "../schema";
import { generateVerificationToken } from "./tokens";
import { sendVerificationEmail } from "./email";

export const EmailRegister = actionClient
  .schema(RegisterSchema)
  .action(async ({ parsedInput: { name, email, password } }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existingUser) {
      if (!existingUser.emailVerified) {
        const verificationToken = await generateVerificationToken(email);
        if (verificationToken) {
          sendVerificationEmail(
            verificationToken[0].identifier,
            verificationToken[0].token
          );
          return { success: "Verification email resent" };
        }
      }
      return { errror: "Email already in use" };
    }
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });
    const verificationToken = await generateVerificationToken(email);
    if (verificationToken) {
      sendVerificationEmail(
        verificationToken[0].identifier,
        verificationToken[0].token
      );
      return { success: "Verification email sent" };
    }
  });
