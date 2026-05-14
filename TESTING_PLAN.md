# Plano de Testes — Fit_Evolve Frontend Mobile

## 📋 Visão Geral

Este documento descreve a estratégia de testes para o frontend mobile do Fit_Evolve usando **Vitest**, **React Native Testing Library** e **Mock Service Worker (MSW)**.

### Objetivos
- Garantir funcionalidade de todos os módulos principais
- Validar fluxos de usuário críticos (autenticação, câmera, feed, relatórios)
- Manter cobertura de código acima de 80%
- Detectar regressões antes do deploy

---

## 🏗️ Estrutura de Testes

### Organização de Arquivos
```
__tests__/
├── unit/
│   ├── hooks/
│   │   ├── use-auth.test.ts
│   │   ├── use-colors.test.ts
│   │   └── use-color-scheme.test.ts
│   ├── lib/
│   │   ├── photo-vault.test.ts
│   │   ├── exam-upload.test.ts
│   │   └── utils.test.ts
│   └── components/
│       ├── screen-container.test.tsx
│       ├── camera-overlay.test.tsx
│       └── haptic-tab.test.tsx
├── integration/
│   ├── auth-flow.test.tsx
│   ├── camera-flow.test.tsx
│   ├── feed-flow.test.tsx
│   ├── exam-upload-flow.test.tsx
│   ├── privacy-panel-flow.test.tsx
│   └── marketplace-flow.test.tsx
├── e2e/
│   ├── onboarding.test.tsx
│   ├── home-screen.test.tsx
│   ├── photo-capture.test.tsx
│   └── report-generation.test.tsx
└── mocks/
    ├── handlers.ts
    ├── server.ts
    └── data.ts
```

---

## 🧪 Categorias de Testes

### 1. Testes Unitários (Unit Tests)

#### 1.1 Hooks (`__tests__/unit/hooks/`)

**use-auth.test.ts**
```typescript
describe('useAuth', () => {
  it('should return user when authenticated', () => {})
  it('should return null when not authenticated', () => {})
  it('should login with OAuth', () => {})
  it('should logout and clear token', () => {})
  it('should persist token in SecureStore', () => {})
  it('should refresh token on expiry', () => {})
  it('should handle login errors', () => {})
})
```

**use-colors.test.ts**
```typescript
describe('useColors', () => {
  it('should return light theme colors', () => {})
  it('should return dark theme colors', () => {})
  it('should switch theme correctly', () => {})
  it('should return correct color tokens', () => {})
})
```

#### 1.2 Utilitários (`__tests__/unit/lib/`)

**photo-vault.test.ts**
```typescript
describe('PhotoVault', () => {
  it('should save photo to vault', () => {})
  it('should retrieve photo from vault', () => {})
  it('should encrypt photo data', () => {})
  it('should list all photos by angle', () => {})
  it('should delete photo from vault', () => {})
  it('should calculate vault statistics', () => {})
})
```

**exam-upload.test.ts**
```typescript
describe('ExamUpload', () => {
  it('should validate file size', () => {})
  it('should validate file type', () => {})
  it('should upload file to S3', () => {})
  it('should handle upload errors', () => {})
  it('should generate preview', () => {})
})
```

#### 1.3 Componentes (`__tests__/unit/components/`)

**screen-container.test.tsx**
```typescript
describe('ScreenContainer', () => {
  it('should render with safe area', () => {})
  it('should apply correct padding', () => {})
  it('should handle custom className', () => {})
  it('should render children correctly', () => {})
})
```

**camera-overlay.test.tsx**
```typescript
describe('CameraOverlay', () => {
  it('should render overlay guides', () => {})
  it('should display angle label', () => {})
  it('should show alignment indicators', () => {})
})
```

---

### 2. Testes de Integração (Integration Tests)

#### 2.1 Fluxo de Autenticação (`auth-flow.test.tsx`)

```typescript
describe('Authentication Flow', () => {
  it('should complete login flow end-to-end', async () => {
    // 1. Render login screen
    // 2. Enter credentials
    // 3. Submit form
    // 4. Verify API call
    // 5. Verify token storage
    // 6. Verify navigation to home
  })

  it('should handle login errors gracefully', async () => {
    // 1. Render login screen
    // 2. Enter invalid credentials
    // 3. Verify error message
    // 4. Verify user stays on login screen
  })

  it('should complete onboarding after login', async () => {
    // 1. Login
    // 2. Verify onboarding modal
    // 3. Complete slides
    // 4. Select user type
    // 5. Grant permissions
    // 6. Verify redirect to home
  })

  it('should persist session across app restart', async () => {
    // 1. Login
    // 2. Simulate app restart
    // 3. Verify user is still logged in
  })
})
```

