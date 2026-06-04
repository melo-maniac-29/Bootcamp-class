import { mutation } from "./_generated/server";

export const allPoints = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    let fixedCount = 0;
    
    for (const user of allUsers) {
      if (user.role && user.role !== "student") continue;

      // 1. Get all userProgress to sum up quiz scores
      const progressDocs = await ctx.db.query("userProgress")
        .withIndex("by_userId", q => q.eq("userId", user._id))
        .collect();
        
      let quizPoints = 0;
      for (const progress of progressDocs) {
        if (progress.quizCompleted && progress.quizScore) {
          quizPoints += progress.quizScore;
        }
      }
      
      // 2. Get all submissions to sum up awarded task scores
      const submissions = await ctx.db.query("submissions")
        .withIndex("by_userId", q => q.eq("userId", user._id))
        .collect();
        
      let taskPoints = 0;
      for (const sub of submissions) {
        if (sub.pointsAwarded) {
          if (sub.awardedScore !== undefined) {
            taskPoints += sub.awardedScore;
          } else {
            const day = await ctx.db.get(sub.dayId);
            if (day) {
              taskPoints += sub.isLate ? (day.taskPointsLate || 0) : (day.taskPointsOnTime || 0);
            }
          }
        }
      }
      
      const actualTotal = quizPoints + taskPoints;
      
      if (user.totalPoints !== actualTotal) {
        await ctx.db.patch(user._id, { totalPoints: actualTotal });
        fixedCount++;
      }
    }
    
    return fixedCount;
  }
});
