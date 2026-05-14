/**
 * Profile Service
 * 
 * Handles student profile data, statistics, and profile updates.
 */

import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { students, posts, exams, studentBadges, professionals } from "../drizzle/schema";

export interface StudentProfile {
  id: number;
  userId: number;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  type: "student" | "professional";
  academyId?: number;
  createdAt: Date;
}

export interface StudentStats {
  totalPhotos: number;
  totalExams: number;
  totalPosts: number;
  totalBadges: number;
  joinedDate: Date;
}

export interface StudentProfileWithStats extends StudentProfile {
  stats: StudentStats;
  badges: Array<{
    id: number;
    badgeId: number;
    earnedAt: Date;
  }>;
}

/**
 * Get student profile with stats
 */
export async function getStudentProfileWithStats(
  studentId: number
): Promise<StudentProfileWithStats | null> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Get student data
    const studentData = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId));

    if (!studentData.length) {
      return null;
    }

    const student = studentData[0] as any;

    // Get statistics
    const postsData = await db
      .select()
      .from(posts)
      .where(eq(posts.studentId, studentId));

    const examsData = await db
      .select()
      .from(exams)
      .where(eq(exams.studentId, studentId));

    const badgesData = await db
      .select()
      .from(studentBadges)
      .where(eq(studentBadges.studentId, studentId));

    // Get badges details
    const badges = badgesData.map((b: any) => ({
      id: b.id,
      badgeId: b.badgeId,
      earnedAt: b.earnedAt,
    }));

    return {
      id: student.id,
      userId: student.userId,
      name: student.name || "Aluno",
      email: student.email || "",
      bio: student.bio,
      avatarUrl: student.avatarUrl,
      type: student.type || "student",
      academyId: student.academyId,
      createdAt: student.createdAt,
      stats: {
        totalPhotos: 0, // TODO: Query photo vault
        totalExams: examsData.length,
        totalPosts: postsData.length,
        totalBadges: badgesData.length,
        joinedDate: student.createdAt,
      },
      badges,
    };
  } catch (error) {
    console.error("[ProfileService] Error getting student profile:", error);
    return null;
  }
}

/**
 * Update student profile
 */
export async function updateStudentProfile(
  studentId: number,
  updates: {
    name?: string;
    bio?: string;
    avatarUrl?: string;
  }
) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.bio) updateData.bio = updates.bio;
    if (updates.avatarUrl) updateData.avatarUrl = updates.avatarUrl;

    if (Object.keys(updateData).length === 0) {
      throw new Error("No updates provided");
    }

    await db.update(students).set(updateData).where(eq(students.id, studentId));

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("[ProfileService] Error updating profile:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update profile"
    );
  }
}

/**
 * Get student statistics
 */
export async function getStudentStats(studentId: number): Promise<StudentStats> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const studentData = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId));

    if (!studentData.length) {
      throw new Error("Student not found");
    }

    const student = studentData[0] as any;

    const postsData = await db
      .select()
      .from(posts)
      .where(eq(posts.studentId, studentId));

    const examsData = await db
      .select()
      .from(exams)
      .where(eq(exams.studentId, studentId));

    const badgesData = await db
      .select()
      .from(studentBadges)
      .where(eq(studentBadges.studentId, studentId));

    return {
      totalPhotos: 0, // TODO: Query photo vault
      totalExams: examsData.length,
      totalPosts: postsData.length,
      totalBadges: badgesData.length,
      joinedDate: student.createdAt,
    };
  } catch (error) {
    console.error("[ProfileService] Error getting stats:", error);
    return {
      totalPhotos: 0,
      totalExams: 0,
      totalPosts: 0,
      totalBadges: 0,
      joinedDate: new Date(),
    };
  }
}

/**
 * Get student badges with details
 */
export async function getStudentBadgesWithDetails(studentId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const badgesData = await db
      .select()
      .from(studentBadges)
      .where(eq(studentBadges.studentId, studentId));

    return badgesData.map((b: any) => ({
      id: b.id,
      badgeId: b.badgeId,
      earnedAt: b.earnedAt,
    }));
  } catch (error) {
    console.error("[ProfileService] Error getting badges:", error);
    return [];
  }
}

/**
 * Calculate profile completion percentage
 */
