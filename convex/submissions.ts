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
        const week = day ? await ctx.db.get(day.weekId) : null;
        const maxPoints = sub.isLate ? (day?.taskPointsLate || 0) : (day?.taskPointsOnTime || 0);
        return Object.assign({}, sub, {
          userName: user?.name || user?.email || "Unknown User",
          dayTitle: day?.title || "Unknown Day",
          weekTitle: week?.title || "Unknown Week",
          weekOrder: week?.order ?? 999,
          dayOrder: day?.order ?? 999,
          maxPoints
        });
      })
    );
  },
});

/**
 * Purpose: Update the grading status of a submission (e.g. Approved, Needs Revision).
 *          If marking as Approved, grant the appropriate points.
 * 
 * @param {Object} args - { submissionId: Id<"submissions">, status: string }
 * 
 * Errors:
 *  - UNAUTHORIZED
 *  - REQUIRES_REVIEWER_ROLE
 *  - SUBMISSION_NOT_FOUND
 *  - DAY_NOT_FOUND
 */
export const updateStatus = mutation({
  args: { 
    submissionId: v.id("submissions"), 
    status: v.string(),
    awardedScore: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    await checkReviewer(ctx);
    
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("SUBMISSION_NOT_FOUND");
    
    // Check if we are approving
    if (args.status === "Approved" && !submission.pointsAwarded) {
      const day = await ctx.db.get(submission.dayId);
      if (!day) throw new Error("DAY_NOT_FOUND");
      
      const user = await ctx.db.get(submission.userId);
      if (user) {
        const maxPoints = submission.isLate ? (day.taskPointsLate || 0) : (day.taskPointsOnTime || 0);
        const pointsToAdd = args.awardedScore !== undefined ? args.awardedScore : maxPoints;
        await ctx.db.patch(user._id, { totalPoints: (user.totalPoints || 0) + pointsToAdd });
      }
      
      return await ctx.db.patch(args.submissionId, { 
        status: args.status, 
        pointsAwarded: true,
        awardedScore: args.awardedScore
      });
    }

    // Standard update if not an approval
    return await ctx.db.patch(args.submissionId, { status: args.status });
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
  args: { dayId: v.id("days"), link: v.optional(v.string()), feedbackResponse: v.optional(v.string()) },
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
    const isLate = day.deadlineAt && now > day.deadlineAt ? true : false;
    const hasTask = !!day.taskDescription;
    
    // Auto-approve if there is no task required
    const initialStatus = hasTask ? "Pending Review" : "Approved";
    const pointsAwarded = !hasTask;

    const existing = await ctx.db
      .query("submissions")
      .withIndex("by_userId_dayId", (q) => q.eq("userId", userId).eq("dayId", args.dayId))
      .first();
      
    if (existing) {
      // If we are auto-approving a re-submission or they re-submit after being locked, handled earlier.
      // We don't double award points if already awarded.
      const shouldAwardNow = pointsAwarded && !existing.pointsAwarded;
      if (shouldAwardNow) {
        const user = await ctx.db.get(userId);
        if (user) {
          const pointsToAdd = isLate ? (day.taskPointsLate || 0) : (day.taskPointsOnTime || 0);
          await ctx.db.patch(userId, { totalPoints: (user.totalPoints || 0) + pointsToAdd });
        }
      }
      return await ctx.db.patch(existing._id, { 
        link: args.link, 
        isLate, 
        status: initialStatus,
        pointsAwarded: existing.pointsAwarded || shouldAwardNow
      });
    }

    if (pointsAwarded) {
      const user = await ctx.db.get(userId);
      if (user) {
        const pointsToAdd = isLate ? (day.taskPointsLate || 0) : (day.taskPointsOnTime || 0);
        await ctx.db.patch(userId, { totalPoints: (user.totalPoints || 0) + pointsToAdd });
      }
    }

    const subId = await ctx.db.insert("submissions", {
      userId,
      dayId: args.dayId,
      link: args.link,
      status: initialStatus,
      isLate,
      pointsAwarded,
      submittedAt: now,
    });

    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_userId_dayId", (q) => q.eq("userId", userId).eq("dayId", args.dayId))
      .first();

    if (progress) {
      await ctx.db.patch(progress._id, {
        submissionCompleted: true,
        ...(args.feedbackResponse !== undefined ? { feedbackResponse: args.feedbackResponse } : {})
      });
    } else {
      await ctx.db.insert("userProgress", {
        userId,
        dayId: args.dayId,
        videoCompleted: false,
        quizCompleted: false,
        submissionCompleted: true,
        overallCompleted: false,
        videoWatchPercent: 0,
        ...(args.feedbackResponse !== undefined ? { feedbackResponse: args.feedbackResponse } : {})
      });
    }

    return subId;
  },
});
