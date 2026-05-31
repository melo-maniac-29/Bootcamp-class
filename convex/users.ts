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

export const deleteUser = mutation({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Requires admin role");
    
    await ctx.db.delete(args.targetUserId);
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    // Rank students by totalPoints
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => u.role === "student" || !u.role)
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
  }
});

export const updateProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    await ctx.db.patch(userId, { name: args.name });
  },
});

export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    
    // Fetch user's submissions
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);

    // Map to a common activity format
    const activities = await Promise.all(
      submissions.map(async (sub) => {
        const day = await ctx.db.get(sub.dayId);
        return {
          _id: sub._id,
          type: "submission",
          description: `Submitted ${day?.title || 'Task'}`,
          timestamp: sub.submittedAt,
        };
      })
    );

    return activities;
  }
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "volunteer") return null;

    const users = await ctx.db.query("users").collect();
    const students = users.filter(u => u.role === "student" || !u.role);
    const totalStudents = students.length;
    
    const todayStr = new Date().toISOString().split("T")[0];
    const activeStudents = students.filter(u => u.lastActiveDate === todayStr || (u.streakCount && u.streakCount > 0)).length;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const submissions = await ctx.db.query("submissions").collect();
    const submissionsToday = submissions.filter(sub => sub.submittedAt >= startOfToday.getTime()).length;
    
    const totalSubmissions = submissions.length;

    return {
      totalStudents,
      activeStudents,
      submissionsToday,
      totalSubmissions,
    };
  }
});
