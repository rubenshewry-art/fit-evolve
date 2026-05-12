/**
 * Social Feed Routes
 * 
 * tRPC procedures for managing social feed, posts, and achievements.
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as socialService from "./social-service";

export const socialRouter = router({
  /**
   * Create a new post
   */
  createPost: protectedProcedure
    .input(
      z.object({
        caption: z.string().min(1).max(500),
        photoId: z.number().optional(),
        isPublic: z.boolean().default(true),
        markedProfessionalIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        const result = await socialService.createPost({
          studentId: student.id,
          caption: input.caption,
          photoId: input.photoId,
          isPublic: input.isPublic,
          markedProfessionalIds: input.markedProfessionalIds,
        });

        // Check and award badges
        await socialService.checkAndAwardBadges(student.id);

        return result;
      } catch (error) {
        console.error("[SocialRouter] Error creating post:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to create post"
        );
      }
    }),

  /**
   * Get public feed
   */
  getFeed: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20).pipe(z.number().max(50)),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          return [];
        }

        return await socialService.getFeedPosts(student.id, input.limit);
      } catch (error) {
        console.error("[SocialRouter] Error getting feed:", error);
        return [];
      }
    }),

  /**
   * Get student's own posts
   */
  getMyPosts: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20).pipe(z.number().max(50)),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          return [];
        }

        return await socialService.getStudentPosts(student.id, input.limit);
      } catch (error) {
        console.error("[SocialRouter] Error getting my posts:", error);
        return [];
      }
    }),

  /**
   * Update post visibility
   */
  updatePostVisibility: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        isPublic: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        return await socialService.updatePostVisibility(
          input.postId,
          student.id,
          input.isPublic
        );
      } catch (error) {
        console.error("[SocialRouter] Error updating post visibility:", error);
        throw new Error(
          error instanceof Error
            ? error.message
            : "Failed to update post visibility"
        );
      }
    }),

  /**
   * Delete a post
   */
  deletePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        return await socialService.deletePost(input.postId, student.id);
      } catch (error) {
        console.error("[SocialRouter] Error deleting post:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to delete post"
        );
      }
    }),

  /**
   * Get student badges
   */
  getMyBadges: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        return [];
      }

      return await socialService.getStudentBadges(student.id);
    } catch (error) {
      console.error("[SocialRouter] Error getting badges:", error);
      return [];
    }
  }),

  /**
   * Get badge statistics
   */
  getBadgeStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        return { total: 0, badges: [] };
      }

      return await socialService.getBadgeStats(student.id);
    } catch (error) {
      console.error("[SocialRouter] Error getting badge stats:", error);
      return { total: 0, badges: [] };
    }
  }),

  /**
   * Get post details
   */
  getPost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      try {
        return await socialService.getPostById(input.postId);
      } catch (error) {
        console.error("[SocialRouter] Error getting post:", error);
        return null;
      }
    }),
});
