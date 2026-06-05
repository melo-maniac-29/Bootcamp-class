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
    await assignIdForRole(ctx, args.targetUserId, args.role);
  },
});

async function assignIdForRole(ctx: any, targetUserId: any, newRole: string) {
  const allUsers = await ctx.db.query("users").collect();
  
  if (newRole === "admin") {
    let maxAdminId = 0;
    for (const u of allUsers) {
      if (u.participantId && u.participantId.startsWith("BUILDXADMIN-")) {
        const numPart = parseInt(u.participantId.split("-")[1]);
        if (!isNaN(numPart) && numPart > maxAdminId) {
          maxAdminId = numPart;
        }
      }
    }
    const nextNumber = maxAdminId + 1;
    const newId = `BUILDXADMIN-${nextNumber.toString().padStart(3, '0')}`;
    await ctx.db.patch(targetUserId, { participantId: newId });
  } else if (newRole === "volunteer") {
    let maxVolId = 0;
    for (const u of allUsers) {
      if (u.participantId && u.participantId.startsWith("BUILDXVOL-")) {
        const numPart = parseInt(u.participantId.split("-")[1]);
        if (!isNaN(numPart) && numPart > maxVolId) {
          maxVolId = numPart;
        }
      }
    }
    const nextNumber = maxVolId + 1;
    const newId = `BUILDXVOL-${nextNumber.toString().padStart(3, '0')}`;
    await ctx.db.patch(targetUserId, { participantId: newId });
  } else {
    let maxStudentId = 100;
    for (const u of allUsers) {
      if (u.participantId && u.participantId.startsWith("BUILDX2026-")) {
        const numPart = parseInt(u.participantId.split("-")[1]);
        if (!isNaN(numPart) && numPart > maxStudentId) {
          maxStudentId = numPart;
        }
      }
    }
    const nextNumber = maxStudentId + 1;
    const newId = `BUILDX2026-${nextNumber}`;
    await ctx.db.patch(targetUserId, { participantId: newId });
  }
}

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
    const users = await ctx.db.query("users").collect();
    const students = users.filter((u) => u.role === "student" || !u.role);
    
    // Fetch first submission time for tiebreaker
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const firstSubmission = await ctx.db.query("submissions")
          .withIndex("by_userId", (q) => q.eq("userId", student._id))
          .order("asc")
          .first();
          
        return {
          ...student,
          firstSubmissionTime: firstSubmission ? firstSubmission.submittedAt : Infinity
        };
      })
    );

    return studentsWithStats.sort((a, b) => {
      const pointsDiff = (b.totalPoints || 0) - (a.totalPoints || 0);
      if (pointsDiff !== 0) return pointsDiff;
      // Tiebreaker: earlier first submission wins
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
    
    // Determine all currently unlocked days
    const allDays = await ctx.db.query("days").collect();
    const activeDaysList = allDays.filter((d) => !d.deleted);
    const allWeeks = await ctx.db.query("weeks").collect();
    
    const now = Date.now();
    const unlockedDays = [];
    for (const week of allWeeks) {
      if (week.unlockAt && now < week.unlockAt) continue;
      const weekDays = activeDaysList.filter(d => d.weekId === week._id);
      for (const day of weekDays) {
        if (day.unlockAt && now < day.unlockAt) continue;
        unlockedDays.push(day);
      }
    }

    const requiredTasks = unlockedDays.filter(d => !!d.taskDescription);
    const requiredQuizzes = unlockedDays.filter(d => (d.quizPointsOnTime || 0) > 0 || (d.quizPointsLate || 0) > 0);

    const submissions = await ctx.db.query("submissions").collect();
    const progressDocs = await ctx.db.query("userProgress").collect();

    // Map which user has completed which task/quiz
    const userCompletedTasks = new Map();
    for (const sub of submissions) {
      if (sub.pointsAwarded) {
        if (!userCompletedTasks.has(sub.userId)) userCompletedTasks.set(sub.userId, new Set());
        userCompletedTasks.get(sub.userId).add(sub.dayId);
      }
    }

    const userCompletedQuizzes = new Map();
    for (const prog of progressDocs) {
      if (prog.quizCompleted && (prog.quizScore || 0) > 0) {
        if (!userCompletedQuizzes.has(prog.userId)) userCompletedQuizzes.set(prog.userId, new Set());
        userCompletedQuizzes.get(prog.userId).add(prog.dayId);
      }
    }

    let activeStudents = 0;
    for (const student of students) {
      const completedTasks = userCompletedTasks.get(student._id) || new Set();
      const completedQuizzes = userCompletedQuizzes.get(student._id) || new Set();
      
      let isActive = true;
      for (const req of requiredTasks) {
        if (!completedTasks.has(req._id)) {
          isActive = false;
          break;
        }
      }
      if (isActive) {
        for (const req of requiredQuizzes) {
          if (!completedQuizzes.has(req._id)) {
            isActive = false;
            break;
          }
        }
      }
      if (isActive) activeStudents++;
    }

    const totalVolunteers = users.filter(u => u.role === "volunteer").length;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const submissionsToday = submissions.filter(sub => sub.submittedAt >= startOfToday.getTime()).length;
    
    const totalSubmissions = submissions.length;

    return {
      totalStudents,
      activeStudents,
      totalVolunteers,
      submissionsToday,
      totalSubmissions,
    };
  }
});

