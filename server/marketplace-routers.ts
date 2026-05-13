import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import {
  searchProfessionals,
  getProfessionalDetails,
  getProfessionalShowcase,
  connectWithProfessional,
  getSpecialties,
  getProfessionalsByPlan,
} from "./marketplace-service";

export const marketplaceRouter = router({
  search: publicProcedure
    .input(
      z.object({
        specialty: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }: any) => {
      return await searchProfessionals(input.specialty, input.limit, input.offset);
    }),

  getDetails: publicProcedure
    .input(z.object({ professionalId: z.number() }))
    .query(async ({ input }: any) => {
      const professional = await getProfessionalDetails(input.professionalId);
      if (!professional) {
        throw new Error("Professional not found");
      }
      return professional;
    }),

  getShowcase: publicProcedure
    .input(z.object({ professionalId: z.number(), limit: z.number().default(12) }))
    .query(async ({ input }: any) => {
      return await getProfessionalShowcase(input.professionalId, input.limit);
    }),

  connect: protectedProcedure
    .input(z.object({ professionalId: z.number() }))
    .mutation(async ({ input, ctx }: any) => {
      const studentId = ctx.user?.id;
      if (!studentId) {
        throw new Error("Not authenticated");
      }

      await connectWithProfessional(studentId, input.professionalId);
      return { success: true };
    }),

  getSpecialties: publicProcedure.query(async () => {
    return await getSpecialties();
  }),

  getByPlan: publicProcedure
    .input(z.object({ plan: z.enum(["free", "pro", "enterprise"]) }))
    .query(async ({ input }: any) => {
      return await getProfessionalsByPlan(input.plan);
    }),
});
