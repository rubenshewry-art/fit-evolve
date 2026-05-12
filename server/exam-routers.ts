/**
 * Exam and OCR Analysis Routes
 * 
 * tRPC procedures for uploading exams, extracting biomarkers, and analyzing results.
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as examAnalysis from "./exam-analysis";
import { storagePut } from "./storage";

export const examRouter = router({
  /**
   * Upload exam image and trigger OCR analysis
   * 
   * Flow:
   * 1. Client uploads exam image to S3
   * 2. Server receives S3 URL and exam type
   * 3. Server extracts biomarkers using LLM
   * 4. Server generates insights
   * 5. Results saved to database
   */
  uploadAndAnalyze: protectedProcedure
    .input(
      z.object({
        examImageUrl: z.string().url("Invalid image URL"),
        examType: z.enum([
          "blood_test",
          "metabolic_panel",
          "lipid_panel",
          "hormone_panel",
          "thyroid",
          "other",
        ]),
        examDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log(
          `[ExamRouter] Processing exam upload for user ${ctx.user.id}`
        );

        // Get student profile
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        // Process exam: extract biomarkers and generate insights
        const result = await examAnalysis.processExamUpload(
          student.id,
          input.examImageUrl,
          input.examType
        );

        return {
          success: true,
          examId: result.examId,
          biomarkers: result.biomarkers,
          insights: result.insights,
          message: `Successfully analyzed ${input.examType} exam`,
        };
      } catch (error) {
        console.error("[ExamRouter] Error processing exam:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to process exam"
        );
      }
    }),

  /**
   * Get all exams for current student
   */
  listExams: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        return [];
      }

      const exams = await db.getExamsByStudent(student.id);
      return exams.map((exam) => ({
        id: exam.id,
        examType: exam.examType,
        examDate: exam.examDate,
        createdAt: exam.createdAt,
        biomarkerCount:
          (exam.extractedData as any)?.biomarkers?.length || 0,
      }));
    } catch (error) {
      console.error("[ExamRouter] Error listing exams:", error);
      return [];
    }
  }),

  /**
   * Get exam details with biomarkers
   */
  getExam: protectedProcedure
    .input(z.object({ examId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        // Verify exam belongs to student
        const exams = await db.getExamsByStudent(student.id);
        const exam = exams.find((e) => e.id === input.examId);

        if (!exam) {
          throw new Error("Exam not found or access denied");
        }

        const extractedData = exam.extractedData as any;

        return {
          id: exam.id,
          examType: exam.examType,
          examDate: exam.examDate,
          createdAt: exam.createdAt,
          biomarkers: extractedData?.biomarkers || [],
          rawText: extractedData?.rawText || "",
        };
      } catch (error) {
        console.error("[ExamRouter] Error getting exam:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to get exam"
        );
      }
    }),

  /**
   * Get insights generated from exams
   */
  getInsights: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          return [];
        }

        const insights = await db.getInsightsByStudent(student.id);

        return insights
          .filter((i) => i.insightType === "exam_analysis")
          .slice(input.offset, input.offset + input.limit)
          .map((insight) => ({
            id: insight.id,
            title: insight.title,
            description: insight.description,
            recommendation: insight.recommendation,
            priority: insight.priority,
            createdAt: insight.createdAt,
          }));
      } catch (error) {
        console.error("[ExamRouter] Error getting insights:", error);
        return [];
      }
    }),

  /**
   * Analyze exam with fitness context
   * 
   * Provides additional analysis considering training intensity, supplements, diet
   */
  analyzeWithContext: protectedProcedure
    .input(
      z.object({
        examId: z.number(),
        trainingIntensity: z
          .enum(["low", "moderate", "high"])
          .optional(),
        supplementStack: z.array(z.string()).optional(),
        dietType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        // Get exam
        const exams = await db.getExamsByStudent(student.id);
        const exam = exams.find((e) => e.id === input.examId);

        if (!exam) {
          throw new Error("Exam not found");
        }

        const extractedData = exam.extractedData as any;
        const biomarkers = extractedData?.biomarkers || [];

        // Analyze with fitness context
        const analysis = await examAnalysis.analyzeExamWithFitnessContext(
          student.id,
          exam.examType,
          biomarkers,
          {
            trainingIntensity: input.trainingIntensity,
            supplementStack: input.supplementStack,
            dietType: input.dietType,
          }
        );

        return {
          success: true,
          analysis,
        };
      } catch (error) {
        console.error("[ExamRouter] Error analyzing with context:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to analyze exam"
        );
      }
    }),

  /**
   * Share exam with professional
   * 
   * Allows student to share exam results with their trainer, nutritionist, etc.
   */
  shareWithProfessional: protectedProcedure
    .input(
      z.object({
        examId: z.number(),
        professionalId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        // Verify exam belongs to student
        const exams = await db.getExamsByStudent(student.id);
        const exam = exams.find((e) => e.id === input.examId);

        if (!exam) {
          throw new Error("Exam not found");
        }

        // Update exam sharing status
        await db.updateExam(input.examId, {
          isSharedWithProfessionals: true,
        });

        // Create notification for professional
        await db.createNotification({
          userId: input.professionalId,
          type: "exam_shared",
          title: "New Exam Shared",
          message: `Student shared a ${exam.examType} exam with you`,
          relatedId: input.examId,
        });

        return {
          success: true,
          message: "Exam shared successfully",
        };
      } catch (error) {
        console.error("[ExamRouter] Error sharing exam:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to share exam"
        );
      }
    }),

  /**
   * Delete exam
   */
  deleteExam: protectedProcedure
    .input(z.object({ examId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        // Verify exam belongs to student
        const exams = await db.getExamsByStudent(student.id);
        const exam = exams.find((e) => e.id === input.examId);

        if (!exam) {
          throw new Error("Exam not found");
        }

        // Delete exam (cascade will delete related insights)
        await db.deleteExam(input.examId);

        return {
          success: true,
          message: "Exam deleted successfully",
        };
      } catch (error) {
        console.error("[ExamRouter] Error deleting exam:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to delete exam"
        );
      }
    }),
});