#### 2.2 Fluxo de Câmera (`camera-flow.test.tsx`)

```typescript
describe('Camera Flow', () => {
  it('should capture photo with overlay', async () => {
    // 1. Navigate to camera
    // 2. Verify overlay is visible
    // 3. Capture photo
    // 4. Verify preview
    // 5. Confirm save
    // 6. Verify photo in vault
  })

  it('should handle camera permissions', async () => {
    // 1. Request camera permission
    // 2. Verify permission prompt
    // 3. Grant permission
    // 4. Verify camera access
  })

  it('should cycle through angles', async () => {
    // 1. Open camera
    // 2. Verify angle selector
    // 3. Switch angles
    // 4. Verify overlay updates
  })
})
```

#### 2.3 Fluxo de Feed (`feed-flow.test.tsx`)

```typescript
describe('Feed Flow', () => {
  it('should load and display posts', async () => {
    // 1. Navigate to feed
    // 2. Verify loading state
    // 3. Verify posts render
    // 4. Verify post content
  })

  it('should create new post', async () => {
    // 1. Click create post
    // 2. Select photo
    // 3. Add caption
    // 4. Set privacy
    // 5. Submit
    // 6. Verify post appears in feed
  })

  it('should tag professional in post', async () => {
    // 1. Create post
    // 2. Click tag button
    // 3. Select professional
    // 4. Verify tag in post
    // 5. Verify notification sent
  })

  it('should filter posts', async () => {
    // 1. Open feed
    // 2. Click filter
    // 3. Select filter option
    // 4. Verify filtered posts
  })
})
```

#### 2.4 Fluxo de Upload de Exames (`exam-upload-flow.test.tsx`)

```typescript
describe('Exam Upload Flow', () => {
  it('should upload exam from camera', async () => {
    // 1. Navigate to exam upload
    // 2. Select camera
    // 3. Capture image
    // 4. Verify preview
    // 5. Select exam type
    // 6. Submit
    // 7. Verify upload success
  })

  it('should upload exam from gallery', async () => {
    // 1. Navigate to exam upload
    // 2. Select gallery
    // 3. Pick file
    // 4. Verify preview
    // 5. Select exam type
    // 6. Submit
    // 7. Verify upload success
  })

  it('should analyze exam with OCR', async () => {
    // 1. Upload exam
    // 2. Verify OCR processing
    // 3. Verify extracted data
    // 4. Verify AI insights
  })

  it('should validate file before upload', async () => {
    // 1. Try to upload invalid file
    // 2. Verify error message
    // 3. Verify file not uploaded
  })
})
```

#### 2.5 Fluxo de Painel de Privacidade (`privacy-panel-flow.test.tsx`)

```typescript
describe('Privacy Panel Flow', () => {
  it('should display connected professionals', async () => {
    // 1. Navigate to privacy panel
    // 2. Verify professionals list
    // 3. Verify permissions toggles
  })

  it('should grant permission to professional', async () => {
    // 1. Open privacy panel
    // 2. Select professional
    // 3. Toggle permission
    // 4. Verify permission saved
    // 5. Verify API call
  })

  it('should revoke permission from professional', async () => {
    // 1. Open privacy panel
    // 2. Find professional with access
    // 3. Toggle permission off
    // 4. Verify permission removed
    // 5. Verify API call
  })
})
```

#### 2.6 Fluxo de Marketplace (`marketplace-flow.test.tsx`)

```typescript
describe('Marketplace Flow', () => {
  it('should display professionals list', async () => {
    // 1. Navigate to marketplace
    // 2. Verify professionals render
    // 3. Verify professional info
  })

  it('should filter by specialty', async () => {
    // 1. Open marketplace
    // 2. Click specialty filter
    // 3. Select specialty
    // 4. Verify filtered results
  })

  it('should connect with professional', async () => {
    // 1. Find professional
    // 2. Click connect button
    // 3. Verify connection created
    // 4. Verify notification sent
  })

  it('should view professional showcase', async () => {
    // 1. Open professional profile
    // 2. Verify posts displayed
    // 3. Verify statistics
  })
})
```

---

### 3. Testes End-to-End (E2E Tests)

#### 3.1 Onboarding Completo (`e2e/onboarding.test.tsx`)

```typescript
describe('Complete Onboarding E2E', () => {
  it('should complete full onboarding flow', async () => {
    // 1. Start app
    // 2. See splash screen
    // 3. Complete welcome slides
    // 4. Select user type (Aluno)
    // 5. Grant permissions
    // 6. Verify home screen
    // 7. Verify all tabs accessible
  })
})
```