export const generateParticipantId = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return;
    
    const user = await ctx.db.get(userId);
    if (!user || user.participantId) return; // Already has one

    await assignIdForRole(ctx, userId, user.role || "student");
  }
});

export const fixMissingIds = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    let fixedCount = 0;
    for (const user of allUsers) {
      if (!user.participantId) {
        await assignIdForRole(ctx, user._id, user.role || "student");
        fixedCount++;
      }
    }
    return fixedCount;
  }
});

export const assignStudentsToVolunteer = mutation({
  args: { volunteerId: v.id("users"), studentIds: v.array(v.id("users")) },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Requires admin role");

    const currentAssignments = await ctx.db.query("users")
      .withIndex("by_assignedVolunteerId", (q) => q.eq("assignedVolunteerId", args.volunteerId))
      .collect();
      
    for (const student of currentAssignments) {
      if (!args.studentIds.includes(student._id)) {
        await ctx.db.patch(student._id, { assignedVolunteerId: undefined });
      }
    }
    
    for (const studentId of args.studentIds) {
      await ctx.db.patch(studentId, { assignedVolunteerId: args.volunteerId });
    }
  }
});

export const getVolunteersOverview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") return [];

    const allUsers = await ctx.db.query("users").collect();
    const volunteers = allUsers.filter(u => u.role === "volunteer");
    
    const submissions = await ctx.db.query("submissions").collect();
    
    return volunteers.map(vol => {
      const assignedStudents = allUsers.filter(u => u.assignedVolunteerId === vol._id);
      const studentIds = new Set(assignedStudents.map(s => s._id));
      
      const volunteerSubmissions = submissions.filter(s => studentIds.has(s.userId));
      const pendingReviews = volunteerSubmissions.filter(s => s.status === "Pending Review").length;
      
      const reviewsCompleted = submissions.filter(s => s.reviewedBy === vol._id).length;
      return {
        ...vol,
        assignedStudentCount: assignedStudents.length,
        assignedStudentIds: assignedStudents.map(s => s._id),
        pendingReviews,
        reviewsCompleted
      };
    });
  }
});

export const getMyStudents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    
    const user = await ctx.db.get(userId);
    if (user?.role !== "volunteer" && user?.role !== "admin") return [];
    
    const allUsers = await ctx.db.query("users").collect();
    return allUsers.filter(u => u.assignedVolunteerId === userId);
  }
});

