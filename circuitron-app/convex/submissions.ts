import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// Middleware to check admin/volunteer status
async function checkReviewer(ctx: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Unauthorized");
  const user = await ctx.db.get(userId);
  if (user?.role !== "admin" && user?.role !== "volunteer") {
    throw new Error("Requires reviewer role");
  }
  return userId;
}

export const listSubmissions = query({
  args: {},
  handler: async (ctx) => {
    await checkReviewer(ctx);
    const submissions = await ctx.db.query("submissions").collect();
    
    // We need to resolve users and days for the UI
    return Promise.all(
      submissions.map(async (sub) => {
        const user = await ctx.db.get(sub.userId);
        const day = await ctx.db.get(sub.dayId);
        return {
          ...sub,
          userName: user?.name || user?.email || "Unknown User",
          dayTitle: day?.title || "Unknown Day"
        };
      })
    );
  },
});

export const updateStatus = mutation({
  args: { submissionId: v.id("submissions"), status: v.string() },
  handler: async (ctx, args) => {
    await checkReviewer(ctx);
    await ctx.db.patch(args.submissionId, { status: args.status });
  },
});