#### 3.2 Captura de Foto Completa (`e2e/photo-capture.test.tsx`)

```typescript
describe('Complete Photo Capture E2E', () => {
  it('should capture and share photo', async () => {
    // 1. Login
    // 2. Navigate to camera
    // 3. Capture 3 photos (frente, lateral, costas)
    // 4. Navigate to gallery
    // 5. Generate timelapse
    // 6. Share to feed
    // 7. Verify post in feed
  })
})
```

#### 3.3 Geração de Relatório (`e2e/report-generation.test.tsx`)

```typescript
describe('Report Generation E2E', () => {
  it('should generate monthly report', async () => {
    // 1. Login
    // 2. Navigate to reports
    // 3. Select month
    // 4. Verify data loading
    // 5. Verify graphs render
    // 6. Export to PDF
    // 7. Verify PDF generated
  })
})
```

---

## 🔧 Configuração de Testes

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

### vitest.setup.ts

```typescript
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react-native'
import { setupServer } from 'msw/node'
import { handlers } from './__tests__/mocks/handlers'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Setup MSW
export const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock Expo modules
vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(),
  notificationAsync: vi.fn(),
}))

vi.mock('expo-secure-store', () => ({
  setItemAsync: vi.fn(),
  getItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}))

vi.mock('expo-file-system/legacy', () => ({
  writeAsStringAsync: vi.fn(),
  readAsStringAsync: vi.fn(),
  deleteAsync: vi.fn(),
}))

vi.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: vi.fn(),
  },
}))
```

### Mocks (`__tests__/mocks/`)

**handlers.ts** — MSW handlers para API
```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('/api/auth/login', () => {
    return HttpResponse.json({ token: 'mock_token' })
  }),
  http.get('/api/profile', () => {
    return HttpResponse.json({ id: 1, name: 'Test User' })
  }),
  http.get('/api/photos', () => {
    return HttpResponse.json([
      { id: 1, angle: 'front', uri: 'mock_uri' },
    ])
  }),
]
```

---

## 📊 Métricas de Cobertura

| Módulo | Cobertura Alvo | Status |
|--------|----------------|--------|
| Hooks | 90% | ⏳ |
| Componentes | 85% | ⏳ |
| Utilitários | 95% | ⏳ |
| Telas | 80% | ⏳ |
| Serviços | 85% | ⏳ |
| **Total** | **80%** | ⏳ |

---

## 🚀 Execução de Testes

### Comandos

```bash
# Executar todos os testes
pnpm test

# Executar testes em modo watch
pnpm test:watch

# Executar com cobertura
pnpm test:coverage

# Executar apenas testes unitários
pnpm test:unit

# Executar apenas testes de integração
pnpm test:integration

# Executar apenas E2E
pnpm test:e2e

# Executar teste específico
pnpm test -- use-auth.test.ts
```

### package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run __tests__/unit",
    "test:integration": "vitest run __tests__/integration",
    "test:e2e": "vitest run __tests__/e2e"
  }
}
```

---

## ✅ Checklist de Implementação

- [ ] Configurar Vitest
- [ ] Criar estrutura de pastas
- [ ] Implementar testes unitários (hooks)
- [ ] Implementar testes unitários (componentes)
- [ ] Implementar testes unitários (utilitários)
- [ ] Implementar testes de integração (auth)
- [ ] Implementar testes de integração (câmera)
- [ ] Implementar testes de integração (feed)
- [ ] Implementar testes de integração (exames)
- [ ] Implementar testes de integração (privacidade)
- [ ] Implementar testes de integração (marketplace)
- [ ] Implementar testes E2E (onboarding)
- [ ] Implementar testes E2E (captura de foto)
- [ ] Implementar testes E2E (relatório)
- [ ] Atingir 80% de cobertura
- [ ] Integrar com CI/CD

---

## 📝 Notas Importantes

1. **Mocks de Expo**: Todos os módulos Expo devem ser mockados no setup
2. **MSW para API**: Use Mock Service Worker para interceptar requisições HTTP
3. **Async/Await**: Todos os testes assíncronos devem usar async/await
4. **Cleanup**: Sempre fazer cleanup após cada teste
5. **Dados Realistas**: Usar dados realistas nos mocks
6. **Isolamento**: Cada teste deve ser independente
7. **Descrições Claras**: Usar descrições claras e em português

---

## 🔗 Referências

- [Vitest Documentation](https://vitest.dev/)
- [React Native Testing Library](https://testing-library.com/docs/react-native-testing-library/intro)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
