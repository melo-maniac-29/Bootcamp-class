import { mutation, internalMutation } from "./_generated/server";

export const clean = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all users
    const users = await ctx.db.query("users").collect();
    for (const u of users) await ctx.db.delete(u._id);

    // Delete all weeks
    const weeks = await ctx.db.query("weeks").collect();
    for (const w of weeks) await ctx.db.delete(w._id);

    // Delete all days
    const days = await ctx.db.query("days").collect();
    for (const d of days) await ctx.db.delete(d._id);

    // Delete all quizzes
    const quizzes = await ctx.db.query("quizzes").collect();
    for (const q of quizzes) await ctx.db.delete(q._id);

    // Delete all submissions
    const submissions = await ctx.db.query("submissions").collect();
    for (const s of submissions) await ctx.db.delete(s._id);

    return "Database entirely wiped clean.";
  }
});

// A small helper to manually make an account admin
export const makeAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    // Elevate the first created user to admin
    const firstUser = await ctx.db.query("users").first();
    if (firstUser) {
      await ctx.db.patch(firstUser._id, { role: "admin" });
      return "Made first user an admin.";
    }
    return "No users found.";
  }
});

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("Seeding database with massive mock data...");

    // 1. Wipe existing non-admin data
    const weeks = await ctx.db.query("weeks").collect();
    for (const w of weeks) await ctx.db.delete(w._id);

    const days = await ctx.db.query("days").collect();
    for (const d of days) await ctx.db.delete(d._id);

    const quizzes = await ctx.db.query("quizzes").collect();
    for (const q of quizzes) await ctx.db.delete(q._id);

    const submissions = await ctx.db.query("submissions").collect();
    for (const s of submissions) await ctx.db.delete(s._id);

    // Delete existing mock users
    const users = await ctx.db.query("users").collect();
    for (const u of users) {
      if (u.email?.startsWith("mock_")) {
        await ctx.db.delete(u._id);
      }
    }

    // 2. Create 15 Mock Students
    const mockUserIds: any[] = [];
    const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah", "Ian", "Julia", "Kevin", "Luna", "Mason", "Nora", "Oscar"];
    
    for (let i = 0; i < 15; i++) {
      const id = await ctx.db.insert("users", {
        email: `mock_${i}@circuitevent.com`,
        emailVerificationTime: Date.now(),
        role: "student",
        name: `${firstNames[i]} Participant`,
        participantId: `CIRCUIT-${1000 + i}`,
        streakCount: Math.floor(Math.random() * 20),
      });
      mockUserIds.push(id);
    }

    // 3. Create Curriculum (3 Weeks, 3 Days each)
    const dayIds: any[] = [];
    
    for (let w = 1; w <= 3; w++) {
      const weekId = await ctx.db.insert("weeks", {
        title: `Week ${w}: ${w === 1 ? 'Fundamentals' : w === 2 ? 'Intermediate Concepts' : 'Advanced Projects'}`,
        description: `This is the overview for Week ${w}.`,
        status: w === 1 ? "published" : "draft",
        order: w,
      });

      for (let d = 1; d <= 3; d++) {
        const orderNum = (w - 1) * 3 + d;
        const dayId = await ctx.db.insert("days", {
          weekId,
          title: `Day ${orderNum}: ${['Introduction to Tech', 'Logic Gates', 'Microcontrollers'][d - 1] || 'Topic'}`,
          description: `Welcome to Day ${orderNum}! In this session, you'll learn the core mechanics.`,
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          videoTitle: `Lecture Video ${orderNum}`,
          order: orderNum,
          deleted: false,
          taskDescription: `### Your Assignment\n\n1. Watch the video.\n2. Complete the quiz.\n3. Build a simple project and submit the GitHub link below.`,
          unlockAt: Date.now() - 86400000 * (10 - orderNum),
          deadlineAt: Date.now() + 86400000 * 5,
        });
        dayIds.push(dayId);

        await ctx.db.insert("quizzes", {
          dayId,
          questions: [
            { question: "What is the primary goal of this platform?", options: ["Learning", "Sleeping", "Eating"], answerIndex: 0 },
            { question: "Which of the following is correct?", options: ["1+1=2", "The Earth is flat", "JavaScript is easy"], answerIndex: 0 }
          ]
        });
      }
    }

    // 4. Create Random Submissions
    const statuses = ["Pending Review", "Approved", "Needs Revision"];
    
    for (const userId of mockUserIds) {
      const numSubmissions = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numSubmissions; i++) {
        const randomDayId = dayIds[Math.floor(Math.random() * dayIds.length)];
        
        const existing = await ctx.db
          .query("submissions")
          .withIndex("by_userId_dayId", (q) => q.eq("userId", userId).eq("dayId", randomDayId))
          .first();
          
        if (!existing) {
          await ctx.db.insert("submissions", {
            userId,
            dayId: randomDayId,
            link: `https://github.com/mockuser${Math.floor(Math.random() * 1000)}/project`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            submittedAt: Date.now() - Math.random() * 86400000,
          });
        }
      }
    }
    
    return "Seed complete!";
  },
});
