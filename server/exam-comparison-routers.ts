import { router, protectedProcedure } from "./_core/trpc";
import {
  getExamHistory,
  compareExams,
  exportExamHistory,
} from "./exam-comparison-service";
import { z } from "zod";


export const examComparisonRouter = router({
  getHistory: protectedProcedure
    .input(
      z.object({
        examType: z.string().optional(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.user as any;
      return getExamHistory(String(user.id), input.examType, input.limit);
    }),

  compare: protectedProcedure
    .input(
      z.object({
        currentExamId: z.string(),
        previousExamId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        return compareExams(input.currentExamId, input.previousExamId);
      } catch (error) {
        throw new Error("Failed to compare exams");
      }
    }),

  exportHistory: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user as any;
    return exportExamHistory(String(user.id));
  }),
});
