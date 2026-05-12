/**
 * Profile Routes
 * 
 * tRPC procedures for managing student profiles and statistics.
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as profileService from "./profile-service";

export const profileRouter = router({
  /**
   * Get current user's profile with stats
   */
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new Error("Student profile not found");
      }

      const profile = await profileService.getStudentProfileWithStats(student.id);
      return profile;
    } catch (error) {
      console.error("[ProfileRouter] Error getting profile:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to get profile"
      );
    }
  }),

  /**
   * Get student profile by ID
   */
  getProfile: protectedProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      try {
        const profile = await profileService.getStudentProfileWithStats(
          input.studentId
        );
        return profile;
      } catch (error) {
        console.error("[ProfileRouter] Error getting profile:", error);
        return null;
      }
    }),

  /**
   * Update profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        bio: z.string().max(500).optional(),
        avatarUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        return await profileService.updateStudentProfile(student.id, input);
      } catch (error) {
        console.error("[ProfileRouter] Error updating profile:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to update profile"
        );
      }
    }),

  /**
   * Get profile statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new Error("Student profile not found");
      }

      return await profileService.getStudentStats(student.id);
    } catch (error) {
      console.error("[ProfileRouter] Error getting stats:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to get stats"
      );
    }
  }),

  /**
   * Get student badges
   */
  getBadges: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new Error("Student profile not found");
      }

      return await profileService.getStudentBadgesWithDetails(student.id);
    } catch (error) {
      console.error("[ProfileRouter] Error getting badges:", error);
      return [];
    }
  }),

  /**
   * Get profile completion percentage
   */
  getCompletion: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new Error("Student profile not found");
      }

      const completion = await profileService.getProfileCompletion(student.id);
      return { completion };
    } catch (error) {
      console.error("[ProfileRouter] Error getting completion:", error);
      return { completion: 0 };
    }
  }),

  /**
   * Get profile completion details
   */
  getCompletionDetails: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new Error("Student profile not found");
      }

      return await profileService.getProfileCompletionDetails(student.id);
    } catch (error) {
      console.error("[ProfileRouter] Error getting completion details:", error);
      return { completion: 0, items: [] };
    }
  }),
});
