# Design do Fit_Evolve — Ecossistema de Saúde Integrada

## Visão Geral

O Fit_Evolve é um aplicativo móvel que conecta alunos de fitness a uma rede multidisciplinar de profissionais (Personal Trainers, Nutricionistas, Fisioterapeutas) com suporte de IA para análise de dados clínicos e evolução visual.

**Orientação:** Portrait (9:16) | **Interação:** One-handed usage | **Padrão:** Apple HIG (iOS-first design)

---

## 1. Mapa de Telas

O aplicativo é dividido em 5 abas principais + telas modais/detalhes:

### Aba 1: Home (Evolução Visual)
- **Conteúdo Principal:**
  - Foto de progresso mais recente (grande, em destaque)
  - Botão flutuante: "Capturar Nova Foto" (câmera com overlay)
  - Timeline de fotos (scroll horizontal)
  - Gerador de antes/depois (timelapse)
  - Cofre de fotos privadas (criptografado)

- **Funcionalidades:**
  - Câmera com overlay padronizado (posição, iluminação)
  - Armazenamento privado (fora da galeria do celular)
  - Visualização de progresso em modo timeline
  - Geração automática de vídeo timelapse

### Aba 2: Comunidade (Social Feed)
- **Conteúdo Principal:**
  - Feed de conquistas (público ou privado)
  - Cards de posts com foto + descrição + data
  - Botão "Marcar Profissional" em cada post
  - Filtros: Minhas Conquistas, Todos, Seguindo

- **Funcionalidades:**
  - Publicar conquistas (foto + texto)
  - Marcar profissionais (gera vitrine para eles)
  - Privacidade por post (público/privado)
  - Vínculo com academias físicas

### Aba 3: Profissionais (Multidisciplinar)
- **Conteúdo Principal:**
  - Lista de profissionais vinculados (Personal, Nutri, Fisio)
  - Painel de controle de privacidade (por profissional)
  - Upload de exames laboratoriais
  - Insights de IA baseados em dados cruzados

- **Funcionalidades:**
  - Liberar/revogar acesso de cada profissional
  - OCR para leitura de exames
  - Análise de IA (biomarcadores + carga de treino + suplementação)
  - Histórico de exames

### Aba 4: Relatórios (Retenção)
- **Conteúdo Principal:**
  - Relatório mensal unificado (PDF/Tela)
  - Dados consolidados de todos os profissionais
  - Badges e conquistas (gamificação)
  - Frase do Dia + Dica Técnica Personalizada

- **Funcionalidades:**
  - Gerar PDF mensal
  - Visualizar badges conquistadas
  - Receber dicas personalizadas
  - Histórico de relatórios

### Aba 5: Perfil (Conta)
- **Conteúdo Principal:**
  - Dados pessoais (nome, email, foto)
  - Tipo de usuário (Aluno ou Profissional)
  - Configurações de privacidade global
  - Logout

- **Funcionalidades:**
  - Editar perfil
  - Mudar tipo de conta (Aluno ↔ Profissional)
  - Configurações de notificações
  - Suporte e feedback

---

## 2. Fluxos de Usuário Principais

### Fluxo 1: Novo Aluno — Onboarding
1. Splash screen (logo Fit_Evolve)
2. Tela de boas-vindas (3 slides: benefícios)
3. Login/Registro (OAuth Manus)
4. Selecionar tipo de usuário (Aluno ou Profissional)
5. Permissões (câmera, galeria, notificações)
6. Home (Evolução Visual)

### Fluxo 2: Aluno — Capturar Foto de Progresso
1. Tela Home → Botão "Capturar Nova Foto"
2. Câmera abre com overlay (posição padronizada)
3. Tirar foto (preview)
4. Confirmar ou refazer
5. Foto armazenada no cofre privado
6. Opção: Publicar no feed (público/privado)

### Fluxo 3: Aluno — Marcar Profissional em Conquista
1. Feed de Comunidade → Meu Post
2. Botão "Marcar Profissional"
3. Selecionar profissional (Personal, Nutri, Fisio)
4. Post atualizado com marcação
5. Profissional recebe notificação (vitrine)

### Fluxo 4: Aluno — Gerenciar Privacidade
1. Aba Profissionais → Selecionar profissional
2. Painel de Privacidade (toggle por tipo de dado)
3. Liberar acesso a: Fotos, Exames, Treino, Nutrição
4. Revogar acesso (imediato)
5. Salvar alterações

### Fluxo 5: Aluno — Upload e Análise de Exame
1. Aba Profissionais → "Adicionar Exame"
2. Câmera ou galeria (foto do exame)
3. OCR processa documento
4. IA analisa biomarcadores
5. Insights aparecem na tela (recomendações)
6. Compartilhar com profissional (se permitido)

### Fluxo 6: Aluno — Visualizar Relatório Mensal
1. Aba Relatórios → Selecionar mês
2. Consolidação de dados (todos os profissionais)
3. Gráficos de progresso
4. Badges conquistadas
5. Dica Personalizada do Dia
6. Opção: Gerar PDF e compartilhar

