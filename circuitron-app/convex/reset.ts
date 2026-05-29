import { mutation } from "./_generated/server";

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
