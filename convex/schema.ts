import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // Custom App Fields
    role: v.optional(v.union(v.literal("student"), v.literal("volunteer"), v.literal("admin"))),
    participantId: v.optional(v.string()),
    streakCount: v.optional(v.number()),
    lastActiveDate: v.optional(v.string()),
    totalPoints: v.optional(v.number()),
    assignedVolunteerId: v.optional(v.id("users")),
  }).index("by_email", ["email"]).index("by_participantId", ["participantId"]).index("by_assignedVolunteerId", ["assignedVolunteerId"]),

  weeks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // e.g. "active"
    order: v.number(),
    unlockAt: v.optional(v.number()), // timestamp
    deadlineAt: v.optional(v.number()), // timestamp
  }).index("by_order", ["order"]),

  days: defineTable({
    weekId: v.id("weeks"),
    title: v.string(),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    videoTitle: v.optional(v.string()),
    references: v.optional(v.array(v.string())),
    unlockAt: v.optional(v.number()), // timestamp
    deadlineAt: v.optional(v.number()), // timestamp
    lateDeadlineAt: v.optional(v.number()), // absolute lock timestamp
    quizPointsOnTime: v.optional(v.number()),
    quizPointsLate: v.optional(v.number()),
    taskPointsOnTime: v.optional(v.number()),
    taskPointsLate: v.optional(v.number()),
    feedbackEnabled: v.optional(v.boolean()),
    starRatingEnabled: v.optional(v.boolean()),
    feedbackQuestion: v.optional(v.string()),
    order: v.number(),
    taskDescription: v.optional(v.string()),
    taskRequirements: v.optional(v.array(v.string())),
    deleted: v.boolean(),
  }).index("by_weekId", ["weekId"]).index("by_order", ["order"]),

  userProgress: defineTable({
    userId: v.id("users"),
    dayId: v.id("days"),
    videoCompleted: v.boolean(),
    quizCompleted: v.boolean(),
    submissionCompleted: v.boolean(),
    overallCompleted: v.boolean(),
    quizScore: v.optional(v.number()),
    quizTotal: v.optional(v.number()),
    quizState: v.optional(v.object({
      currentIndex: v.number(),
      score: v.number(),
      selections: v.array(v.any()),
      currentQuestionStartTime: v.number(),
    })),
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
    feedbackResponse: v.optional(v.string()),
    studentRating: v.optional(v.number()),
    videoWatchPercent: v.number(),
    quizSubmittedAt: v.optional(v.number()),
  }).index("by_userId", ["userId"]).index("by_dayId", ["dayId"]).index("by_userId_dayId", ["userId", "dayId"]),


  submissions: defineTable({
    userId: v.id("users"),
    dayId: v.id("days"),
    link: v.optional(v.string()),
    content: v.optional(v.string()),
    status: v.string(), // "Pending Review", "Approved", "Needs Revision"
    isLate: v.optional(v.boolean()),
    pointsAwarded: v.optional(v.boolean()),
    awardedScore: v.optional(v.number()),
    submittedAt: v.number(),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
  }).index("by_userId", ["userId"]).index("by_dayId", ["dayId"]).index("by_userId_dayId", ["userId", "dayId"]),

  quizzes: defineTable({
    dayId: v.id("days"),
    timeLimit: v.optional(v.number()), // seconds per question
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        answerIndex: v.number(),
      })
    ),
    feedbackEnabled: v.optional(v.boolean()),
    feedbackQuestion: v.optional(v.string()),
  }).index("by_dayId", ["dayId"]),
});
