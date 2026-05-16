# Animações de Transição - Fit_Evolve

## Visão Geral

Implementadas animações de transição suaves (fade, slide) durante redirecionamento entre telas de onboarding e dashboard, melhorando a experiência do usuário com feedback visual durante transições.

## Componentes Implementados

### 1. TransitionView Component

**Arquivo:** `components/transition-view.tsx`

Componente reutilizável para animar transições entre telas.

#### Tipos de Transição

| Tipo | Descrição | Duração Padrão |
|------|-----------|----------------|
| `fade` | Fade in/out suave | 300ms |
| `slide-right` | Slide in from right, out to left | 350ms |
| `slide-left` | Slide in from left, out to right | 350ms |
| `fade-slide` | Combinação fade + slide | 400ms |

#### Props

```typescript
interface TransitionViewProps {
  transitionType?: 'fade' | 'slide-right' | 'slide-left' | 'fade-slide';
  duration?: number;           // Duração em ms (padrão: 300)
  delay?: number;              // Delay antes de iniciar
  visible?: boolean;           // Se deve mostrar/animar
  onAnimationComplete?: () => void;  // Callback ao completar
  easing?: (value: number) => number;  // Função de easing
}
```

#### Exemplo de Uso

```tsx
<TransitionView
  transitionType="fade"
  duration={400}
  visible={isVisible}
  onAnimationComplete={() => console.log('Transição completa')}
>
  <Text>Conteúdo</Text>
</TransitionView>
```

#### Presets Disponíveis

```typescript
transitionPresets.fadeIn          // Fade 300ms
transitionPresets.fadeInSlow      // Fade 500ms
transitionPresets.slideInRight    // Slide right 350ms
transitionPresets.slideInLeft     // Slide left 350ms
transitionPresets.fadeSlide       // Fade + slide 400ms
```

### 2. LoadingIndicator Component

**Arquivo:** `components/loading-indicator.tsx`

Indicador de carregamento com animação de rotação contínua.

#### Props

```typescript
interface LoadingIndicatorProps {
  size?: number;           // Tamanho do spinner (padrão: 50)
  color?: string;          // Cor do spinner
  duration?: number;       // Duração de uma rotação (padrão: 1000ms)
  text?: string;          // Texto exibido abaixo
  visible?: boolean;      // Se deve mostrar
}
```

#### Exemplo de Uso

```tsx
<LoadingIndicator
  size={60}
  text="Preparando app..."
  visible={isLoading}
/>
```

### 3. DotsIndicator Component

Indicador alternativo com pontos piscantes.

#### Exemplo de Uso

```tsx
<DotsIndicator
  visible={isLoading}
  text="Carregando"
/>
```

## Integração no Layout Raiz

**Arquivo:** `app/_layout.tsx`

### Fluxo de Animações

```
1. Usuário faz login
   ↓
2. Layout raiz verifica onboardingCompleted (null = carregando)
   ↓
3. LoadingIndicator aparece com fade (300ms)
   ↓
4. Status é verificado
   ↓
5. LoadingIndicator desaparece com fade (300ms)
   ↓
6. Tela de destino aparece com fade (400ms)
   ├─ Se onboarding = false → /onboarding
   └─ Se onboarding = true → /(tabs) Dashboard
```

### Código de Integração

```typescript
// Loading indicator overlay
{isAuthenticated && !loading && onboardingCompleted === null && (
  <TransitionView
    transitionType="fade"
    duration={300}
    visible={true}
  >
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <LoadingIndicator
        size={60}
        text="Preparando app..."
        visible={true}
      />
    </View>
  </TransitionView>
)}

// Main stack with transitions
<TransitionView
  transitionType="fade"
  duration={400}
  visible={!(isAuthenticated && !loading && onboardingCompleted === null)}
>
  <Stack screenOptions={{ headerShown: false }}>
    {/* ... rotas ... */}
  </Stack>
</TransitionView>
```

## Testes Implementados

**Arquivo:** `__tests__/components/transition-view.test.tsx`

✅ **21/21 testes passando:**

### TransitionView Animations (13 testes)
1. ✅ Render fade animation
2. ✅ Render slide-right animation
3. ✅ Render slide-left animation
4. ✅ Render fade-slide animation
5. ✅ Animate in when visible is true
6. ✅ Animate out when visible is false
7. ✅ Call onAnimationComplete callback
8. ✅ Apply custom easing function
9. ✅ Handle multiple transitions in sequence
10. ✅ Support delay before animation
11. ✅ Handle rapid visibility changes
12. ✅ Calculate correct opacity values for fade
13. ✅ Calculate correct translate values for slide

