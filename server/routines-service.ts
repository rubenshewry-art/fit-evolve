/**
 * Routines Service
 * 
 * Business logic for managing student routines
 */

import { eq, and, gte } from "drizzle-orm";
import { routines, routineCompletions, type Routine, type InsertRoutine, type RoutineCompletion, type InsertRoutineCompletion } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get all routines for a student
 */
export async function getStudentRoutines(studentId: number): Promise<Routine[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const result = await db
      .select()
      .from(routines)
      .where(eq(routines.studentId, studentId))
      .orderBy(routines.time);

    return result;
  } catch (error) {
    console.error("[RoutinesService] Error getting routines:", error);
    throw error;
  }
}

/**
 * Get a single routine by ID
 */
export async function getRoutineById(routineId: number, studentId: number): Promise<Routine | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(routines)
      .where(and(eq(routines.id, routineId), eq(routines.studentId, studentId)))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[RoutinesService] Error getting routine:", error);
    throw error;
  }
}

/**
 * Create a new routine
 */
export async function createRoutine(
  studentId: number,
  data: {
    title: string;
    description?: string;
    time?: string;
    frequency?: "daily" | "weekdays" | "weekends" | "custom";
    reminderEnabled?: boolean;
  }
): Promise<Routine> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const newRoutine: InsertRoutine = {
      studentId,
      title: data.title,
      description: data.description,
      time: data.time,
      frequency: data.frequency || "daily",
      reminderEnabled: data.reminderEnabled !== false,
      isActive: true,
    };

    const result = await db.insert(routines).values(newRoutine);
    const routineId = result[0]?.insertId;
    if (!routineId) throw new Error("Failed to create routine");

    const created = await getRoutineById(routineId, studentId);
    if (!created) throw new Error("Failed to retrieve created routine");
    return created;
  } catch (error) {
    console.error("[RoutinesService] Error creating routine:", error);
    throw error;
  }
}

/**
 * Update an existing routine
 */
export async function updateRoutine(
  routineId: number,
  studentId: number,
  data: {
    title?: string;
    description?: string;
    time?: string;
    frequency?: "daily" | "weekdays" | "weekends" | "custom";
    isActive?: boolean;
    reminderEnabled?: boolean;
  }
): Promise<Routine> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const routine = await getRoutineById(routineId, studentId);
    if (!routine) {
      throw new Error("Routine not found");
    }

    await db.update(routines).set(data).where(eq(routines.id, routineId));

    const updated = await getRoutineById(routineId, studentId);
    if (!updated) throw new Error("Failed to retrieve updated routine");
    return updated;
  } catch (error) {
    console.error("[RoutinesService] Error updating routine:", error);
    throw error;
  }
}

/**
 * Delete a routine
 */
export async function deleteRoutine(routineId: number, studentId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const routine = await getRoutineById(routineId, studentId);
    if (!routine) {
      throw new Error("Routine not found");
    }

    await db.delete(routineCompletions).where(eq(routineCompletions.routineId, routineId));
    await db.delete(routines).where(eq(routines.id, routineId));
    return true;
  } catch (error) {
    console.error("[RoutinesService] Error deleting routine:", error);
    throw error;
  }
}

/**
 * Mark a routine as completed for today
 */
export async function completeRoutine(
  routineId: number,
  studentId: number,
  notes?: string
): Promise<RoutineCompletion> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const routine = await getRoutineById(routineId, studentId);
    if (!routine) {
      throw new Error("Routine not found");
    }

    const completion: InsertRoutineCompletion = {
      routineId,
      studentId,
      notes,
    };

    const result = await db.insert(routineCompletions).values(completion);
    const completionId = result[0]?.insertId;
    if (!completionId) throw new Error("Failed to create completion");

    const created = await db
      .select()
      .from(routineCompletions)
      .where(eq(routineCompletions.id, completionId))
      .limit(1);

    return created[0];
  } catch (error) {
    console.error("[RoutinesService] Error completing routine:", error);
    throw error;
  }
}

/**
 * Get routine completions for today
 */
export async function getTodayCompletions(studentId: number): Promise<RoutineCompletion[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completions = await db
      .select()
      .from(routineCompletions)
      .where(eq(routineCompletions.studentId, studentId));

    // Filter for today's completions
    return completions.filter((c: RoutineCompletion) => {
      const completedDate = new Date(c.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    });
  } catch (error) {
    console.error("[RoutinesService] Error getting today completions:", error);
    throw error;
  }
}

/**
 * Get routine statistics
 */
export async function getRoutineStats(studentId: number) {
  try {
    const routines = await getStudentRoutines(studentId);
    const todayCompletions = await getTodayCompletions(studentId);

    return {
      totalRoutines: routines.length,
      activeRoutines: routines.filter((r) => r.isActive).length,
      completedToday: todayCompletions.length,
      completionRate: routines.length > 0 ? (todayCompletions.length / routines.length) * 100 : 0,
    };
  } catch (error) {
    console.error("[RoutinesService] Error getting routine stats:", error);
    throw error;
  }
}
