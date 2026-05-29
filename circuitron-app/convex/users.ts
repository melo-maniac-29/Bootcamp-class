import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) return [];
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "volunteer") {
      return [];
    }
    return await ctx.db.query("users").collect();
  },
});

export const setRole = mutation({
  args: { targetUserId: v.id("users"), role: v.union(v.literal("student"), v.literal("volunteer"), v.literal("admin")) },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Requires admin role");
    
    await ctx.db.patch(args.targetUserId, { role: args.role });
  },
});
