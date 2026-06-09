import { action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

export const testUpdatePassword = action({
  args: { newPassword: v.string() },
  handler: async (ctx, args) => {
    // Calling the exact same code as updatePassword but without user check
    await ctx.runAction(api.password.adminResetPassword, { 
        targetUserId: "k97crmq5c5npy4f0cjvjyrnahd87ngpy" as any, 
        newPassword: args.newPassword 
    });
  }
});
