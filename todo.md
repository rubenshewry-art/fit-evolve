# Fit_Evolve — Backlog de Desenvolvimento

## Fase 0: Navegação Principal

### Tab Bar e Estrutura de Navegação
- [x] Criar estrutura de tab bar com 5 abas (Home, Comunidade, Profissionais, Relatórios, Perfil)
- [x] Implementar ícones customizados para cada aba
- [x] Criar telas vazias para cada aba
- [x] Implementar navegação entre abas
- [x] Adicionar feedback háptico ao trocar de aba
- [x] Configurar cores e tipografia conforme brand

---

## Fase 1: Autenticação e Onboarding (MVP)

### Autenticacao
- [x] Implementar login com OAuth Manus
- [x] Criar tela de login/registro
- [x] Implementar logout
- [x] Persistir sessao (token em SecureStore)
- [x] Criar hook `useAuth` customizado

### Onboarding
- [x] Criar splash screen com logo Fit_Evolve
- [x] Criar slides de boas-vindas (3 slides)
- [x] Implementar selecao de tipo de usuario (Aluno/Profissional)
- [x] Solicitar permissoes (camera, galeria, notificacoes)
- [x] Redirecionar para Home apos onboarding

### Perfil de Usuário
- [x] Criar schema de usuário estendido (tipo, foto, bio)
- [x] Implementar tela de perfil
- [x] Permitir editar dados pessoais
- [x] Adicionar foto de perfil

---

## Fase 2: Módulo de Evolução Visual

### Câmera e Captura
- [x] Implementar câmera com overlay padronizado
- [x] Criar overlay com guias de posição (frente, lateral, costas)
- [x] Tirar foto com preview
- [x] Confirmar ou refazer foto
- [x] Salvar foto no cofre privado

### Cofre de Fotos Privadas
- [x] Criar armazenamento local (Expo FileSystem)
- [x] Implementar criptografia básica
- [x] Garantir que fotos não aparecem na galeria do celular
- [x] Criar interface de visualização do cofre

### Timeline de Fotos
- [x] Criar tela de timeline (scroll horizontal)
- [x] Exibir fotos com datas
- [x] Permitir deletar fotos
- [x] Mostrar progresso visual (antes/depois)

### Gerador de Timelapse
- [x] Criar função para gerar vídeo timelapse
- [x] Permitir exportar vídeo
- [x] Compartilhar timelapse no feed

---

## Fase 3: Banco de Dados e Schema

### Schema Drizzle
- [ ] Criar tabela `students` (alunos)
- [ ] Criar tabela `professionals` (profissionais)
- [ ] Criar tabela `permissions` (controle de acesso)
- [ ] Criar tabela `photos` (metadados de fotos)
- [ ] Criar tabela `posts` (posts do feed)
- [ ] Criar tabela `exams` (exames laboratoriais)
- [ ] Criar tabela `insights` (insights de IA)
- [ ] Criar tabela `badges` (gamificação)
- [ ] Criar tabela `reports` (relatórios mensais)

### Queries de Banco de Dados
- [ ] Implementar queries de CRUD para cada tabela
- [ ] Criar queries de relacionamento (student-professional)
- [ ] Implementar queries de permissões

---

## Fase 4: Módulo de Comunidade (Social Feed)

### Feed de Conquistas
- [x] Criar tela de feed
- [x] Implementar publicação de conquistas (foto + texto)
- [x] Permitir privacidade por post (público/privado)
- [x] Exibir posts em ordem cronológica
- [x] Implementar filtros (Minhas, Todos, Seguindo)

### Marcação de Profissionais
- [x] Criar botão "Marcar Profissional" em posts
- [x] Implementar seleção de profissional
- [x] Atualizar post com marcação
- [x] Notificar profissional (vitrine)

### Vínculo com Academias
- [ ] Criar tabela de academias
- [ ] Permitir vincular aluno a academia
- [ ] Exibir posts por academia
- [ ] Criar página de academia (comunidade local)

---

## Fase 5: Módulo Multidisciplinar (HealthTech)

### Painel de Privacidade
- [x] Criar tela de controle de privacidade
- [x] Listar profissionais vinculados
- [x] Implementar toggles de acesso (por tipo de dado)
- [x] Permitir revogar acesso imediatamente
- [x] Salvar preferências no banco

