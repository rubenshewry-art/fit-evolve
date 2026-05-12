import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  students,
  professionals,
  permissions,
  photos,
  posts,
  exams,
  insights,
  badges,
  studentBadges,
  dailyTips,
  reports,
  subscriptions,
  notifications,
  type InsertStudent,
  type InsertProfessional,
  type InsertPhoto,
  type InsertPost,
  type InsertExam,
  type InsertInsight,
  type InsertBadge,
  type InsertStudentBadge,
  type InsertReport,
  type InsertSubscription,
  type InsertNotification,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Student Queries
 */

export async function createStudent(data: InsertStudent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(students).values(data);
  return result[0]?.insertId || 0;
}

export async function getStudentByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(students).where(eq(students.userId, userId));
  return result[0] || null;
}

export async function updateStudent(studentId: number, data: Partial<InsertStudent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(students).set(data).where(eq(students.id, studentId));
}

/**
 * Professional Queries
 */

export async function createProfessional(data: InsertProfessional) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(professionals).values(data);
  return result[0]?.insertId || 0;
}

export async function getProfessionalByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(professionals)
    .where(eq(professionals.userId, userId));
  return result[0] || null;
}

export async function updateProfessional(
  professionalId: number,
  data: Partial<InsertProfessional>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(professionals).set(data).where(eq(professionals.id, professionalId));
}

/**
 * Permission Queries
 */

export async function grantPermission(data: {
  studentId: number;
  professionalId: number;
  canViewPhotos?: boolean;
  canViewExams?: boolean;
  canViewTraining?: boolean;
  canViewNutrition?: boolean;
  canViewSupplements?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(permissions).values(data);
  return result[0]?.insertId || 0;
}

export async function getPermission(studentId: number, professionalId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(permissions)
    .where(and(eq(permissions.studentId, studentId), eq(permissions.professionalId, professionalId)));
  return result[0] || null;
}

export async function updatePermission(
  studentId: number,
  professionalId: number,
  data: Partial<{
    canViewPhotos: boolean;
    canViewExams: boolean;
    canViewTraining: boolean;
    canViewNutrition: boolean;
    canViewSupplements: boolean;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(permissions)
    .set(data)
    .where(
      and(
        eq(permissions.studentId, studentId),
        eq(permissions.professionalId, professionalId)
      )
    );
}

/**
 * Photo Queries
 */

export async function createPhoto(data: InsertPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(photos).values(data);
  return result[0]?.insertId || 0;
}

export async function getPhotosByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(photos).where(eq(photos.studentId, studentId));
}

export async function deletePhoto(photoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(photos).where(eq(photos.id, photoId));
}

/**
 * Post Queries
 */

export async function createPost(data: InsertPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(posts).values(data);
  return result[0]?.insertId || 0;
}

export async function getPostsByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(posts).where(eq(posts.studentId, studentId));
}

export async function getPublicPosts() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(posts).where(eq(posts.isPublic, true));
}

export async function updatePost(postId: number, data: Partial<InsertPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(posts).set(data).where(eq(posts.id, postId));
}

export async function deletePost(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(posts).where(eq(posts.id, postId));
}

/**
 * Exam Queries
 */

export async function createExam(data: InsertExam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(exams).values(data);
  return result[0]?.insertId || 0;
}

export async function getExamsByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(exams).where(eq(exams.studentId, studentId));
}

export async function updateExam(examId: number, data: Partial<InsertExam>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(exams).set(data).where(eq(exams.id, examId));
}

export async function deleteExam(examId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(exams).where(eq(exams.id, examId));
}

/**
 * Insight Queries
 */

export async function createInsight(data: InsertInsight) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(insights).values(data);
  return result[0]?.insertId || 0;
}

export async function getInsightsByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(insights).where(eq(insights.studentId, studentId));
}

export async function markInsightAsRead(insightId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(insights).set({ isRead: true }).where(eq(insights.id, insightId));
}

/**
 * Badge Queries
 */

export async function getAllBadges() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(badges);
}

export async function createBadge(data: InsertBadge) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(badges).values(data);
  return result[0]?.insertId || 0;
}

export async function awardBadgeToStudent(data: InsertStudentBadge) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(studentBadges).values(data);
  return result[0]?.insertId || 0;
}

export async function getStudentBadges(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(studentBadges)
    .where(eq(studentBadges.studentId, studentId));
}

/**
 * Daily Tip Queries
 */

export async function getRandomDailyTip() {
  const db = await getDb();
  if (!db) return null;

  // Get a random tip (MySQL specific) - simplified approach
  const allTips = await db.select().from(dailyTips);
  if (allTips.length === 0) return null;
  return allTips[Math.floor(Math.random() * allTips.length)];
}

/**
 * Report Queries
 */

export async function createReport(data: InsertReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reports).values(data);
  return result[0]?.insertId || 0;
}

export async function getReportByStudentAndMonth(studentId: number, month: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(reports)
    .where(and(eq(reports.studentId, studentId), eq(reports.month, month)));
  return result[0] || null;
}

export async function getStudentReports(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(reports).where(eq(reports.studentId, studentId));
}

/**
 * Subscription Queries
 */

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(subscriptions).values(data);
  return result[0]?.insertId || 0;
}

export async function getSubscriptionByProfessional(professionalId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.professionalId, professionalId));
  return result[0] || null;
}

export async function updateSubscription(
  subscriptionId: number,
  data: Partial<InsertSubscription>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(subscriptions).set(data).where(eq(subscriptions.id, subscriptionId));
}

/**
 * Notification Queries
 */

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values(data);
  return result[0]?.insertId || 0;
}

export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(notifications).where(eq(notifications.userId, userId));
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}
