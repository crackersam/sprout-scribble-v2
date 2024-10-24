"use server";

import { actionClient } from "@/lib/safe-action";
import { SettingsSchema } from "@/types/settings-schema";
import { auth } from "../auth";
import { eq } from "drizzle-orm";
import { users } from "../schema";
import { db } from "..";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export const Settings = actionClient
  .schema(SettingsSchema)
  .action(
    async ({
      parsedInput: {
        name,
        image,
        isTwoFactorEnabled,
        email,
        password,
        newPassword,
      },
    }) => {
      const user = await auth();
      if (!user) {
        return { error: "User not found" };
      }
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.user.id),
      });
      if (!dbUser) {
        return { error: "User not found" };
      }

      if (user.user.isOAuth) {
        email = undefined;
        password = undefined;
        newPassword = undefined;
        isTwoFactorEnabled = undefined;
      }
      if (password && newPassword && dbUser.password) {
        const passwordMatch = await bcrypt.compare(password, dbUser.password);
        if (!passwordMatch) {
          return { error: "Password incorrect" };
        }
        const samePassword = await bcrypt.compare(newPassword, dbUser.password);
        if (samePassword) {
          return { error: "New password must be different" };
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        password = hashedPassword;
        newPassword = undefined;
      }
      const updatedUser = await db
        .update(users)
        .set({
          name,
          image,
          email,
          twoFactorEnabled: isTwoFactorEnabled,
          password,
        })
        .where(eq(users.id, dbUser.id));
      revalidatePath("/dashboard/settings");
      return { success: "Settings updated" };
    }
  );
