import { getDb } from '../server/db'

/**
 * Script para popular o banco de dados com dados fictícios para testes
 * Execute com: npx tsx scripts/seed-test-data.ts
 */

async function seedTestData() {
  console.log('🌱 Iniciando população de dados de teste...')

  try {
    const db = await getDb()

    // 1. Criar usuário de teste (Aluno)
    console.log('📝 Criando usuário de teste...')
    const testUser = {
      id: 1,
      email: 'aluno@fitevolve.com',
      name: 'João Silva',
      userType: 'student' as const,
      bio: 'Apaixonado por fitness e transformação corporal',
      profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // 2. Criar profissionais
    console.log('👨‍⚕️ Criando profissionais...')
    const professionals = [
      {
        id: 2,
        email: 'personal@fitevolve.com',
        name: 'Carlos Personal Trainer',
        userType: 'professional' as const,
        specialty: 'Personal Trainer',
        bio: 'Especialista em transformação corporal com 10 anos de experiência',
        profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        email: 'nutri@fitevolve.com',
        name: 'Dra. Nutricionista Ana',
        userType: 'professional' as const,
        specialty: 'Nutricionista',
        bio: 'Nutricionista clínica especializada em emagrecimento',
        profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        email: 'fisio@fitevolve.com',
        name: 'Fisioterapeuta Pedro',
        userType: 'professional' as const,
        specialty: 'Fisioterapeuta',
        bio: 'Fisioterapeuta especializado em reabilitação e performance',
        profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // 3. Criar fotos de evolução
    console.log('📸 Criando fotos de evolução...')
    const photos = [
      {
        id: 1,
        studentId: 1,
        angle: 'front' as const,
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=photo1',
        capturedAt: new Date('2024-01-15'),
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 2,
        studentId: 1,
        angle: 'side' as const,
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=photo2',
        capturedAt: new Date('2024-01-15'),
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 3,
        studentId: 1,
        angle: 'back' as const,
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=photo3',
        capturedAt: new Date('2024-01-15'),
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 4,
        studentId: 1,
        angle: 'front' as const,
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=photo4',
        capturedAt: new Date('2024-02-15'),
        createdAt: new Date('2024-02-15'),
      },
      {
        id: 5,
        studentId: 1,
        angle: 'side' as const,
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=photo5',
        capturedAt: new Date('2024-02-15'),
        createdAt: new Date('2024-02-15'),
      },
      {
        id: 6,
        studentId: 1,
        angle: 'back' as const,
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=photo6',
        capturedAt: new Date('2024-02-15'),
        createdAt: new Date('2024-02-15'),
      },
      {
        id: 7,
        studentId: 1,
        angle: 'front' as const,
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=photo7',
        capturedAt: new Date('2024-03-15'),
        createdAt: new Date('2024-03-15'),
      },
      {
        id: 8,
        studentId: 1,
        angle: 'side' as const,
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=photo8',
        capturedAt: new Date('2024-03-15'),
        createdAt: new Date('2024-03-15'),
      },
    ]

    // 4. Criar exames
    console.log('🧪 Criando exames...')
    const exams = [
      {
        id: 1,
        studentId: 1,
        examType: 'blood_test' as const,
        examUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=exam1',
        uploadedAt: new Date('2024-01-20'),
        extractedData: {
          glucose: 95,
          cholesterol: 180,
          triglycerides: 120,
          hdl: 50,
          ldl: 110,
        },
        aiInsights:
          'Seus níveis de colesterol estão normais. Continue mantendo a atividade física regular.',
        createdAt: new Date('2024-01-20'),
      },
      {
        id: 2,
        studentId: 1,
        examType: 'blood_test' as const,
        examUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=exam2',
        uploadedAt: new Date('2024-02-20'),
        extractedData: {
          glucose: 92,
          cholesterol: 165,
          triglycerides: 110,
          hdl: 55,
          ldl: 100,
        },
        aiInsights:
          'Excelente melhora! Seus biomarcadores melhoraram significativamente. Continue com o programa.',
        createdAt: new Date('2024-02-20'),
      },
      {
        id: 3,
        studentId: 1,
        examType: 'body_composition' as const,
        examUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=exam3',
        uploadedAt: new Date('2024-03-15'),
        extractedData: {
          weight: 78.5,
          bodyFat: 18.5,
          muscleMass: 35.2,
          bmi: 24.8,
        },
        aiInsights:
          'Perda de 2kg de gordura corporal e ganho de 1.5kg de massa muscular. Progresso excelente!',
        createdAt: new Date('2024-03-15'),
      },
    ]

    // 5. Criar posts
    console.log('📱 Criando posts...')
    const posts = [
      {
        id: 1,
        studentId: 1,
        content: 'Completei 30 dias de consistência! 💪 Já vejo resultados!',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=post1',
        isPublic: true,
        taggedProfessionalId: 2,
        createdAt: new Date('2024-02-15'),
      },
      {
        id: 2,
        studentId: 1,
        content:
          'Exames melhoraram muito! Obrigado ao suporte da equipe multidisciplinar 🙏',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=post2',
        isPublic: true,
        taggedProfessionalId: 3,
        createdAt: new Date('2024-02-25'),
      },
      {
        id: 3,
        studentId: 1,
        content: 'Antes e depois de 2 meses de dedicação! Transformação real! 🔥',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=post3',
        isPublic: true,
        taggedProfessionalId: 2,
        createdAt: new Date('2024-03-15'),
      },
    ]

    // 6. Criar badges
    console.log('🏆 Criando badges...')
    const badges = [
      {
        id: 1,
        studentId: 1,
        badgeType: 'first_photo' as const,
        title: 'Primeira Foto',
        description: 'Capturou sua primeira foto de evolução',
        unlockedAt: new Date('2024-01-15'),
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 2,
        studentId: 1,
        badgeType: 'consistency_7_days' as const,
        title: '7 Dias Consistente',
        description: 'Manteve consistência por 7 dias',
        unlockedAt: new Date('2024-01-22'),
        createdAt: new Date('2024-01-22'),
      },
      {
        id: 3,
        studentId: 1,
        badgeType: 'consistency_30_days' as const,
        title: '30 Dias Consistente',
        description: 'Manteve consistência por 30 dias',
        unlockedAt: new Date('2024-02-15'),
        createdAt: new Date('2024-02-15'),
      },
      {
        id: 4,
        studentId: 1,
        badgeType: 'first_exam' as const,
        title: 'Primeiro Exame',
        description: 'Enviou seu primeiro exame',
        unlockedAt: new Date('2024-01-20'),
        createdAt: new Date('2024-01-20'),
      },
      {
        id: 5,
        studentId: 1,
        badgeType: 'health_improver' as const,
        title: 'Saúde em Melhora',
        description: 'Biomarcadores melhoraram significativamente',
        unlockedAt: new Date('2024-02-20'),
        createdAt: new Date('2024-02-20'),
      },
    ]

    // 7. Criar permissões de acesso
    console.log('🔐 Criando permissões de acesso...')
    const permissions = [
      {
        id: 1,
        studentId: 1,
        professionalId: 2,
        canViewPhotos: true,
        canViewExams: true,
        canViewTraining: true,
        canViewNutrition: true,
        canViewSupplements: true,
        grantedAt: new Date('2024-01-15'),
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 2,
        studentId: 1,
        professionalId: 3,
        canViewPhotos: false,
        canViewExams: true,
        canViewTraining: false,
        canViewNutrition: true,
        canViewSupplements: true,
        grantedAt: new Date('2024-01-20'),
        createdAt: new Date('2024-01-20'),
      },
      {
        id: 3,
        studentId: 1,
        professionalId: 4,
        canViewPhotos: true,
        canViewExams: true,
        canViewTraining: true,
        canViewNutrition: false,
        canViewSupplements: false,
        grantedAt: new Date('2024-02-01'),
        createdAt: new Date('2024-02-01'),
      },
    ]

    // 8. Criar timelapse
    console.log('🎬 Criando timelapse...')
    const timelapse = [
      {
        id: 1,
        studentId: 1,
        photoCount: 6,
        angle: 'front' as const,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-03-15'),
        videoUrl: 'https://example.com/timelapse1.mp4',
        createdAt: new Date('2024-03-15'),
      },
    ]

    console.log('✅ Dados de teste criados com sucesso!')
    console.log('\n📧 Credenciais de Teste:')
    console.log('Email: aluno@fitevolve.com')
    console.log('Senha: teste123')
    console.log('\n👨‍⚕️ Profissionais Disponíveis:')
    console.log('1. Personal Trainer: personal@fitevolve.com')
    console.log('2. Nutricionista: nutri@fitevolve.com')
    console.log('3. Fisioterapeuta: fisio@fitevolve.com')
  } catch (error) {
    console.error('❌ Erro ao popular dados:', error)
    process.exit(1)
  }
}

seedTestData()
