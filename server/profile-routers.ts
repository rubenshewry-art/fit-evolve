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
   * Update student profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        photo: z.string().optional(),
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
   * Get student badges with details
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

  /**
   * Check if onboarding is completed
   */
  checkOnboardingStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        return { completed: false };
      }

      const completed = await profileService.hasCompletedOnboarding(student.id);
      return { completed };
    } catch (error) {
      console.error("[ProfileRouter] Error checking onboarding status:", error);
      return { completed: false };
    }
  }),

  /**
   * Mark onboarding as completed
   */
  completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new Error("Student profile not found");
      }

      return await profileService.markOnboardingCompleted(student.id);
    } catch (error) {
      console.error("[ProfileRouter] Error completing onboarding:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to complete onboarding"
      );
    }
  }),

  /**
   * Get dashboard data (daily phrase, tip, stats)
   */
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new Error("Student profile not found");
      }

      const stats = await profileService.getStudentProfileWithStats(student.id);
      
      return {
        dailyPhrase: "A consistência é a chave do sucesso",
        dailyTip: "Mantenha a consistência! Capture fotos regularmente para acompanhar melhor seu progresso visual.",
        stats: {
          photosCount: stats?.stats.totalPhotos || 0,
          examsCount: stats?.stats.totalExams || 0,
          postsCount: stats?.stats.totalPosts || 0,
          badgesCount: stats?.stats.totalBadges || 0,
        },
      };
    } catch (error) {
      console.error("[ProfileRouter] Error getting dashboard:", error);
      return {
        dailyPhrase: "A consistência é a chave do sucesso",
        dailyTip: "Mantenha a consistência! Capture fotos regularmente para acompanhar melhor seu progresso visual.",
        stats: {
          photosCount: 0,
          examsCount: 0,
          postsCount: 0,
          badgesCount: 0,
        },
      };
    }
  }),

  /**
   * Get recent activities
   */
  getRecentActivities: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new Error("Student profile not found");
      }

      // TODO: Implement actual activity fetching from database
      return [];
    } catch (error) {
      console.error("[ProfileRouter] Error getting activities:", error);
      return [];
    }
  }),

  /**
   * Get statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new Error("Student profile not found");
      }

      const stats = await profileService.getStudentProfileWithStats(student.id);
      
      return {
        activitiesCount: stats?.stats.totalPhotos || 0,
        streakDays: 0, // TODO: Implement streak calculation
        badgesCount: stats?.stats.totalBadges || 0,
        recentActivities: [],
      };
    } catch (error) {
      console.error("[ProfileRouter] Error getting stats:", error);
      return {
        activitiesCount: 0,
        streakDays: 0,
        badgesCount: 0,
        recentActivities: [],
      };
    }
  }),
});