### Upload de Exames
- [x] Criar tela de upload de exames
- [x] Permitir câmera ou galeria
- [x] Implementar OCR (expo-document-scanner ou similar)
- [x] Extrair dados do exame
- [x] Armazenar exame no S3
- [x] Visualização prévia de arquivo
- [x] Seleção de tipo de exame
- [x] Validação de arquivo

### Análise de IA
- [x] Integrar OpenAI LLM
- [x] Criar função de análise de biomarcadores
- [x] Cruzar dados com carga de treino
- [x] Cruzar dados com suplementação
- [x] Gerar insights personalizados
- [x] Exibir insights em card

### Histórico de Exames
- [x] Criar tela de histórico de exames
- [x] Permitir visualizar exame anterior
- [x] Comparar resultados (antes/depois)
- [x] Exportar exame em PDF

---

## Fase 6: Módulo de Retenção (Gamificação)

### Relatórios Mensais
- [x] Criar schema de relatório
- [x] Consolidar dados de todos os profissionais
- [x] Gerar gráficos de progresso
- [x] Criar template de PDF
- [x] Implementar download/compartilhamento de PDF

### Badges e Conquistas
- [x] Definir badges (ex: 10 fotos, 1 mês consistente, etc)
- [x] Implementar lógica de desbloqueio
- [x] Exibir badges na tela de perfil
- [x] Exibir badges no relatório mensal
- [x] Notificar quando badge é desbloqueada

### Frase do Dia
- [ ] Criar banco de frases motivacionais
- [ ] Implementar frase aleatória diária
- [ ] Exibir na tela de home
- [ ] Permitir compartilhar frase

### Dica Técnica Personalizada
- [ ] Integrar IA para gerar dica personalizada
- [ ] Considerar histórico do aluno
- [ ] Considerar tipo de treino
- [ ] Exibir dica no relatório mensal
- [ ] Permitir compartilhar dica

---

## Fase 7: Modelo de Negócio (Freemium)

### Plano Freemium para Profissionais
- [ ] Criar tabela de planos (free, pro, enterprise)
- [ ] Implementar limite de alunos (3-5 no free)
- [ ] Criar tela de upgrade
- [ ] Integrar pagamento (Stripe ou similar)
- [ ] Implementar controle de acesso por plano

### Marketplace de Profissionais
- [ ] Criar tela de marketplace
- [ ] Listar profissionais disponíveis
- [ ] Permitir filtrar por especialidade
- [ ] Exibir vitrine do profissional (posts marcados)
- [ ] Permitir conectar com profissional

### Destaque Premium
- [ ] Criar opção de impulsionamento de perfil
- [ ] Implementar pagamento por destaque
- [ ] Exibir profissionais em destaque no marketplace
- [ ] Rastrear conversões

---

## Fase 8: Testes e Polimento

### Testes Unitários
- [ ] Testar autenticação
- [ ] Testar queries de banco de dados
- [ ] Testar lógica de permissões
- [ ] Testar análise de IA

### Testes de Integração
- [ ] Testar fluxo de onboarding end-to-end
- [ ] Testar fluxo de captura de foto
- [ ] Testar fluxo de publicação no feed
- [ ] Testar fluxo de análise de exame

### Testes de UI/UX
- [ ] Testar responsividade em diferentes tamanhos
- [ ] Testar acessibilidade (VoiceOver)
- [ ] Testar performance (scroll, animações)
- [ ] Testar em iOS e Android

### Polimento Visual
- [ ] Refinar cores e tipografia
- [ ] Adicionar animações sutis
- [ ] Melhorar feedback háptico
- [ ] Otimizar imagens e ícones

---

## Fase 9: Entrega e Deploy

### Preparação para Deploy
- [ ] Criar checkpoint final
- [ ] Gerar APK (Android)
- [ ] Gerar IPA (iOS)
- [ ] Testar em devices reais
- [ ] Criar documentação de uso

### Publicação
- [ ] Publicar na Google Play Store
- [ ] Publicar na Apple App Store
- [ ] Criar landing page
- [ ] Configurar suporte ao usuário

---

## Notas Gerais

- **Prioridade:** MVP (Fases 1-2) → Core Features (Fases 3-5) → Monetização (Fase 7)
- **Feedback:** Testar com usuários reais em cada fase
- **Iteração:** Ajustar design baseado em feedback
- **Performance:** Otimizar carregamento de fotos e dados
- **Segurança:** Criptografar dados sensíveis, validar permissões

