import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { examRouter } from "./exam-routers";
import { examComparisonRouter } from "./exam-comparison-routers";
import { privacyRouter } from "./privacy-routers";
import { socialRouter } from "./social-routers";
import { profileRouter } from "./profile-routers";
import { marketplaceRouter } from "./marketplace-routers";
import { timelapseRouter } from "./timelapse-routers";
import { authTestRouter } from "./auth-test-routers";
import { routinesRouter } from "./routines-routers";
import { medicationRouter } from "./medication-routers";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    ...authTestRouter._def.procedures,
  }),

  // Exam and OCR Analysis routes
  exam: examRouter,

  // Exam Comparison and History routes
  examComparison: examComparisonRouter,

  // Privacy and Permissions routes
  privacy: privacyRouter,

  // Social Feed routes
  social: socialRouter,

  // Profile routes
  profile: profileRouter,

  // Marketplace routes
  marketplace: marketplaceRouter,

  // Timelapse routes
  timelapse: timelapseRouter,

  // Routines routes
  routines: routinesRouter,

  // Medication tracking and safety routes
  medication: medicationRouter,

  // Auth Test routes (for development)
  authTest: authTestRouter,

  // Test login for development
  // Usage: POST /api/trpc/authTest.testLogin
  // Body: { email: "aluno@fitevolve.com", password: "teste123" }

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
