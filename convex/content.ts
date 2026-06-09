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
    starRatingEnabled: v.optional(v.boolean()),
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
    
    const allWeeks = await ctx.db.query("weeks").collect();
    const sortedWeeks = allWeeks.sort((a, b) => a.order - b.order);
    
    const now = Date.now();
    let nextDayId = null;

    const unlockedDays: any[] = [];
    for (const week of sortedWeeks) {
      if (week.unlockAt && now < week.unlockAt) continue;
      const weekDays = activeDays.filter(d => d.weekId === week._id);
      for (const day of weekDays) {
        if (day.unlockAt && now < day.unlockAt) continue;
        unlockedDays.push(day);
      }
    }

    const totalDays = unlockedDays.length;
    const submittedDays = mySubmissions.length;
    const approvedDays = mySubmissions.filter((s) => s.status === "Approved").length;
    const quizCompleted = myProgress.filter((p) => p.quizCompleted).length;

    for (const week of sortedWeeks) {
      if (week.unlockAt && now < week.unlockAt) continue;
      const weekDays = activeDays
        .filter(d => d.weekId === week._id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
        
      for (const day of weekDays) {
        if (day.unlockAt && now < day.unlockAt) continue;
        
        const hasTask = !!day.taskDescription;
        const sub = mySubmissions.find(s => s.dayId === day._id);
        const taskCompleted = hasTask ? !!sub : (!!sub || (myProgress.find(p => p.dayId === day._id)?.quizCompleted || false));
        
        if (!taskCompleted) {
          nextDayId = day._id;
          break;
        }
      }
      if (nextDayId) break;
    }

    let activePendingTasksCount = 0;
    for (const day of unlockedDays) {
      if (day.lateDeadlineAt && now > day.lateDeadlineAt) continue; // Locked, so not "active pending"
      
      if (day.taskDescription) {
        const sub = mySubmissions.find(s => s.dayId === day._id);
        if (!sub || sub.status === "Needs Revision") {
          activePendingTasksCount++;
        }
      }
    }

    const totalTasks = unlockedDays.filter(d => !!d.taskDescription).length;
    
    // OPTIMIZED: Query for quizzes individually by dayId to avoid fetching ALL quizzes (and their questions/answers) into memory
    let totalQuizzes = 0;
    for (const day of unlockedDays) {
      const quiz = await ctx.db.query("quizzes").withIndex("by_dayId", q => q.eq("dayId", day._id)).first();
      if (quiz && quiz.questions && quiz.questions.length > 0) {
        totalQuizzes++;
      }
    }

    return { 
      totalDays, 
      totalTasks,
      totalQuizzes,
      submittedDays, 
      approvedDays, 
      quizCompleted, 
      nextDayId, 
      activePendingTasks: activePendingTasksCount 
    };
  },
});

