import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// Middleware to check admin status
async function checkAdmin(ctx: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Unauthorized");
  const user = await ctx.db.get(userId);
  if (user?.role !== "admin") throw new Error("Requires admin role");
  return userId;
}

export const getWeeks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("weeks").withIndex("by_order").collect();
  },
});

export const getDays = query({
  args: { weekId: v.optional(v.id("weeks")) },
  handler: async (ctx, args) => {
    if (!args.weekId) return [];
    const days = await ctx.db
      .query("days")
      .withIndex("by_weekId", (q) => q.eq("weekId", args.weekId!))
      .collect();
    return days.sort((a, b) => (a.order || 0) - (b.order || 0));
  },
});

export const getDay = query({
  args: { dayId: v.id("days") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.dayId);
  },
});

export const getQuiz = query({
  args: { dayId: v.id("days") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizzes")
      .withIndex("by_dayId", (q) => q.eq("dayId", args.dayId))
      .first();
  }
});

export const createWeek = mutation({
  args: { title: v.string(), description: v.optional(v.string()), status: v.string(), order: v.number(), unlockAt: v.optional(v.number()), deadlineAt: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    return await ctx.db.insert("weeks", args);
  },
});

export const createDay = mutation({
  args: {
    weekId: v.id("weeks"),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    return await ctx.db.insert("days", { ...args, deleted: false });
  },
});

export const updateWeek = mutation({
  args: {
    weekId: v.id("weeks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    order: v.optional(v.number()),
    unlockAt: v.optional(v.number()),
    deadlineAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    const { weekId, ...updates } = args;
    return await ctx.db.patch(weekId, updates);
  },
});

export const deleteWeek = mutation({
  args: { weekId: v.id("weeks") },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    return await ctx.db.delete(args.weekId);
  },
});

/**
 * Purpose: Update an existing day node with metadata and time gates.
 *
 * @param {Object} args - Object containing dayId and any fields to update (e.g., unlockAt, pointsOnTime).
 * @returns {Promise<void>}
 *
 * Errors:
 *   - UNAUTHORIZED
 *   - REQUIRES_ADMIN_ROLE
 *
 * Side Effects:
 *   - Patches the days table
 */
export const updateDay = mutation({
  args: {
    dayId: v.id("days"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    videoTitle: v.optional(v.string()),
    unlockAt: v.optional(v.number()),
    deadlineAt: v.optional(v.number()),
    lateDeadlineAt: v.optional(v.number()),
    quizPointsOnTime: v.optional(v.number()),
    taskPointsOnTime: v.optional(v.number()),
    taskPointsLate: v.optional(v.number()),
    feedbackEnabled: v.optional(v.boolean()),
    feedbackQuestion: v.optional(v.string()),
    references: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
    taskDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    const { dayId, ...updates } = args;
    return await ctx.db.patch(dayId, updates);
  },
});

export const deleteDay = mutation({
  args: { dayId: v.id("days") },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    return await ctx.db.delete(args.dayId);
  },
});

export const upsertQuiz = mutation({
  args: {
    dayId: v.id("days"),
    timeLimit: v.optional(v.number()),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        answerIndex: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    const existing = await ctx.db
      .query("quizzes")
      .withIndex("by_dayId", (q) => q.eq("dayId", args.dayId))
      .first();

    const quizData = { 
      questions: args.questions, 
      timeLimit: args.timeLimit,
    };

    if (existing) {
      await ctx.db.patch(existing._id, quizData);
    } else {
      await ctx.db.insert("quizzes", { dayId: args.dayId, ...quizData });
    }
  },
});

/**
 * Returns aggregated progress stats for the current user:
 *   totalDays, completedDays, submittedDays, approvedDays.
 * Used to drive the real progress bars on the dashboard.
 */
