/**
 * Privacy and Permissions Routes
 * 
 * tRPC procedures for managing granular access control.
 * Students can authorize/revoke professional access to their data.
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as permissionsService from "./permissions-service";

export const privacyRouter = router({
  /**
   * Get all professionals with access to student data
   */
  getProfessionalsWithAccess: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        return [];
      }

      const professionals =
        await permissionsService.getProfessionalsWithAccess(student.id);

      return professionals.map((p) => ({
        professionalId: p.professionalId,
        name: p.name,
        specialties: p.specialties,
        permissions: p.permissions,
        grantedAt: p.grantedAt,
      }));
    } catch (error) {
      console.error("[PrivacyRouter] Error getting professionals:", error);
      return [];
    }
  }),

  /**
   * Get permission stats for current student
   */
  getPermissionStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        return {
          totalProfessionalsWithAccess: 0,
          professionalsByPermission: {
            photos: 0,
            exams: 0,
            training: 0,
            nutrition: 0,
            supplements: 0,
          },
        };
      }

      return await permissionsService.getPermissionStats(student.id);
    } catch (error) {
      console.error("[PrivacyRouter] Error getting permission stats:", error);
      return {
        totalProfessionalsWithAccess: 0,
        professionalsByPermission: {
          photos: 0,
          exams: 0,
          training: 0,
          nutrition: 0,
          supplements: 0,
        },
      };
    }
  }),

  /**
   * Grant permission to a professional
   */
  grantPermission: protectedProcedure
    .input(
      z.object({
        professionalId: z.number(),
        permissions: z.object({
          canViewPhotos: z.boolean().optional(),
          canViewExams: z.boolean().optional(),
          canViewTraining: z.boolean().optional(),
          canViewNutrition: z.boolean().optional(),
          canViewSupplements: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        const success = await permissionsService.grantPermission(
          student.id,
          input.professionalId,
          input.permissions
        );

        if (!success) {
          throw new Error("Failed to grant permission");
        }

        // Create notification for professional
        // TODO: Implement notification when getProfessionalById is available

        return {
          success: true,
          message: "Permission granted successfully",
        };
      } catch (error) {
        console.error("[PrivacyRouter] Error granting permission:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to grant permission"
        );
      }
    }),

  /**
   * Update a specific permission
   */
  updatePermission: protectedProcedure
    .input(
      z.object({
        professionalId: z.number(),
        permission: z.enum([
          "canViewPhotos",
          "canViewExams",
          "canViewTraining",
          "canViewNutrition",
          "canViewSupplements",
        ]),
        value: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        const success = await permissionsService.updatePermission(
          student.id,
          input.professionalId,
          input.permission as any,
          input.value
        );

        if (!success) {
          throw new Error("Failed to update permission");
        }

        return {
          success: true,
          message: `Permission updated successfully`,
        };
      } catch (error) {
        console.error("[PrivacyRouter] Error updating permission:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to update permission"
        );
      }
    }),

  /**
   * Revoke all permissions for a professional
   */
  revokeAccess: protectedProcedure
    .input(z.object({ professionalId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new Error("Student profile not found");
        }

        const success = await permissionsService.revokeAllPermissions(
          student.id,
          input.professionalId
        );

        if (!success) {
          throw new Error("Failed to revoke access");
        }

        // Create notification for professional
        // TODO: Implement notification when getProfessionalById is available

        return {
          success: true,
          message: "Access revoked successfully",
        };
      } catch (error) {
        console.error("[PrivacyRouter] Error revoking access:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to revoke access"
        );
      }
    }),

  /**
   * Get available professionals to grant access
   * (professionals not yet connected or with partial access)
   */
  getAvailableProfessionals: protectedProcedure
    .input(
      z.object({
        specialty: z.string().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          return [];
        }

        // Get all professionals (in real app, would filter by academy/specialty)
        // Note: getAllProfessionals doesn't exist yet, returning empty for now
        const allProfessionals: any[] = [];

        // Get professionals already with access
        const withAccess =
          await permissionsService.getProfessionalsWithAccess(student.id);
        const withAccessIds = new Set(
          withAccess.map((p) => p.professionalId)
        );

        // Filter out professionals already with access
        const available = allProfessionals
          .filter((p: any) => !withAccessIds.has(p.id))
          .filter((p: any) => {
            if (!input.specialty) return true;
            const specs = Array.isArray(p.specialties) ? p.specialties : [];
            return specs.some((s: any) =>
              s.toLowerCase().includes(input.specialty!.toLowerCase())
            );
          })
          .slice(0, input.limit);

        return available.map((p: any) => ({
          professionalId: p.id || 0,
          name: p.name || "Unknown",
          specialties: Array.isArray(p.specialties) ? p.specialties : [],
          isVerified: p.isVerified || false,
        }));
      } catch (error) {
        console.error(
          "[PrivacyRouter] Error getting available professionals:",
          error
        );
        return [];
      }
    }),

  /**
   * Get privacy settings summary
   */
  getPrivacySummary: protectedProcedure.query(async ({ ctx }) => {
    try {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        return {
          photosShared: false,
          examsShared: false,
          trainingShared: false,
          nutritionShared: false,
          supplementsShared: false,
          totalProfessionals: 0,
        };
      }

      const stats = await permissionsService.getPermissionStats(student.id);

      return {
        photosShared: stats.professionalsByPermission.photos > 0,
        examsShared: stats.professionalsByPermission.exams > 0,
        trainingShared: stats.professionalsByPermission.training > 0,
        nutritionShared: stats.professionalsByPermission.nutrition > 0,
        supplementsShared: stats.professionalsByPermission.supplements > 0,
        totalProfessionals: stats.totalProfessionalsWithAccess,
      };
    } catch (error) {
      console.error("[PrivacyRouter] Error getting privacy summary:", error);
      return {
        photosShared: false,
        examsShared: false,
        trainingShared: false,
        nutritionShared: false,
        supplementsShared: false,
        totalProfessionals: 0,
      };
    }
  }),
});
