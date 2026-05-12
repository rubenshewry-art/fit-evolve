/**
 * Permissions Service
 * 
 * Manages granular access control for student data.
 * Allows students to authorize/revoke professional access to:
 * - Photos
 * - Exams
 * - Training data
 * - Nutrition data
 * - Supplements
 * - Insights
 */

import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { permissions, professionals } from "../drizzle/schema";

export interface PermissionSet {
  canViewPhotos: boolean;
  canViewExams: boolean;
  canViewTraining: boolean;
  canViewNutrition: boolean;
  canViewSupplements: boolean;
}

export interface ProfessionalAccess {
  professionalId: number;
  name: string | null;
  specialties: string[];
  permissions: PermissionSet;
  grantedAt: Date;
}

/**
 * Get all permissions for a student-professional pair
 */
export async function getPermissions(
  studentId: number,
  professionalId: number
): Promise<PermissionSet | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const perm = await db
      .select()
      .from(permissions)
      .where(
        and(
          eq(permissions.studentId, studentId),
          eq(permissions.professionalId, professionalId)
        )
      )
      .limit(1);

    if (perm.length === 0) return null;

    return {
      canViewPhotos: perm[0].canViewPhotos,
      canViewExams: perm[0].canViewExams,
      canViewTraining: perm[0].canViewTraining,
      canViewNutrition: perm[0].canViewNutrition,
      canViewSupplements: perm[0].canViewSupplements,
    };
  } catch (error) {
    console.error("[PermissionsService] Error getting permissions:", error);
    return null;
  }
}

/**
 * Check if professional has specific permission
 */
export async function hasPermission(
  studentId: number,
  professionalId: number,
  permission: keyof PermissionSet
): Promise<boolean> {
  const perms = await getPermissions(studentId, professionalId);
  if (!perms) return false;
  return perms[permission];
}

/**
 * Get all professionals with access to student data
 */
export async function getProfessionalsWithAccess(
  studentId: number
): Promise<ProfessionalAccess[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const results = await db
      .select({
        professionalId: permissions.professionalId,
        name: professionals.userId,
        specialties: professionals.specialties,
        canViewPhotos: permissions.canViewPhotos,
        canViewExams: permissions.canViewExams,
        canViewTraining: permissions.canViewTraining,
        canViewNutrition: permissions.canViewNutrition,
        canViewSupplements: permissions.canViewSupplements,
        grantedAt: permissions.grantedAt,
      })
      .from(permissions)
      .innerJoin(
        professionals,
        eq(permissions.professionalId, professionals.id)
      )
      .where(eq(permissions.studentId, studentId));

    return results.map((r: any) => ({
      professionalId: r.professionalId,
      name: r.name?.toString() || "Unknown",
      specialties: Array.isArray(r.specialties) ? r.specialties : [],
      permissions: {
        canViewPhotos: r.canViewPhotos,
        canViewExams: r.canViewExams,
        canViewTraining: r.canViewTraining,
        canViewNutrition: r.canViewNutrition,
        canViewSupplements: r.canViewSupplements,
      },
      grantedAt: r.grantedAt,
    }));
  } catch (error) {
    console.error(
      "[PermissionsService] Error getting professionals with access:",
      error
    );
    return [];
  }
}

/**
 * Grant permission to a professional
 */
export async function grantPermission(
  studentId: number,
  professionalId: number,
  permissionSet: Partial<PermissionSet>
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Check if permission record exists
    const existing = await db
      .select()
      .from(permissions)
      .where(
        and(
          eq(permissions.studentId, studentId),
          eq(permissions.professionalId, professionalId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing permissions
      await db
        .update(permissions)
        .set({
          canViewPhotos:
            permissionSet.canViewPhotos ?? existing[0].canViewPhotos,
          canViewExams:
            permissionSet.canViewExams ?? existing[0].canViewExams,
          canViewTraining:
            permissionSet.canViewTraining ?? existing[0].canViewTraining,
          canViewNutrition:
            permissionSet.canViewNutrition ?? existing[0].canViewNutrition,
          canViewSupplements:
            permissionSet.canViewSupplements ?? existing[0].canViewSupplements,
        })
        .where(
          and(
            eq(permissions.studentId, studentId),
            eq(permissions.professionalId, professionalId)
          )
        );
    } else {
      // Create new permission record
      await db.insert(permissions).values({
        studentId,
        professionalId,
        canViewPhotos: permissionSet.canViewPhotos ?? false,
        canViewExams: permissionSet.canViewExams ?? false,
        canViewTraining: permissionSet.canViewTraining ?? false,
        canViewNutrition: permissionSet.canViewNutrition ?? false,
        canViewSupplements: permissionSet.canViewSupplements ?? false,
        grantedAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log(
      `[PermissionsService] Granted permissions to professional ${professionalId} for student ${studentId}`
    );
    return true;
  } catch (error) {
    console.error("[PermissionsService] Error granting permission:", error);
    return false;
  }
}

/**
 * Revoke all permissions for a professional
 */
export async function revokeAllPermissions(
  studentId: number,
  professionalId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .delete(permissions)
      .where(
        and(
          eq(permissions.studentId, studentId),
          eq(permissions.professionalId, professionalId)
        )
      );

    console.log(
      `[PermissionsService] Revoked all permissions for professional ${professionalId} for student ${studentId}`
    );
    return true;
  } catch (error) {
    console.error("[PermissionsService] Error revoking permissions:", error);
    return false;
  }
}

/**
 * Update specific permission
 */
export async function updatePermission(
  studentId: number,
  professionalId: number,
  permission: keyof PermissionSet,
  value: boolean
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const updateData: Record<string, boolean> = {};
    updateData[permission] = value;

    await db
      .update(permissions)
      .set(updateData)
      .where(
        and(
          eq(permissions.studentId, studentId),
          eq(permissions.professionalId, professionalId)
        )
      );

    console.log(
      `[PermissionsService] Updated ${permission} to ${value} for professional ${professionalId}`
    );
    return true;
  } catch (error) {
    console.error("[PermissionsService] Error updating permission:", error);
    return false;
  }
}

/**
 * Get permission statistics for a student
 */
export async function getPermissionStats(studentId: number): Promise<{
  totalProfessionalsWithAccess: number;
  professionalsByPermission: {
    photos: number;
    exams: number;
    training: number;
    nutrition: number;
    supplements: number;
  };
}> {
  const db = await getDb();
  if (!db) {
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

  try {
    const perms = await db
      .select()
      .from(permissions)
      .where(eq(permissions.studentId, studentId));

    return {
      totalProfessionalsWithAccess: perms.length,
      professionalsByPermission: {
        photos: perms.filter((p: any) => p.canViewPhotos).length,
        exams: perms.filter((p: any) => p.canViewExams).length,
        training: perms.filter((p: any) => p.canViewTraining).length,
        nutrition: perms.filter((p: any) => p.canViewNutrition).length,
        supplements: perms.filter((p: any) => p.canViewSupplements).length,
      },
    };
  } catch (error) {
    console.error(
      "[PermissionsService] Error getting permission stats:",
      error
    );
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
}
