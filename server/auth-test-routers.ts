import { z } from 'zod'
import { publicProcedure, router } from './_core/trpc'
import { getDb } from './db'

/**
 * Router de autenticação para testes
 * Permite login com email/senha para fins de desenvolvimento
 */
export const authTestRouter = router({
  /**
   * Login de teste com email e senha
   */
  testLogin: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb()

      // Verificar credenciais de teste
      if (
        input.email === 'aluno@fitevolve.com' &&
        input.password === 'teste123'
      ) {
        // Retornar token de teste
        return {
          success: true,
          token: 'test-token-aluno-fitevolve-' + Date.now(),
          user: {
            id: 1,
            email: 'aluno@fitevolve.com',
            name: 'João Silva',
            userType: 'student',
          },
        }
      }

      // Profissionais de teste
      const professionals: Record<
        string,
        { id: number; name: string; specialty: string }
      > = {
        'personal@fitevolve.com': {
          id: 2,
          name: 'Carlos Personal Trainer',
          specialty: 'Personal Trainer',
        },
        'nutri@fitevolve.com': {
          id: 3,
          name: 'Dra. Nutricionista Ana',
          specialty: 'Nutricionista',
        },
        'fisio@fitevolve.com': {
          id: 4,
          name: 'Fisioterapeuta Pedro',
          specialty: 'Fisioterapeuta',
        },
      }

      if (
        input.password === 'teste123' &&
        input.email in professionals
      ) {
        const prof = professionals[input.email as keyof typeof professionals]
        return {
          success: true,
          token: 'test-token-prof-' + prof.id + '-' + Date.now(),
          user: {
            id: prof.id,
            email: input.email,
            name: prof.name,
            userType: 'professional',
          },
        }
      }

      throw new Error('Email ou senha inválidos')
    }),

  /**
   * Verificar se o token de teste é válido
   */
  verifyTestToken: publicProcedure
    .input(z.string())
    .query(async ({ input: token }) => {
      // Tokens de teste começam com 'test-token-'
      if (!token.startsWith('test-token-')) {
        return { valid: false }
      }

      // Verificar se o token não expirou (válido por 24 horas)
      const parts = token.split('-')
      const timestamp = parseInt(parts[parts.length - 1])
      const now = Date.now()
      const maxAge = 24 * 60 * 60 * 1000 // 24 horas

      if (now - timestamp > maxAge) {
        return { valid: false }
      }

      return { valid: true }
    }),

  /**
   * Logout de teste
   */
  testLogout: publicProcedure.mutation(async () => {
    return { success: true }
  }),
})
