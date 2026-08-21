import { and, desc, eq } from "drizzle-orm";
import {
  medicationApplications,
  medicationEvents,
  medicationPlans,
  type InsertMedicationApplication,
  type InsertMedicationEvent,
  type InsertMedicationPlan,
  type MedicationApplication,
  type MedicationEvent,
  type MedicationPlan,
} from "../drizzle/schema";
import { getDb } from "./db";

export type MedicationPlanInput = {
  medicationName: string;
  activeIngredient: string;
  therapeuticClass: string;
  indication?: string;
  prescriberName?: string;
  prescriptionDate?: Date;
  startDate?: Date;
  sourceUrl?: string;
  notes?: string;
  consentToShare?: boolean;
};

export async function listMedicationPlans(studentId: number): Promise<MedicationPlan[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(medicationPlans)
    .where(eq(medicationPlans.studentId, studentId))
    .orderBy(desc(medicationPlans.createdAt));
}

export async function createMedicationPlan(
  studentId: number,
  input: MedicationPlanInput,
): Promise<MedicationPlan> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const data: InsertMedicationPlan = {
    studentId,
    medicationName: input.medicationName,
    activeIngredient: input.activeIngredient,
    therapeuticClass: input.therapeuticClass,
    indication: input.indication,
    prescriberName: input.prescriberName,
    prescriptionDate: input.prescriptionDate,
    startDate: input.startDate,
    sourceUrl: input.sourceUrl,
    notes: input.notes,
    consentToShare: input.consentToShare ?? false,
    status: "active",
  };

  const result = await db.insert(medicationPlans).values(data);
  const id = result[0]?.insertId;
  if (!id) throw new Error("Failed to create medication plan");

  const created = await db
    .select()
    .from(medicationPlans)
    .where(and(eq(medicationPlans.id, id), eq(medicationPlans.studentId, studentId)))
    .limit(1);

  if (!created[0]) throw new Error("Failed to retrieve medication plan");
  return created[0];
}

async function getOwnedPlan(planId: number, studentId: number): Promise<MedicationPlan | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(medicationPlans)
    .where(and(eq(medicationPlans.id, planId), eq(medicationPlans.studentId, studentId)))
    .limit(1);

  return result[0] ?? null;
}

export async function listMedicationApplications(
  planId: number,
  studentId: number,
): Promise<MedicationApplication[]> {
  const db = await getDb();
  if (!db) return [];
  if (!(await getOwnedPlan(planId, studentId))) return [];

  return db
    .select()
    .from(medicationApplications)
    .where(and(eq(medicationApplications.planId, planId), eq(medicationApplications.studentId, studentId)))
    .orderBy(desc(medicationApplications.appliedAt));
}

export async function recordMedicationApplication(
  planId: number,
  studentId: number,
  input: { appliedAt?: Date; doseText?: string; notes?: string },
): Promise<MedicationApplication> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!(await getOwnedPlan(planId, studentId))) throw new Error("Medication plan not found");

  const data: InsertMedicationApplication = {
    planId,
    studentId,
    appliedAt: input.appliedAt ?? new Date(),
    doseText: input.doseText,
    notes: input.notes,
  };
  const result = await db.insert(medicationApplications).values(data);
  const id = result[0]?.insertId;
  if (!id) throw new Error("Failed to record application");

  const created = await db
    .select()
    .from(medicationApplications)
    .where(and(eq(medicationApplications.id, id), eq(medicationApplications.studentId, studentId)))
    .limit(1);
  if (!created[0]) throw new Error("Failed to retrieve application");
  return created[0];
}

export async function listMedicationEvents(
  planId: number,
  studentId: number,
): Promise<MedicationEvent[]> {
  const db = await getDb();
  if (!db) return [];
  if (!(await getOwnedPlan(planId, studentId))) return [];

  return db
    .select()
    .from(medicationEvents)
    .where(and(eq(medicationEvents.planId, planId), eq(medicationEvents.studentId, studentId)))
    .orderBy(desc(medicationEvents.occurredAt));
}

export async function recordMedicationEvent(
  planId: number,
  studentId: number,
  input: {
    eventType: "nausea" | "diarrhea" | "vomiting" | "constipation" | "abdominal_pain" | "other";
    severity: "mild" | "moderate" | "severe";
    occurredAt?: Date;
    notes?: string;
    needsProfessionalReview?: boolean;
  },
): Promise<MedicationEvent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!(await getOwnedPlan(planId, studentId))) throw new Error("Medication plan not found");

  const data: InsertMedicationEvent = {
    planId,
    studentId,
    eventType: input.eventType,
    severity: input.severity,
    occurredAt: input.occurredAt ?? new Date(),
    notes: input.notes,
    needsProfessionalReview: input.needsProfessionalReview ?? input.severity === "severe",
  };
  const result = await db.insert(medicationEvents).values(data);
  const id = result[0]?.insertId;
  if (!id) throw new Error("Failed to record medication event");

  const created = await db
    .select()
    .from(medicationEvents)
    .where(and(eq(medicationEvents.id, id), eq(medicationEvents.studentId, studentId)))
    .limit(1);
  if (!created[0]) throw new Error("Failed to retrieve medication event");
  return created[0];
}
