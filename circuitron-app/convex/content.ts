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
    return await ctx.db
      .query("days")
      .withIndex("by_weekId", (q) => q.eq("weekId", args.weekId!))
      .collect();
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
  args: { title: v.string(), description: v.optional(v.string()), status: v.string(), order: v.number() },
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

export const updateDay = mutation({
  args: {
    dayId: v.id("days"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    videoTitle: v.optional(v.string()),
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

    if (existing) {
      await ctx.db.patch(existing._id, { questions: args.questions });
    } else {
      await ctx.db.insert("quizzes", { dayId: args.dayId, questions: args.questions });
    }
  },
});
