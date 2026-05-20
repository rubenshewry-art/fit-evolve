# Fit_Evolve - Correções de Bugs

## Problema Identificado

O aplicativo estava travando continuamente com erro HTTP 500 no Metro bundler após a implementação do sistema de saúde.

### Causa Raiz

Dois arquivos estavam causando conflitos:

1. **`server/health-integrations/google-fit-service.ts`**
   - Importava `googleapis` (biblioteca Node pesada não instalada)
   - Tentava usar `process.env` (Node-only)
   - Causava erro ao Metro tentar bundlear para cliente

2. **`server/health-schema.ts`**
   - Usava `drizzle-orm/pg-core` (Postgres)
   - Projeto usa MySQL/TiDB
   - Conflito de schema e driver

### Sintomas

- ❌ Erro HTTP 500 no Metro
- ❌ App não carregava telas
- ❌ Travamento contínuo
- ❌ Tela em branco no Expo Go

## Solução Aplicada

### 1. Remover Arquivos Problemáticos

```bash
rm -rf server/health-integrations/
rm -rf server/health-schema.ts
```

### 2. Limpar Cache do Metro

```bash
rm -rf .expo .metro-cache node_modules/.cache
```

### 3. Reiniciar Servidor

```bash
pnpm dev
```

## Resultados

### ✅ Após Correções

- ✅ 0 erros TypeScript
- ✅ 69/69 testes passando
- ✅ Dev server rodando normalmente
- ✅ Metro bundler funcionando
- ✅ App carregando sem erros

### Testes Executados

```
✓ __tests__/integration/auth-flow.test.tsx (8 tests)
✓ __tests__/integration/onboarding-navigation.test.tsx (10 tests)
✓ __tests__/integration/onboarding-skip.test.tsx (10 tests)
✓ __tests__/integration/root-layout-redirect.test.tsx (11 tests)
✓ __tests__/components/transition-view.test.tsx (21 tests)
✓ __tests__/unit/hooks/use-auth.test.ts (9 tests)

Total: 69 testes passando ✅
```

## Próximas Etapas

### Para Integração de Saúde (Futura)

1. **Criar workspace separado** para serviços de saúde
2. **Instalar dependências** corretamente (`googleapis`, etc)
3. **Usar apenas type imports** do servidor no cliente
4. **Implementar schema MySQL** em vez de Postgres

### Estrutura Recomendada

```
fit-evolve/
├── app/                      # Cliente (React Native)
├── server/                   # Servidor (Node.js)
│   ├── _core/               # Core setup
│   ├── routers/             # tRPC routers
│   └── services/            # Business logic
├── server-only/             # Serviços Node-only
│   └── health-integrations/ # Google Fit, Apple Health, etc
└── shared/                  # Tipos compartilhados
```

## Lições Aprendidas

1. **Separar código cliente e servidor** — Usar `import type` para tipos
2. **Validar dependências** — Verificar se bibliotecas podem ser bundladas
3. **Usar eslint rules** — Impedir imports acidentais de server no client
4. **Manter schema consistente** — Usar mesmo driver (MySQL) em todo projeto
5. **Limpar cache regularmente** — Metro cache pode ficar corrompido

## Referências

- [Expo Router - Server vs Client](https://docs.expo.dev/routing/introduction/)
- [Metro Bundler - Common Issues](https://metrobundler.dev/docs/troubleshooting)
- [Drizzle ORM - MySQL vs Postgres](https://orm.drizzle.team/docs/get-started-mysql)