---

## 3. Paleta de Cores

**Marca Fit_Evolve:** Saúde, evolução, energia

| Elemento | Cor | Hex | Uso |
|----------|-----|-----|-----|
| Primary (Accent) | Verde Vibrante | #10B981 | Botões, highlights, progresso |
| Secondary | Azul Profundo | #0EA5E9 | Profissionais, informações |
| Tertiary | Laranja Quente | #F97316 | Conquistas, gamificação |
| Background | Branco | #FFFFFF | Fundo principal |
| Surface | Cinza Claro | #F3F4F6 | Cards, superfícies |
| Foreground | Cinza Escuro | #1F2937 | Texto principal |
| Muted | Cinza Médio | #6B7280 | Texto secundário |
| Border | Cinza Borda | #E5E7EB | Divisores |
| Success | Verde | #22C55E | Confirmações |
| Warning | Amarelo | #F59E0B | Avisos |
| Error | Vermelho | #EF4444 | Erros |

---

## 4. Componentes Reutilizáveis

### Componentes de UI
- **PhotoCard:** Exibe foto com data, likes, comentários
- **ProfessionalCard:** Profissional com nome, especialidade, status de acesso
- **PrivacyToggle:** Toggle para liberar/revogar acesso
- **BadgeDisplay:** Mostra badges conquistadas
- **InsightCard:** Card com insight de IA (recomendação)
- **TimelineScroll:** Scroll horizontal de fotos
- **OverlayCamera:** Câmera com overlay padronizado

### Componentes de Navegação
- **TabBar:** 5 abas (Home, Comunidade, Profissionais, Relatórios, Perfil)
- **ScreenContainer:** SafeArea wrapper (já existe no scaffold)
- **ModalSheet:** Bottom sheet para ações (compartilhar, editar, deletar)

---

## 5. Fluxo de Dados (Arquitetura)

```
Frontend (React Native)
  ↓
tRPC Client (lib/trpc.ts)
  ↓
Backend (server/routers.ts)
  ↓
Database (Drizzle + MySQL)
  ↓
S3 Storage (fotos, exames)
  ↓
LLM (OpenAI — análise de exames, insights)
```

**Armazenamento Local:**
- AsyncStorage: Preferências de usuário, cache de posts
- Expo FileSystem: Fotos privadas (cofre criptografado)
- Expo SecureStore: Token de autenticação

**Armazenamento Remoto:**
- S3: Fotos de perfil, exames originais
- Database: Metadados, permissões, posts, relatórios

---

## 6. Prioridades de Implementação

**Fase 1 (MVP):**
- Autenticação (OAuth Manus)
- Perfil de Aluno
- Câmera com overlay
- Armazenamento de fotos (cofre privado)
- Timeline de fotos

**Fase 2:**
- Feed de Comunidade
- Marcação de profissionais
- Painel de Privacidade

**Fase 3:**
- Upload e OCR de exames
- Análise de IA
- Insights personalizados

**Fase 4:**
- Relatórios mensais
- Gamificação (badges)
- Dica do Dia

**Fase 5 (Monetização):**
- Marketplace de profissionais
- Plano Freemium
- Destaque Premium

---

## 7. Considerações de UX

- **One-handed:** Botões e controles no terço inferior da tela
- **Feedback Háptico:** Confirmação em ações críticas (foto, compartilhamento)
- **Loading States:** Indicadores visuais durante upload/processamento
- **Empty States:** Mensagens claras quando não há dados
- **Accessibility:** Textos com contraste, tamanhos legíveis, suporte a VoiceOver

---

## 8. Tecnologias Utilizadas

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | React Native + Expo | Cross-platform (iOS/Android) |
| Styling | NativeWind (Tailwind CSS) | Desenvolvimento rápido, consistente |
| Navegação | Expo Router | File-based routing, moderna |
| Estado | React Context + AsyncStorage | Simples, suficiente para MVP |
| API | tRPC | Type-safe, integrado |
| Database | MySQL + Drizzle ORM | Estruturado, escalável |
| Storage | S3 | Fotos, exames, backups |
| IA | OpenAI (LLM) | Análise de exames, insights |
| Câmera | expo-camera | Nativa, confiável |
| Criptografia | expo-secure-store | Cofre de fotos privadas |

---

## 9. Próximos Passos

1. ✅ Design definido
2. ⏳ Implementar Autenticação + Onboarding
3. ⏳ Criar schema de banco de dados (Alunos, Profissionais, Permissões)
4. ⏳ Desenvolver módulo de Evolução Visual (câmera + cofre)
5. ⏳ Implementar Feed de Comunidade
6. ⏳ Integrar OCR + IA para análise de exames
7. ⏳ Adicionar Relatórios e Gamificação
8. ⏳ Polir UI/UX e testes end-to-end