export const saveQuizResult = mutation({
  args: { 
    dayId: v.id("days"), 
    score: v.number(), 
    total: v.number(), 
    feedbackResponse: v.optional(v.string()),
    quizAnswers: v.optional(
      v.array(
        v.object({
          question: v.string(),
          selectedIndex: v.union(v.number(), v.null()),
          correctIndex: v.number(),
          isCorrect: v.boolean(),
          options: v.array(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("UNAUTHORIZED");

    const existing = await ctx.db
      .query("userProgress")
      .withIndex("by_userId_dayId", (q) => q.eq("userId", userId).eq("dayId", args.dayId))
      .first();

    const day = await ctx.db.get(args.dayId);
    if (!day) throw new Error("DAY_NOT_FOUND");
    
    const user = await ctx.db.get(userId);
    const isStaff = user?.role === "admin" || user?.role === "volunteer";

    // Enforce lock deadline for students
    if (!isStaff && day.lateDeadlineAt && Date.now() > day.lateDeadlineAt) {
      throw new Error("Quiz is locked. The late deadline has passed.");
    }

    // Only award points the FIRST time they complete the quiz
    if (!existing || !existing.quizCompleted) {
      if (user) {
        // Award points based on the number of correct answers (score)
        const pointsToAdd = args.score;
        await ctx.db.patch(userId, { totalPoints: (user.totalPoints || 0) + pointsToAdd });
      }
    }

    if (existing) {
      await ctx.db.patch(existing._id, { 
        quizCompleted: true,
        quizScore: args.score,
        quizTotal: args.total,
        ...(args.feedbackResponse !== undefined ? { feedbackResponse: args.feedbackResponse } : {}),
        ...(args.quizAnswers !== undefined ? { quizAnswers: args.quizAnswers } : {})
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
        ...(args.feedbackResponse !== undefined ? { feedbackResponse: args.feedbackResponse } : {}),
        ...(args.quizAnswers !== undefined ? { quizAnswers: args.quizAnswers } : {})
      });
    }
  },
});

export const startOrResumeQuiz = mutation({
  args: { dayId: v.id("days") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("UNAUTHORIZED");

    const day = await ctx.db.get(args.dayId);
    if (!day) throw new Error("Day not found");
    
    const user = await ctx.db.get(userId);
    const isStaff = user?.role === "admin" || user?.role === "volunteer";

    // Enforce lock deadline for students
    if (!isStaff && day.lateDeadlineAt && Date.now() > day.lateDeadlineAt) {
      throw new Error("Quiz is locked. The late deadline has passed.");
    }

    let existing = await ctx.db
      .query("userProgress")
      .withIndex("by_userId_dayId", (q) => q.eq("userId", userId).eq("dayId", args.dayId))
      .first();

    if (!existing) {
      const newId = await ctx.db.insert("userProgress", {
        userId,
        dayId: args.dayId,
        videoCompleted: false,
        quizCompleted: false,
        submissionCompleted: false,
        overallCompleted: false,
        videoWatchPercent: 0,
        quizState: {
          currentIndex: 0,
          score: 0,
          selections: [],
          currentQuestionStartTime: Date.now(),
        }
      });
      existing = await ctx.db.get(newId);
    } else if (!existing.quizCompleted && !existing.quizState) {
      await ctx.db.patch(existing._id, {
        quizState: {
          currentIndex: 0,
          score: 0,
          selections: [],
          currentQuestionStartTime: Date.now(),
        }
      });
      existing = await ctx.db.get(existing._id);
    }

    if (!existing || !existing.quizState) return null;
    return {
      ...existing.quizState,
      serverNow: Date.now()
    };
  }
});

export const submitQuizAnswer = mutation({
  args: {
    dayId: v.id("days"),
    selectedIndex: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("UNAUTHORIZED");

    const existing = await ctx.db
      .query("userProgress")
      .withIndex("by_userId_dayId", (q) => q.eq("userId", userId).eq("dayId", args.dayId))
      .first();

    if (!existing || !existing.quizState || existing.quizCompleted) return null;

    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_dayId", (q) => q.eq("dayId", args.dayId))
      .first();

    if (!quiz || !quiz.questions) return null;

    const day = await ctx.db.get(args.dayId);
    const user = await ctx.db.get(userId);
    const isStaff = user?.role === "admin" || user?.role === "volunteer";

    // Enforce lock deadline for students
    if (!isStaff && day?.lateDeadlineAt && Date.now() > day.lateDeadlineAt) {
      throw new Error("Quiz is locked. The late deadline has passed.");
    }

    const state = existing.quizState;
    const currentQ = quiz.questions[state.currentIndex];
    if (!currentQ) return null;

    const timeElapsed = Date.now() - state.currentQuestionStartTime;
    // Buffer of 5s to account for network latency
    const timeLimitMs = quiz.timeLimit ? quiz.timeLimit * 1000 : Infinity;
    
    let isCorrect = false;
    // If timeLimit is strict, timeout submissions automatically fail
    if (timeLimitMs === Infinity || timeElapsed <= timeLimitMs + 5000) {
      if (args.selectedIndex === currentQ.answerIndex) {
        isCorrect = true;
      }
    }

    const newScore = state.score + (isCorrect ? 1 : 0);
    const newSelection = {
      question: currentQ.question,
      options: currentQ.options,
      selectedIndex: args.selectedIndex,
      correctIndex: currentQ.answerIndex,
      isCorrect
    };

    const newSelections = [...state.selections, newSelection];
    const isLast = state.currentIndex === quiz.questions.length - 1;

    if (isLast) {
      // Award points logic
      if (user) {
        await ctx.db.patch(userId, { totalPoints: (user.totalPoints || 0) + newScore });
      }

      await ctx.db.patch(existing._id, {
        quizCompleted: true,
        quizScore: newScore,
        quizTotal: quiz.questions.length,
        quizAnswers: newSelections,
        quizState: undefined // Clear state
      });
      return { finished: true, score: newScore, selections: newSelections };
    } else {
      const newState = {
        currentIndex: state.currentIndex + 1,
        score: newScore,
        selections: newSelections,
        currentQuestionStartTime: Date.now(),
      };
      await ctx.db.patch(existing._id, { quizState: newState });
      return { finished: false, state: { ...newState, serverNow: Date.now() } };
    }
  }
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
        studentRating: p.studentRating,
        starRatingEnabled: day?.starRatingEnabled,
      };
    }));
  },
});

