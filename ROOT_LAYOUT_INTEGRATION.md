# Integração de Redirecionamento Automático de Onboarding - Fit_Evolve

## Visão Geral

Implementada integração de verificação de onboarding no layout raiz (`app/_layout.tsx`) para redirecionar automaticamente usuários com base no status de conclusão do onboarding.

## Arquitetura

### Fluxo de Redirecionamento

```
Usuário faz Login
    ↓
Layout raiz verifica isAuthenticated
    ↓
Se autenticado: chama checkOnboardingStatus query
    ↓
Aguarda resultado (onboardingCompleted = null durante carregamento)
    ↓
Se onboardingCompleted = true → Mostra (tabs) - Dashboard
Se onboardingCompleted = false → Mostra onboarding
Se não autenticado → Mostra login
```

### Estados de Navegação

| Estado | isAuthenticated | loading | onboardingCompleted | Tela Mostrada |
|--------|-----------------|---------|---------------------|---------------|
| Deslogado | false | false | null | Login |
| Carregando auth | false | true | null | Login |
| Carregando onboarding | true | false | null | Login (transição) |
| Novo usuário | true | false | false | Onboarding |
| Usuário retornante | true | false | true | Dashboard (tabs) |

## Implementação

### 1. Modificações no Layout Raiz

**Arquivo:** `app/_layout.tsx`

#### Estados Adicionados
```typescript
const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
```

#### Query tRPC
```typescript
const { data: onboardingStatus } = trpc.profile.checkOnboardingStatus.useQuery(
  undefined,
  {
    enabled: isAuthenticated && !loading,
    retry: 1,
  }
);
```

#### Atualização de Estado
```typescript
useEffect(() => {
  if (onboardingStatus?.completed !== undefined) {
    setOnboardingCompleted(onboardingStatus.completed);
  }
}, [onboardingStatus]);
```

#### Lógica de Roteamento
```typescript
<Stack screenOptions={{ headerShown: false }}>
  {isAuthenticated && !loading ? (
    onboardingCompleted === null ? (
      // Carregando - mostrar login como fallback
      <Stack.Screen name="login" options={{ headerShown: false }} />
    ) : onboardingCompleted ? (
      // Onboarding completo - mostrar app
      <>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="camera" options={{ presentation: "modal" }} />
        {/* ... outros modals ... */}
      </>
    ) : (
      // Onboarding não completo - mostrar onboarding
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    )
  ) : (
    <Stack.Screen name="login" options={{ headerShown: false }} />
  )}
  <Stack.Screen name="oauth/callback" />
</Stack>
```

## Testes Implementados

Criado arquivo `__tests__/integration/root-layout-redirect.test.tsx` com 11 testes:

✅ **Todos os 11 testes passando:**

1. ✅ Mostrar tela de login quando não autenticado
2. ✅ Mostrar estado de carregamento durante autenticação
3. ✅ Redirecionar para onboarding se autenticado mas não completo
4. ✅ Redirecionar para dashboard se autenticado e onboarding completo
5. ✅ Verificar status de onboarding após autenticação
6. ✅ Tratar falha na verificação de status graciosamente
7. ✅ Atualizar roteamento quando status muda
8. ✅ Não redirecionar enquanto status está sendo carregado
9. ✅ Lidar com múltiplas mudanças de estado de autenticação
10. ✅ Persistir status de onboarding entre navegações
11. ✅ Lidar com mudanças rápidas de estado

**Executar testes:**
```bash
npm run test -- __tests__/integration/root-layout-redirect.test.tsx
```

## Fluxo Completo de Usuário

### Novo Usuário
```
1. Acessa app
2. Faz login (credentials: aluno@fitevolve.com / teste123)
3. Layout raiz verifica: isAuthenticated=true, loading=false
4. Chama checkOnboardingStatus → retorna { completed: false }
5. Layout raiz redireciona para /onboarding
6. Usuário completa onboarding
7. Chama completeOnboarding mutation
8. onboardingCompleted = true no banco
9. Usuário é redirecionado para /(tabs) - Dashboard
```

### Usuário Retornante
```
1. Acessa app
2. Faz login (mesmo usuário)
3. Layout raiz verifica: isAuthenticated=true, loading=false
4. Chama checkOnboardingStatus → retorna { completed: true }
5. Layout raiz redireciona diretamente para /(tabs) - Dashboard
6. Usuário pula onboarding automaticamente
```

## Tratamento de Erros

### Falha na Verificação de Status
Se a query `checkOnboardingStatus` falhar:
- Retry automático (configurado com `retry: 1`)
- Fallback para login (estado seguro)
- Usuário pode tentar fazer login novamente

### Timeout de Carregamento
Se a verificação demorar muito:
- Estado `onboardingCompleted = null` persiste
- Usuário vê tela de login como fallback
- Sem bloqueio ou tela branca

## Performance

### Otimizações Implementadas

1. **Query Condicional** — `checkOnboardingStatus` só é executada quando:
   - Usuário está autenticado (`enabled: isAuthenticated`)
   - Não está carregando autenticação (`enabled: !loading`)

2. **Retry Automático** — Falhas de rede são retentadas uma vez (`retry: 1`)

3. **Cache tRPC** — Resultado é cacheado pelo React Query

4. **Sem Refetch Desnecessário** — `refetchOnWindowFocus: false` no QueryClient

## Próximas Melhorias

1. **Animação de Transição** — Adicionar fade/slide entre telas durante redirecionamento

2. **Indicador de Carregamento** — Mostrar spinner enquanto status está sendo verificado

3. **Offline Support** — Verificar status local se offline, sincronizar quando online

4. **Analytics** — Rastrear tempo de redirecionamento e taxa de sucesso

5. **Endpoint de Reset** — Permitir que usuários refaçam onboarding

## Arquivos Modificados

| Arquivo | Mudanças |
|---------|----------|
| `app/_layout.tsx` | ✅ Adicionada verificação de onboarding com query tRPC |
| `__tests__/integration/root-layout-redirect.test.tsx` | ✅ 11 testes criados |

## Status

✅ **Implementado e Testado**
- ✅ 0 erros TypeScript
- ✅ 11/11 testes passando
- ✅ Dev server rodando normalmente
- ✅ Redirecionamento automático funcional
- ✅ Tratamento de erros implementado

## Como Testar Manualmente

### Teste 1: Novo Usuário
1. Abrir app
2. Fazer login com `aluno@fitevolve.com / teste123`
3. Verificar se é redirecionado para `/onboarding`
4. Completar onboarding
5. Verificar se é redirecionado para `/(tabs)` - Dashboard

### Teste 2: Usuário Retornante
1. Abrir app (após completar onboarding)
2. Fazer logout
3. Fazer login novamente com mesmo usuário
4. Verificar se é redirecionado diretamente para `/(tabs)` - Dashboard
5. Verificar que onboarding é pulado

### Teste 3: Erro de Rede
1. Desabilitar internet
2. Fazer login
3. Verificar se fallback para login é mostrado
4. Reabilitar internet
5. Verificar se redirecionamento funciona

## Integração com Fluxo Anterior

Esta implementação se integra com:
- ✅ Correção de navegação pós-login (checkpoint anterior)
- ✅ Skip de onboarding (checkpoint anterior)
- ✅ Endpoints tRPC de onboarding (checkpoint anterior)

Todos os componentes trabalham juntos para criar um fluxo completo e automático.