export const getMyProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const allDays = await ctx.db.query("days").collect();
    const mySubmissions = await ctx.db
      .query("submissions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const myProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const activeDays = allDays.filter((d) => !d.deleted);
    const totalDays = activeDays.length;
    const submittedDays = mySubmissions.length;
    const approvedDays = mySubmissions.filter((s) => s.status === "Approved").length;
    const quizCompleted = myProgress.filter((p) => p.quizCompleted).length;

    const allWeeks = await ctx.db.query("weeks").collect();
    const sortedWeeks = allWeeks.sort((a, b) => a.order - b.order);
    
    let nextDayId = null;
    const now = Date.now();

    for (const week of sortedWeeks) {
      if (week.unlockAt && now < week.unlockAt) continue;
      const weekDays = activeDays
        .filter(d => d.weekId === week._id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
        
      for (const day of weekDays) {
        if (day.unlockAt && now < day.unlockAt) continue;
        
        const hasTask = !!day.taskDescription;
        const sub = mySubmissions.find(s => s.dayId === day._id);
        const taskCompleted = hasTask ? !!sub : (myProgress.find(p => p.dayId === day._id)?.quizCompleted || false);
        
        if (!taskCompleted) {
          nextDayId = day._id;
          break;
        }
      }
      if (nextDayId) break;
    }

    return { totalDays, submittedDays, approvedDays, quizCompleted, nextDayId };
  },
});

export const saveQuizResult = mutation({
  args: { dayId: v.id("days"), score: v.number(), total: v.number(), feedbackResponse: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("UNAUTHORIZED");

    const existing = await ctx.db
      .query("userProgress")
      .withIndex("by_userId_dayId", (q) => q.eq("userId", userId).eq("dayId", args.dayId))
      .first();

    const day = await ctx.db.get(args.dayId);
    if (!day) throw new Error("DAY_NOT_FOUND");

    // Only award points the FIRST time they complete the quiz
    if (!existing || !existing.quizCompleted) {
      const user = await ctx.db.get(userId);
      if (user) {
        const maxPoints = day.quizPointsOnTime || 0;
        const pointsToAdd = args.total > 0 ? Math.round((args.score / args.total) * maxPoints) : 0;
        await ctx.db.patch(userId, { totalPoints: (user.totalPoints || 0) + pointsToAdd });
      }
    }

    if (existing) {
      await ctx.db.patch(existing._id, { 
        quizCompleted: true,
        quizScore: args.score,
        quizTotal: args.total,
        ...(args.feedbackResponse !== undefined ? { feedbackResponse: args.feedbackResponse } : {})
      });
    } else {
      await ctx.db.insert("userProgress", {
        userId,
        dayId: args.dayId,
        videoCompleted: false,
        quizCompleted: true,
        submissionCompleted: false,
        overallCompleted: false,
        quizScore: args.score,
        quizTotal: args.total,
        videoWatchPercent: 0,
        ...(args.feedbackResponse !== undefined ? { feedbackResponse: args.feedbackResponse } : {})
      });
    }
  },
});

export const getDayProgress = query({
  args: { dayId: v.id("days") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("userProgress")
      .withIndex("by_userId_dayId", (q) => q.eq("userId", userId).eq("dayId", args.dayId))
      .first();
  }
});

export const listFeedbackResponses = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "volunteer") return [];

    // Get all progress records that have a feedback response
    const allProgress = await ctx.db.query("userProgress").collect();
    const withFeedback = allProgress.filter(p => p.feedbackResponse && p.feedbackResponse.trim());

    // Resolve user, day, week for each
    return Promise.all(withFeedback.map(async (p) => {
      const student = await ctx.db.get(p.userId);
      const day = await ctx.db.get(p.dayId);
      const week = day ? await ctx.db.get(day.weekId) : null;
      return {
        _id: p._id,
        studentName: student?.name || student?.email || "Unknown Student",
        dayTitle: day?.title || "Unknown Day",
        dayId: p.dayId,
        weekTitle: week?.title || "Unknown Week",
        weekOrder: week?.order ?? 999,
        dayOrder: day?.order ?? 999,
        feedbackResponse: p.feedbackResponse,
        quizScore: p.quizScore,
        quizTotal: p.quizTotal,
      };
    }));
  },
});