export const reorderDays = mutation({
  args: {
    updates: v.array(v.object({ dayId: v.id("days"), order: v.number() })),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    for (const update of args.updates) {
      await ctx.db.patch(update.dayId, { order: update.order });
    }
  },
});

export const listQuizSubmissions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.role !== "volunteer") return [];

    let withQuiz = [];
    if (user.role === "volunteer") {
      const students = await ctx.db.query("users")
        .withIndex("by_assignedVolunteerId", (q) => q.eq("assignedVolunteerId", userId))
        .collect();
      for (const student of students) {
        const studentProgress = await ctx.db.query("userProgress")
          .withIndex("by_userId", (q) => q.eq("userId", student._id))
          .collect();
        withQuiz.push(...studentProgress.filter(p => p.quizCompleted));
      }
    } else {
      const allProgress = await ctx.db.query("userProgress").collect();
      withQuiz = allProgress.filter(p => p.quizCompleted);
    }

    const results = await Promise.all(withQuiz.map(async (p) => {
      const student = await ctx.db.get(p.userId);
      const day = await ctx.db.get(p.dayId);
      const week = day ? await ctx.db.get(day.weekId) : null;
      return {
        _id: p._id,
        studentName: student?.name || student?.email || "Unknown Student",
        studentEmail: student?.email,
        dayTitle: day?.title || "Unknown Day",
        dayId: p.dayId,
        weekTitle: week?.title || "Unknown Week",
        weekOrder: week?.order ?? 999,
        dayOrder: day?.order ?? 999,
        quizScore: p.quizScore,
        quizTotal: p.quizTotal,
        quizAnswers: p.quizAnswers,
      };
    }));

    return results;
  },
});

export const resetAllQuizAttempts = mutation({
  args: { dayId: v.id("days") },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    
    const allProgress = await ctx.db.query("userProgress").collect();
    const completions = allProgress.filter(p => p.dayId === args.dayId && p.quizCompleted);

    for (const p of completions) {
      if (p.quizScore && p.quizScore > 0) {
        const user = await ctx.db.get(p.userId);
        if (user) {
          await ctx.db.patch(user._id, { totalPoints: Math.max(0, (user.totalPoints || 0) - p.quizScore) });
        }
      }
      await ctx.db.patch(p._id, {
        quizCompleted: false,
        quizScore: undefined,
        quizTotal: undefined,
        quizAnswers: undefined,
      });
    }
  }
});

export const resetSingleQuizAttempt = mutation({
  args: { progressId: v.id("userProgress") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const actingUser = await ctx.db.get(userId);
    if (actingUser?.role !== "admin" && actingUser?.role !== "volunteer") {
      throw new Error("Requires staff role");
    }

    const progress = await ctx.db.get(args.progressId);
    if (!progress || !progress.quizCompleted) return;

    const student = await ctx.db.get(progress.userId);
    if (actingUser.role === "volunteer" && student?.assignedVolunteerId !== userId) {
      throw new Error("You can only reset quizzes for your assigned students");
    }

    if (progress.quizScore && progress.quizScore > 0) {
      const user = await ctx.db.get(progress.userId);
      if (user) {
        await ctx.db.patch(user._id, { totalPoints: Math.max(0, (user.totalPoints || 0) - progress.quizScore) });
      }
    }

    await ctx.db.patch(progress._id, {
      quizCompleted: false,
      quizScore: undefined,
      quizTotal: undefined,
      quizAnswers: undefined,
    });
  }
});