---

## Status de Conclusão

- [ ] Fase 1: Autenticação e Onboarding
- [ ] Fase 2: Módulo de Evolução Visual
- [ ] Fase 3: Banco de Dados
- [ ] Fase 4: Módulo de Comunidade
- [ ] Fase 5: Módulo Multidisciplinar
- [ ] Fase 6: Módulo de Retenção
- [ ] Fase 7: Modelo de Negócio
- [ ] Fase 8: Testes e Polimento
- [ ] Fase 9: Entrega e Deploy


---

## Fase 1 Melhorada: Funcionalidades Essenciais (CONCLUÍDA)

### Tela de Perfil
- [x] Criar arquivo `app/(tabs)/profile.tsx`
- [x] Exibir dados do usuário (nome, email, foto)
- [x] Botão para editar perfil
- [x] Histórico de atividades
- [x] Estatísticas do usuário
- [x] Integrar com API de perfil

### Tela de Configurações
- [x] Criar arquivo `app/settings.tsx`
- [x] Seção de Perfil (editar nome, foto, tipo)
- [x] Seção de Notificações (toggle)
- [x] Seção de Privacidade
- [x] Botão de Logout
- [x] Botão de Reset de Onboarding
- [x] Botão de Termos e Privacidade

### Dashboard Completo
- [x] Implementar Frase do Dia (backend)
- [x] Implementar Ações Rápidas (botões funcionais)
- [x] Adicionar Histórico de Atividades
- [x] Adicionar Widgets de Progresso
- [x] Integrar com API de dashboard
- [x] Adicionar Pull-to-Refresh

### Rotas e Navegação
- [x] Adicionar tab de Perfil na tab bar
- [x] Adicionar rota de Settings (modal)
- [x] Adicionar rota de Editar Perfil (modal)
- [x] Configurar navegação correta

### Backend/API
- [x] Criar endpoint `GET /profile` (dados do usuário)
- [x] Criar endpoint `PUT /profile` (atualizar perfil)
- [x] Criar endpoint `GET /dashboard` (dados do dashboard)
- [x] Criar endpoint `GET /activities` (histórico)
- [x] Criar endpoint `POST /logout` (logout)
- [x] Criar endpoint `POST /reset-onboarding` (reset)

### Testes
- [x] Testes da Tela de Perfil
- [x] Testes da Tela de Configurações
- [x] Testes do Dashboard
- [x] Testes de navegação
- [x] Testes de integração com API

---

## Fase 14: Marketplace de Profissionais

### Tela de Marketplace
- [x] Criar tela de marketplace de profissionais
- [x] Listar profissionais disponíveis
- [x] Implementar filtros por especialidade
- [x] Implementar filtros por avaliação
- [x] Exibir foto de perfil do profissional
- [x] Mostrar bio e especialidades

### Avaliações e Reviews
- [x] Criar sistema de avaliações (1-5 estrelas)
- [x] Permitir alunos avaliar profissionais
- [x] Exibir média de avaliações
- [x] Mostrar número de avaliações
- [x] Exibir comentários de avaliações

### Vitrine de Posts Marcados
- [x] Exibir posts onde profissional foi marcado
- [x] Mostrar fotos de evolução dos alunos
- [x] Exibir resultados e conquistas
- [x] Permitir compartilhar vitrine

### Conexão com Profissional
- [x] Criar botão "Conectar" ou "Contratar"
- [x] Enviar notificação ao profissional
- [x] Criar chat ou mensagens
- [x] Exibir status de conexão


---

## Fase 2: Sistema de Rotinas Diárias (CONCLUÍDA)

### Schema de Banco de Dados
- [x] Criar tabela `routines` com campos: id, studentId, title, description, time, frequency, isActive, createdAt, updatedAt
- [x] Criar tabela `routine_completions` para rastrear conclusões diárias
- [x] Adicionar índices para queries otimizadas

### Endpoints Backend
- [x] `POST /routines` — Criar nova rotina
- [x] `GET /routines` — Listar rotinas do usuário
- [x] `GET /routines/:id` — Obter detalhes de uma rotina
- [x] `PUT /routines/:id` — Atualizar rotina
- [x] `DELETE /routines/:id` — Deletar rotina
- [x] `POST /routines/:id/complete` — Marcar como concluída
- [x] `GET /routines/completions/today` — Obter conclusões do dia

