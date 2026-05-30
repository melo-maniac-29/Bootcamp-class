import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * Purpose: Middleware to enforce admin or volunteer roles for grading paths.
 * 
 * @param {any} ctx - Convex context with auth 
 * @returns {Promise<string>} - The authenticated user's ID
 * 
 * Errors:
 *  - UNAUTHORIZED
 *  - REQUIRES_REVIEWER_ROLE
 */
async function checkReviewer(ctx: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("UNAUTHORIZED");
  const user = await ctx.db.get(userId);
  if (user?.role !== "admin" && user?.role !== "volunteer") {
    throw new Error("REQUIRES_REVIEWER_ROLE");
  }
  return userId;
}

/**
 * Purpose: Retrieve all student submissions with resolved user and day titles.
 * 
 * @returns {Promise<Array>} - List of submissions with metadata
 * 
 * Errors:
 *  - UNAUTHORIZED
 *  - REQUIRES_REVIEWER_ROLE
 */
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

/**
 * Purpose: Update the grading status of a submission (e.g. Approved, Needs Revision).
 * 
 * @param {Object} args - { submissionId: Id<"submissions">, status: string }
 * 
 * Errors:
 *  - UNAUTHORIZED
 *  - REQUIRES_REVIEWER_ROLE
 */
export const updateStatus = mutation({
  args: { submissionId: v.id("submissions"), status: v.string() },
  handler: async (ctx, args) => {
    await checkReviewer(ctx);
    await ctx.db.patch(args.submissionId, { status: args.status });
  },
});

/**
 * Purpose: Upsert a student's task submission, tagging it as late if past the proper deadline,
 *          and strictly blocking if past the absolute lock deadline.
 * 
 * @param {Object} args - { dayId: Id<"days">, link: string }
 * 
 * Errors:
 *  - UNAUTHORIZED
 *  - DAY_NOT_FOUND
 *  - SUBMISSIONS_PERMANENTLY_LOCKED
 * 
 * Side Effects:
 *  - Inserts or patches a row in the submissions table
 */
export const submitTask = mutation({
  args: { dayId: v.id("days"), link: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("UNAUTHORIZED");
    
    // Fetch day to check deadlines
    const day = await ctx.db.get(args.dayId);
    if (!day) throw new Error("DAY_NOT_FOUND");

    const now = Date.now();

    // Enforce lock (lateDeadlineAt)
    if (day.lateDeadlineAt && now > day.lateDeadlineAt) {
      throw new Error("SUBMISSIONS_PERMANENTLY_LOCKED");
    }

    // Determine if late (past proper submission deadline)
    let isLate = false;
    if (day.deadlineAt && now > day.deadlineAt) {
      isLate = true;
    }

    // Check if already submitted
    const existing = await ctx.db
      .query("submissions")
      .withIndex("by_userId_dayId", (q) => q.eq("userId", userId).eq("dayId", args.dayId))
      .first();
      
    if (existing) {
      await ctx.db.patch(existing._id, { link: args.link, submittedAt: now, status: "Pending Review", isLate });
    } else {
      await ctx.db.insert("submissions", {
        userId,
        dayId: args.dayId,
        link: args.link,
        status: "Pending Review",
        isLate,
        submittedAt: now
      });
    }
  },
});
