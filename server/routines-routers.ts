/**
 * Routines Routes
 * 
 * tRPC procedures for managing student routines
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as routinesService from "./routines-service";

export const routinesRouter = router({
  /**
   * Get all routines for current user
   */
  getMyRoutines: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new Error("Student profile not found");
      }

      return await routinesService.getStudentRoutines(student.id);
    } catch (error) {
      console.error("[RoutinesRouter] Error getting routines:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to get routines"
      );
    }
  }),

  /**
   * Get a single routine by ID
   */
  getRoutine: protectedProcedure
    .input(z.object({ routineId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        return await routinesService.getRoutineById(input.routineId, student.id);
      } catch (error) {
        console.error("[RoutinesRouter] Error getting routine:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to get routine"
        );
      }
    }),

  /**
   * Create a new routine
   */
  createRoutine: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        time: z.string().optional(),
        frequency: z.enum(["daily", "weekdays", "weekends", "custom"]).optional(),
        reminderEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        return await routinesService.createRoutine(student.id, input);
      } catch (error) {
        console.error("[RoutinesRouter] Error creating routine:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to create routine"
        );
      }
    }),

  /**
   * Update a routine
   */
  updateRoutine: protectedProcedure
    .input(
      z.object({
        routineId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        time: z.string().optional(),
        frequency: z.enum(["daily", "weekdays", "weekends", "custom"]).optional(),
        isActive: z.boolean().optional(),
        reminderEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        const { routineId, ...data } = input;
        return await routinesService.updateRoutine(routineId, student.id, data);
      } catch (error) {
        console.error("[RoutinesRouter] Error updating routine:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to update routine"
        );
      }
    }),

  /**
   * Delete a routine
   */
  deleteRoutine: protectedProcedure
    .input(z.object({ routineId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        return await routinesService.deleteRoutine(input.routineId, student.id);
      } catch (error) {
        console.error("[RoutinesRouter] Error deleting routine:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to delete routine"
        );
      }
    }),

  /**
   * Mark a routine as completed
   */
  completeRoutine: protectedProcedure
    .input(
      z.object({
        routineId: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        return await routinesService.completeRoutine(
          input.routineId,
          student.id,
          input.notes
        );
      } catch (error) {
        console.error("[RoutinesRouter] Error completing routine:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to complete routine"
        );
      }
    }),

  /**
   * Get today's completions
   */
  getTodayCompletions: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new Error("Student profile not found");
      }

      return await routinesService.getTodayCompletions(student.id);
    } catch (error) {
      console.error("[RoutinesRouter] Error getting today completions:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to get completions"
      );
    }
  }),

  /**
   * Get routine statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new Error("Student profile not found");
      }

      return await routinesService.getRoutineStats(student.id);
    } catch (error) {
      console.error("[RoutinesRouter] Error getting stats:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to get stats"
      );
    }
  }),
});
