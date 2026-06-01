import { action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { modifyAccountCredentials, createAccount, getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

export const hasPasswordAccount = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", "password").eq("providerAccountId", args.email)
      )
      .unique();
    return !!account;
  }
});

export const updatePassword = action({
  args: { newPassword: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Unauthorized");
    }
    
    const user = await ctx.runQuery(api.users.current);
    if (!user || !user.email) {
      throw new Error("User or email not found");
    }
    const hasAccount = await ctx.runQuery(internal.password.hasPasswordAccount, { email: user.email });
    
    if (hasAccount) {
      await modifyAccountCredentials(ctx, {
        provider: "password",
        account: {
          id: user.email,
          secret: args.newPassword,
        }
      });
    } else {
      await createAccount(ctx, {
        provider: "password",
        account: {
          id: user.email,
          secret: args.newPassword,
        },
        profile: { email: user.email },
        shouldLinkViaEmail: true,
      });
    }
  }
});

export const adminResetPassword = action({
  args: { targetUserId: v.id("users"), newPassword: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Unauthorized");
    
    const users = await ctx.runQuery(api.users.listUsers);
    const targetUser = users.find(u => u._id === args.targetUserId);
    if (!targetUser || !targetUser.email) {
      throw new Error("Target user not found or has no email");
    }
    
    const hasAccount = await ctx.runQuery(internal.password.hasPasswordAccount, { email: targetUser.email });
    
    if (hasAccount) {
      await modifyAccountCredentials(ctx, {
        provider: "password",
        account: {
          id: targetUser.email,
          secret: args.newPassword,
        }
      });
    } else {
      await createAccount(ctx, {
        provider: "password",
        account: {
          id: targetUser.email,
          secret: args.newPassword,
        },
        profile: { email: targetUser.email },
        shouldLinkViaEmail: true,
      });
    }
  }
});
