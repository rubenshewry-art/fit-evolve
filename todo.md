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

### Autenticação
- [ ] Implementar login com OAuth Manus
- [ ] Criar tela de login/registro
- [ ] Implementar logout
- [ ] Persistir sessão (token em SecureStore)
- [ ] Criar hook `useAuth` customizado

### Onboarding
- [ ] Criar splash screen com logo Fit_Evolve
- [ ] Criar slides de boas-vindas (3 slides)
- [ ] Implementar seleção de tipo de usuário (Aluno/Profissional)
- [ ] Solicitar permissões (câmera, galeria, notificações)
- [ ] Redirecionar para Home após onboarding

### Perfil de Usuário
- [ ] Criar schema de usuário estendido (tipo, foto, bio)
- [ ] Implementar tela de perfil
- [ ] Permitir editar dados pessoais
- [ ] Adicionar foto de perfil

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
- [ ] Criar tela de timeline (scroll horizontal)
- [ ] Exibir fotos com datas
- [ ] Permitir deletar fotos
- [ ] Mostrar progresso visual (antes/depois)

### Gerador de Timelapse
- [ ] Criar função para gerar vídeo timelapse
- [ ] Permitir exportar vídeo
- [ ] Compartilhar timelapse no feed

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
- [ ] Criar tela de feed
- [ ] Implementar publicação de conquistas (foto + texto)
- [ ] Permitir privacidade por post (público/privado)
- [ ] Exibir posts em ordem cronológica
- [ ] Implementar filtros (Minhas, Todos, Seguindo)

### Marcação de Profissionais
- [ ] Criar botão "Marcar Profissional" em posts
- [ ] Implementar seleção de profissional
- [ ] Atualizar post com marcação
- [ ] Notificar profissional (vitrine)

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
- [ ] Criar tela de histórico de exames
- [ ] Permitir visualizar exame anterior
- [ ] Comparar resultados (antes/depois)
- [ ] Exportar exame em PDF

---

## Fase 6: Módulo de Retenção (Gamificação)

### Relatórios Mensais
- [ ] Criar schema de relatório
- [ ] Consolidar dados de todos os profissionais
- [ ] Gerar gráficos de progresso
- [ ] Criar template de PDF
- [ ] Implementar download/compartilhamento de PDF

### Badges e Conquistas
- [ ] Definir badges (ex: 10 fotos, 1 mês consistente, etc)
- [ ] Implementar lógica de desbloqueio
- [ ] Exibir badges na tela de perfil
- [ ] Exibir badges no relatório mensal
- [ ] Notificar quando badge é desbloqueada

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
