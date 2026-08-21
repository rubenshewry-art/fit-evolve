import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as medicationService from "./medication-service";

const optionalDate = z.coerce.date().optional();

export const medicationRouter = router({
  listPlans: protectedProcedure.query(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) throw new Error("Student profile not found");
    return medicationService.listMedicationPlans(student.id);
  }),

  createPlan: protectedProcedure
    .input(
      z.object({
        medicationName: z.string().trim().min(2).max(120),
        activeIngredient: z.string().trim().min(2).max(120),
        therapeuticClass: z.string().trim().min(2).max(120),
        indication: z.string().trim().max(255).optional(),
        prescriberName: z.string().trim().max(160).optional(),
        prescriptionDate: optionalDate,
        startDate: optionalDate,
        sourceUrl: z.string().url().max(500).optional(),
        notes: z.string().trim().max(2000).optional(),
        consentToShare: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) throw new Error("Student profile not found");
      return medicationService.createMedicationPlan(student.id, input);
    }),

  listApplications: protectedProcedure
    .input(z.object({ planId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) throw new Error("Student profile not found");
      return medicationService.listMedicationApplications(input.planId, student.id);
    }),

  recordApplication: protectedProcedure
    .input(
      z.object({
        planId: z.number().int().positive(),
        appliedAt: optionalDate,
        doseText: z.string().trim().max(80).optional(),
        notes: z.string().trim().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) throw new Error("Student profile not found");
      const { planId, ...data } = input;
      return medicationService.recordMedicationApplication(planId, student.id, data);
    }),

  listEvents: protectedProcedure
    .input(z.object({ planId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) throw new Error("Student profile not found");
      return medicationService.listMedicationEvents(input.planId, student.id);
    }),

  recordEvent: protectedProcedure
    .input(
      z.object({
        planId: z.number().int().positive(),
        eventType: z.enum(["nausea", "diarrhea", "vomiting", "constipation", "abdominal_pain", "other"]),
        severity: z.enum(["mild", "moderate", "severe"]),
        occurredAt: optionalDate,
        notes: z.string().trim().max(1000).optional(),
        needsProfessionalReview: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) throw new Error("Student profile not found");
      const { planId, ...data } = input;
      return medicationService.recordMedicationEvent(planId, student.id, data);
    }),
});
