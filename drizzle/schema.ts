import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Students Table
 * Extended profile for students (alunos)
 */
export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bio: text("bio"),
  fitnessGoal: varchar("fitnessGoal", { length: 255 }),
  academyId: int("academyId"),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Professionals Table
 * Extended profile for professionals (Personal, Nutricionista, Fisioterapeuta)
 */
export const professionals = mysqlTable("professionals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  specialties: json("specialties").$type<string[]>().notNull(),
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  bio: text("bio"),
  academyId: int("academyId"),
  plan: mysqlEnum("plan", ["free", "pro", "enterprise"]).default("free").notNull(),
  studentCount: int("studentCount").default(0).notNull(),
  maxStudents: int("maxStudents").default(5).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Academies Table
 * Physical academies/gyms
 */
export const academies = mysqlTable("academies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  photoUrl: text("photoUrl"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Permissions Table
 * Controls what data each professional can access for each student
 */
export const permissions = mysqlTable("permissions", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  professionalId: int("professionalId").notNull(),
  canViewPhotos: boolean("canViewPhotos").default(false).notNull(),
  canViewExams: boolean("canViewExams").default(false).notNull(),
  canViewTraining: boolean("canViewTraining").default(false).notNull(),
  canViewNutrition: boolean("canViewNutrition").default(false).notNull(),
  canViewSupplements: boolean("canViewSupplements").default(false).notNull(),
  grantedAt: timestamp("grantedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Photos Table
 * Metadata for progress photos (stored in S3)
 */
export const photos = mysqlTable("photos", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  photoUrl: text("photoUrl").notNull(),
  angle: varchar("angle", { length: 50 }).notNull(),
  isPrivate: boolean("isPrivate").default(true).notNull(),
  capturedAt: timestamp("capturedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Posts Table
 * Social feed posts (conquistas)
 */
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  photoId: int("photoId"),
  caption: text("caption"),
  isPublic: boolean("isPublic").default(false).notNull(),
  markedProfessionalIds: json("markedProfessionalIds").$type<number[]>().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Exams Table
 * Medical/laboratory exams uploaded by students
 */
export const exams = mysqlTable("exams", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  examType: varchar("examType", { length: 100 }).notNull(),
  examUrl: text("examUrl").notNull(),
  extractedData: json("extractedData").$type<Record<string, unknown>>().notNull(),
  isSharedWithProfessionals: boolean("isSharedWithProfessionals").default(false).notNull(),
  examDate: timestamp("examDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Insights Table
 * AI-generated insights based on student data
 */
export const insights = mysqlTable("insights", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  professionalId: int("professionalId"),
  insightType: varchar("insightType", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  recommendation: text("recommendation"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Badges Table
 * Gamification: achievements and badges
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: text("icon"),
  criteria: varchar("criteria", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Student Badges Table
 * Tracks which badges each student has earned
 */
export const studentBadges = mysqlTable("studentBadges", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  badgeId: int("badgeId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

/**
 * Daily Tips Table
 * Motivational phrases and personalized tips
 */
export const dailyTips = mysqlTable("dailyTips", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["motivation", "training", "nutrition", "health"]).notNull(),
  content: text("content").notNull(),
  author: varchar("author", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Reports Table
 * Monthly consolidated reports
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  month: varchar("month", { length: 7 }).notNull(),
  photoCount: int("photoCount").default(0).notNull(),
  examCount: int("examCount").default(0).notNull(),
  badgesEarned: int("badgesEarned").default(0).notNull(),
  insights: json("insights").$type<unknown[]>().notNull(),
  pdfUrl: text("pdfUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Subscriptions Table
 * Professional subscription plans
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  professionalId: int("professionalId").notNull(),
  plan: mysqlEnum("plan", ["free", "pro", "enterprise"]).notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  renewalDate: timestamp("renewalDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Routines Table
 * Daily routines for students
 */
export const routines = mysqlTable("routines", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  time: varchar("time", { length: 5 }), // HH:MM format
  frequency: mysqlEnum("frequency", ["daily", "weekdays", "weekends", "custom"]).default("daily").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  reminderEnabled: boolean("reminderEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Routine Completions Table
 * Track daily routine completions
 */
export const routineCompletions = mysqlTable("routineCompletions", {
  id: int("id").autoincrement().primaryKey(),
  routineId: int("routineId").notNull(),
  studentId: int("studentId").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Notifications Table
 * Push notifications and in-app notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  relatedId: int("relatedId"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Export types
export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

export type Professional = typeof professionals.$inferSelect;
export type InsertProfessional = typeof professionals.$inferInsert;

export type Academy = typeof academies.$inferSelect;
export type InsertAcademy = typeof academies.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

export type Exam = typeof exams.$inferSelect;
export type InsertExam = typeof exams.$inferInsert;

export type Insight = typeof insights.$inferSelect;
export type InsertInsight = typeof insights.$inferInsert;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

export type StudentBadge = typeof studentBadges.$inferSelect;
export type InsertStudentBadge = typeof studentBadges.$inferInsert;

export type DailyTip = typeof dailyTips.$inferSelect;
export type InsertDailyTip = typeof dailyTips.$inferInsert;

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export type Routine = typeof routines.$inferSelect;
export type InsertRoutine = typeof routines.$inferInsert;

export type RoutineCompletion = typeof routineCompletions.$inferSelect;
export type InsertRoutineCompletion = typeof routineCompletions.$inferInsert;