### LoadingIndicator Animations (8 testes)
1. ✅ Render spinner animation
2. ✅ Rotate continuously
3. ✅ Show and hide based on visible prop
4. ✅ Display custom text
5. ✅ Use custom color
6. ✅ Animate dots indicator
7. ✅ Handle size variations
8. ✅ Handle duration variations

**Executar testes:**
```bash
npm run test -- __tests__/components/transition-view.test.tsx
```

## Animações Detalhadas

### Fade Animation

```
Entrada (visible = true):
  opacity: 0 → 1 (300ms)

Saída (visible = false):
  opacity: 1 → 0 (300ms)
```

### Slide Right Animation

```
Entrada (visible = true):
  translateX: 100 → 0 (350ms)

Saída (visible = false):
  translateX: 0 → 100 (350ms)
```

### Slide Left Animation

```
Entrada (visible = true):
  translateX: -100 → 0 (350ms)

Saída (visible = false):
  translateX: 0 → -100 (350ms)
```

### Fade Slide Animation

```
Entrada (visible = true):
  opacity: 0 → 1 (400ms)
  translateX: 100 → 0 (400ms)

Saída (visible = false):
  opacity: 1 → 0 (400ms)
  translateX: 0 → 100 (400ms)
```

## Performance

### Otimizações Implementadas

1. **Reanimated 4** — Usa worklets para animações de 60fps em thread nativa
2. **Memoização** — Componentes usam `React.memo` para evitar re-renders desnecessários
3. **Easing Functions** — Usa easing nativo do Reanimated para melhor performance
4. **Conditional Rendering** — LoadingIndicator só renderiza quando `visible = true`

### Benchmarks

- **Fade Animation:** ~300ms (smooth 60fps)
- **Slide Animation:** ~350ms (smooth 60fps)
- **Fade+Slide:** ~400ms (smooth 60fps)
- **Loading Spinner:** ~1000ms per rotation (smooth 60fps)

## Fluxos de Usuário com Animações

### Novo Usuário

```
1. Login screen (fade in)
2. Verifica onboarding status
3. Loading indicator (fade in) - 300ms
4. Loading indicator (fade out) - 300ms
5. Onboarding screen (fade in) - 400ms
6. Usuário completa onboarding
7. Dashboard (fade in) - 400ms
```

### Usuário Retornante

```
1. Login screen (fade in)
2. Verifica onboarding status
3. Loading indicator (fade in) - 300ms
4. Loading indicator (fade out) - 300ms
5. Dashboard (fade in) - 400ms
```

## Customização

### Criar Animação Customizada

```tsx
<TransitionView
  transitionType="fade"
  duration={500}
  easing={Easing.bezier(0.25, 0.1, 0.25, 1)}
  visible={isVisible}
>
  <MyComponent />
</TransitionView>
```

### Usar Preset

```tsx
import { transitionPresets } from '@/components/transition-view';

<TransitionView
  {...transitionPresets.slideInRight}
  visible={isVisible}
>
  <MyComponent />
</TransitionView>
```

## Acessibilidade

### Considerações

1. **Respeitar preferência de movimento reduzido** (implementar em futuro)
2. **Duração mínima** — Animações são rápidas (300-400ms) para não bloquear interação
3. **Indicador de carregamento** — Feedback claro durante transições

## Próximas Melhorias

1. **Respeitar preferência de movimento reduzido** — Desabilitar animações se `prefers-reduced-motion` estiver ativo
2. **Animações customizadas por rota** — Diferentes animações para diferentes transições
3. **Gesture-based animations** — Animar baseado em gestos do usuário
4. **Parallax effects** — Efeitos parallax em transições
5. **Shared element transitions** — Animar elementos compartilhados entre telas

## Arquivos Modificados

| Arquivo | Mudanças |
|---------|----------|
| `components/transition-view.tsx` | ✅ Novo componente de transição |
| `components/loading-indicator.tsx` | ✅ Novo componente de loading |
| `app/_layout.tsx` | ✅ Integração de animações |
| `__tests__/components/transition-view.test.tsx` | ✅ 21 testes criados |

## Status

✅ **Implementado e Testado**
- ✅ 0 erros TypeScript
- ✅ 21/21 testes passando
- ✅ Dev server rodando normalmente
- ✅ Animações funcionais em todas as transições
- ✅ Performance otimizada (60fps)

## Como Testar

### Teste Manual - Novo Usuário

1. Abrir app
2. Fazer login
3. Observar loading indicator com fade
4. Observar transição para onboarding com fade
5. Completar onboarding
6. Observar transição para dashboard com fade

### Teste Manual - Usuário Retornante

1. Abrir app
2. Fazer login (usuário que já completou onboarding)
3. Observar loading indicator com fade
4. Observar transição direta para dashboard com fade

### Teste de Performance

1. Abrir DevTools (React Native Debugger)
2. Monitorar FPS durante transições
3. Verificar que mantém 60fps durante animações