### Tela de Rotinas
- [x] Criar arquivo `app/(tabs)/routines.tsx`
- [x] Exibir listagem de rotinas
- [x] Mostrar status de conclusão (concluída/pendente)
- [x] Implementar pull-to-refresh
- [x] Adicionar botão flutuante para criar nova rotina
- [x] Implementar swipe para deletar/editar

### Modal de Adicionar/Editar
- [x] Criar componente modal reutilizável
- [x] Campos: título, descrição, horário, frequência
- [x] Validação de formulário
- [x] Modo edição vs criação
- [x] Salvar e cancelar

### Funcionalidade de Deletar
- [x] Implementar confirmação antes de deletar
- [x] Animação de remoção da lista
- [x] Feedback háptico
- [x] Undo (opcional)

### Testes
- [x] Testes de CRUD de rotinas
- [x] Testes de validação de formulário
- [x] Testes de listagem e filtros
- [x] Testes de conclusão de rotinas
- [x] Testes de integração com API

### Documentação
- [x] Documentar schema de rotinas
- [x] Documentar endpoints
- [x] Criar guia de uso


---

## Fase 3: Integração de Dados de Saúde e Bem-estar (ATUAL)

### Schema de Banco de Dados
- [ ] Criar tabela `health_metrics` (tipo, valor, unidade, fonte, data)
- [ ] Criar tabela `health_integrations` (provider, tokens, status)
- [ ] Criar tabela `professional_notes` (notas de profissionais)
- [ ] Criar tabela `health_goals` (metas de saúde personalizadas)
- [ ] Adicionar índices para queries otimizadas

### Integração com APIs
- [ ] Implementar Google Fit API (OAuth, busca de dados)
- [ ] Implementar Apple HealthKit (permissões, leitura de dados)
- [ ] Implementar Fitbit API (opcional)
- [ ] Criar serviço de sincronização automática
- [ ] Adicionar tratamento de erros e retry logic

### Endpoints tRPC
- [ ] `POST /health/metrics` — Adicionar métrica manual
- [ ] `GET /health/metrics` — Listar métricas do período
- [ ] `GET /health/summary` — Resumo de saúde
- [ ] `POST /health/integrations/connect` — Conectar API
- [ ] `GET /health/integrations` — Listar integrações ativas
- [ ] `DELETE /health/integrations/:id` — Desconectar API
- [ ] `GET /health/insights` — Gerar insights automáticos

### Tela de Saúde no App
- [ ] Criar arquivo `app/(tabs)/health.tsx`
- [ ] Exibir métricas principais (passos, frequência cardíaca, sono)
- [ ] Gráficos de progresso (últimos 7 dias)
- [ ] Seção de insights e recomendações
- [ ] Botão para conectar wearables
- [ ] Pull-to-refresh para sincronizar dados

### Dashboard para Profissionais
- [ ] Criar arquivo `app/professional/clients.tsx`
- [ ] Listar clientes do profissional
- [ ] Visualizar métricas de cada cliente
- [ ] Adicionar notas e recomendações
- [ ] Gráficos de progresso
- [ ] Exportar relatórios em PDF

### Análise de Dados
- [ ] Implementar calculadora de métricas diárias
- [ ] Criar gerador de insights automáticos
- [ ] Implementar detecção de anomalias
- [ ] Calcular tendências e progressão
- [ ] Gerar recomendações personalizadas

### Segurança e Compliance
- [ ] Implementar criptografia AES-256
- [ ] Adicionar auditoria HIPAA (logs)
- [ ] Configurar RBAC (Role-based access control)
- [ ] Implementar rate limiting
- [ ] Adicionar validação de dados sensíveis
- [ ] Documentar conformidade LGPD/GDPR

### Testes
- [ ] Testes de integração com APIs
- [ ] Testes de criptografia de dados
- [ ] Testes de endpoints tRPC
- [ ] Testes de tela de saúde
- [ ] Testes de dashboard para profissionais
- [ ] Testes de segurança HIPAA

### Documentação
- [ ] Documentar schema de banco de dados
- [ ] Documentar APIs de integração
- [ ] Criar guia de implementação
- [ ] Documentar endpoints tRPC
- [ ] Criar guia de segurança
- [ ] Documentar conformidade HIPAA