export async function getProfileCompletion(
  studentId: number
): Promise<number> {
  try {
    const profile = await getStudentProfileWithStats(studentId);
    if (!profile) return 0;

    let completion = 0;
    let maxPoints = 0;

    // Name (20 points)
    maxPoints += 20;
    if (profile.name && profile.name.length > 0) completion += 20;

    // Bio (20 points)
    maxPoints += 20;
    if (profile.bio && profile.bio.length > 0) completion += 20;

    // Avatar (20 points)
    maxPoints += 20;
    if (profile.avatarUrl) completion += 20;

    // Photos (15 points)
    maxPoints += 15;
    if (profile.stats.totalPhotos > 0) completion += 15;

    // Posts (15 points)
    maxPoints += 15;
    if (profile.stats.totalPosts > 0) completion += 15;

    // Exams (10 points)
    maxPoints += 10;
    if (profile.stats.totalExams > 0) completion += 10;

    return Math.round((completion / maxPoints) * 100);
  } catch (error) {
    console.error("[ProfileService] Error calculating completion:", error);
    return 0;
  }
}

/**
 * Get profile completion details
 */
export async function getProfileCompletionDetails(
  studentId: number
): Promise<{
  completion: number;
  items: Array<{
    name: string;
    completed: boolean;
    points: number;
  }>;
}> {
  try {
    const profile = await getStudentProfileWithStats(studentId);
    if (!profile) {
      return { completion: 0, items: [] };
    }

    const items: Array<{ name: string; completed: boolean; points: number }> = [
      {
        name: "Nome completo",
        completed: !!(profile.name && profile.name.length > 0),
        points: 20,
      },
      {
        name: "Bio/Descricao",
        completed: !!(profile.bio && profile.bio.length > 0),
        points: 20,
      },
      {
        name: "Foto de perfil",
        completed: !!profile.avatarUrl,
        points: 20,
      },
      {
        name: "Primeira foto de evolucao",
        completed: profile.stats.totalPhotos > 0,
        points: 15,
      },
      {
        name: "Primeiro post",
        completed: profile.stats.totalPosts > 0,
        points: 15,
      },
      {
        name: "Primeiro exame",
        completed: profile.stats.totalExams > 0,
        points: 10,
      },
    ];

    const completion = Math.round(
      (items.reduce((sum, item) => sum + (item.completed ? item.points : 0), 0) /
        items.reduce((sum, item) => sum + item.points, 0)) *
        100
    );

    return { completion, items };
  } catch (error) {
    console.error("[ProfileService] Error getting completion details:", error);
    return { completion: 0, items: [] };
  }
}

/**
 * Mark onboarding as completed for a student
 */
export async function markOnboardingCompleted(studentId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    await db
      .update(students)
      .set({ onboardingCompleted: true })
      .where(eq(students.id, studentId));

    return { success: true, message: "Onboarding marked as completed" };
  } catch (error) {
    console.error("[ProfileService] Error marking onboarding completed:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to mark onboarding completed"
    );
  }
}

/**
 * Check if student has completed onboarding
 */
export async function hasCompletedOnboarding(studentId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const studentData = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId));

    if (!studentData.length) {
      return false;
    }

    const student = studentData[0] as any;
    return student.onboardingCompleted === true;
  } catch (error) {
    console.error("[ProfileService] Error checking onboarding status:", error);
    return false;
  }
}

/**
 * Mark onboarding as completed for a professional
 */
export async function markProfessionalOnboardingCompleted(professionalId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    await db
      .update(professionals)
      .set({ onboardingCompleted: true })
      .where(eq(professionals.id, professionalId));

    return { success: true, message: "Professional onboarding marked as completed" };
  } catch (error) {
    console.error("[ProfileService] Error marking professional onboarding completed:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to mark professional onboarding completed"
    );
  }
}

/**
 * Check if professional has completed onboarding
 */
export async function hasProfessionalCompletedOnboarding(professionalId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const professionalData = await db
      .select()
      .from(professionals)
      .where(eq(professionals.id, professionalId));

    if (!professionalData.length) {
      return false;
    }

    const professional = professionalData[0] as any;
    return professional.onboardingCompleted === true;
  } catch (error) {
    console.error("[ProfileService] Error checking professional onboarding status:", error);
    return false;
  }
}
