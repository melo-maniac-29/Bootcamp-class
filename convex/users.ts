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
    
    // Prevent self-deletion
    if (userId === args.targetUserId) {
      throw new Error("Cannot delete your own account");
    }

    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Requires admin role");
    
    // Cascading deletes for userProgress
    const progressDocs = await ctx.db.query("userProgress")
      .withIndex("by_userId", (q) => q.eq("userId", args.targetUserId))
      .collect();
    for (const doc of progressDocs) {
      await ctx.db.delete(doc._id);
    }
    
    // Cascading deletes for submissions
    const submissions = await ctx.db.query("submissions")
      .withIndex("by_userId", (q) => q.eq("userId", args.targetUserId))
      .collect();
    for (const doc of submissions) {
      await ctx.db.delete(doc._id);
    }

    // Revoke authentication sessions and accounts
    const authSessions = await ctx.db.query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", args.targetUserId))
      .collect();
    for (const session of authSessions) {
      await ctx.db.delete(session._id);
    }

    const authAccounts = await ctx.db.query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), args.targetUserId))
      .collect();
    for (const account of authAccounts) {
      await ctx.db.delete(account._id);
    }

    await ctx.db.delete(args.targetUserId);
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    // Rank students by totalPoints, tiebreak by earliest submission time
    const users = await ctx.db.query("users").collect();
    const students = users.filter((u) => u.role === "student" || !u.role);
    
    const studentsWithTime = await Promise.all(
      students.map(async (u) => {
        const submissions = await ctx.db
          .query("submissions")
          .withIndex("by_userId", (q) => q.eq("userId", u._id))
          .collect();
        const firstSubmissionTime = submissions.length > 0
          ? Math.min(...submissions.map(s => s.submittedAt))
          : Infinity;
        return { ...u, firstSubmissionTime };
      })
    );

    return studentsWithTime.sort((a, b) => {
      const pointsDiff = (b.totalPoints || 0) - (a.totalPoints || 0);
      if (pointsDiff !== 0) return pointsDiff;
      // Tiebreaker: earlier submission wins (smaller timestamp)
      return a.firstSubmissionTime - b.firstSubmissionTime;
    });
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