export const getSubmissionTimeSeries = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "volunteer") return [];

    const submissions = await ctx.db.query("submissions").collect();
    const progress = await ctx.db.query("userProgress").collect();

    const timeSeriesMap = new Map<string, { date: string; taskSubmissions: number; quizzes: number }>();

    // Process submissions
    for (const sub of submissions) {
      if (!sub.submittedAt) continue;
      const date = new Date(sub.submittedAt).toISOString().split("T")[0];
      if (!timeSeriesMap.has(date)) {
        timeSeriesMap.set(date, { date, taskSubmissions: 0, quizzes: 0 });
      }
      timeSeriesMap.get(date)!.taskSubmissions += 1;
    }

    // Process quizzes
    for (const p of progress) {
      if (!p.quizCompleted || !p._creationTime) continue;
      // Using _creationTime as a proxy for quiz completion date
      const date = new Date(p._creationTime).toISOString().split("T")[0];
      if (!timeSeriesMap.has(date)) {
        timeSeriesMap.set(date, { date, taskSubmissions: 0, quizzes: 0 });
      }
      timeSeriesMap.get(date)!.quizzes += 1;
    }

    const sortedDates = Array.from(timeSeriesMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    return sortedDates;
  }
});

export const getUserPointsBreakdown = query({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    
    const caller = await ctx.db.get(userId);
    if (caller?.role !== "admin" && caller?.role !== "volunteer" && userId !== args.targetUserId) {
      throw new Error("Unauthorized");
    }

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) throw new Error("User not found");

    const allDays = await ctx.db.query("days").collect();
    const activeDays = allDays.filter((d) => !d.deleted);
    const allWeeks = await ctx.db.query("weeks").collect();
    const sortedWeeks = allWeeks.sort((a, b) => a.order - b.order);
    
    const now = Date.now();
    const unlockedDays = [];
    
    for (const week of sortedWeeks) {
      if (week.unlockAt && now < week.unlockAt) continue;
      const weekDays = activeDays
        .filter(d => d.weekId === week._id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
        
      for (const day of weekDays) {
        if (day.unlockAt && now < day.unlockAt) continue;
        unlockedDays.push({ day, week });
      }
    }

    const progressDocs = await ctx.db.query("userProgress").withIndex("by_userId", (q) => q.eq("userId", args.targetUserId)).collect();
    const submissions = await ctx.db.query("submissions").withIndex("by_userId", (q) => q.eq("userId", args.targetUserId)).collect();

    const progressByDay = new Map(progressDocs.map(p => [p.dayId, p]));
    const submissionsByDay = new Map(submissions.map(s => [s.dayId, s]));

    let totalCalculatedPoints = 0;

    const breakdown = unlockedDays.map(({ day, week }) => {
      const progress = progressByDay.get(day._id);
      const submission = submissionsByDay.get(day._id);

      let quizPoints = 0;
      let quizCompletedAt = null;
      if (progress && progress.quizCompleted && progress.quizScore !== undefined) {
        quizPoints = progress.quizScore;
        quizCompletedAt = progress._creationTime;
      }

      let taskPoints = 0;
      let taskCompletedAt = null;
      if (submission && submission.pointsAwarded) {
        if (submission.awardedScore !== undefined) {
          taskPoints = submission.awardedScore;
        } else {
          taskPoints = submission.isLate ? (day.taskPointsLate || 0) : (day.taskPointsOnTime || 0);
        }
        taskCompletedAt = submission.submittedAt;
      }

      const totalPointsForDay = quizPoints + taskPoints;
      totalCalculatedPoints += totalPointsForDay;

      return {
        dayId: day._id,
        dayTitle: day.title,
        dayOrder: day.order,
        weekTitle: week.title,
        weekOrder: week.order,
        quizPoints,
        maxQuizPoints: day.quizPointsOnTime || 0,
        quizCompletedAt,
        taskPoints,
        maxTaskPoints: day.taskPointsOnTime || 0,
        taskCompletedAt,
        totalPointsForDay,
      };
    });

    return {
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        participantId: targetUser.participantId,
        totalPoints: targetUser.totalPoints,
        calculatedPoints: totalCalculatedPoints,
        image: targetUser.image,
      },
      breakdown
    };
  }
});
