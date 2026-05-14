import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import {
  getPhotosForTimelapse,
  createTimelapseRecord,
  getTimelapseHistory,
  shareTimelapseToFeed,
  calculateTimelapseStats,
} from "./timelapse-service";

export const timelapseRouter = router({
  /**
   * Get photos for timelapse generation
   */
  getPhotosForTimelapse: protectedProcedure
    .input(
      z.object({
        studentId: z.number(),
        angle: z.enum(["front", "side", "back"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const photos = await getPhotosForTimelapse(
        input.studentId,
        input.angle,
        input.startDate,
        input.endDate
      );
      return photos;
    }),

  /**
   * Get timelapse history grouped by month and angle
   */
  getTimelapseHistory: protectedProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const history = await getTimelapseHistory(input.studentId);
      return history;
    }),

  /**
   * Calculate statistics for timelapse
   */
  calculateStats: protectedProcedure
    .input(
      z.object({
        studentId: z.number(),
        angle: z.enum(["front", "side", "back"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const photos = await getPhotosForTimelapse(input.studentId, input.angle);
      const stats = await calculateTimelapseStats(photos);
      return stats;
    }),

  /**
   * Create timelapse record (metadata only, video generation happens client-side)
   */
  createRecord: protectedProcedure
    .input(
      z.object({
        studentId: z.number(),
        photoCount: z.number(),
        angle: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        videoUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const record = await createTimelapseRecord(
        input.studentId,
        input.photoCount,
        input.angle,
        input.startDate,
        input.endDate,
        input.videoUrl
      );
      return record;
    }),

  /**
   * Share timelapse to feed
   */
  shareToFeed: protectedProcedure
    .input(
      z.object({
        studentId: z.number(),
        timelapseId: z.string(),
        caption: z.string().min(1).max(500),
        isPublic: z.boolean().default(true),
        videoUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const post = await shareTimelapseToFeed(
        input.studentId,
        input.timelapseId,
        input.caption,
        input.isPublic,
        input.videoUrl
      );
      return post;
    }),

  /**
   * Get timelapse preview (first and last photo)
   */
  getPreview: protectedProcedure
    .input(
      z.object({
        studentId: z.number(),
        angle: z.enum(["front", "side", "back"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const photos = await getPhotosForTimelapse(input.studentId, input.angle);

      if (photos.length < 2) {
        return null;
      }

      return {
        before: photos[0],
        after: photos[photos.length - 1],
        totalPhotos: photos.length,
      };
    }),
});
