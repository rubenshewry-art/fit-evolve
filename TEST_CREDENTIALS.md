# 🧪 Credenciais de Teste - Fit_Evolve

## 📧 Conta de Aluno (Principal)

```
Email: aluno@fitevolve.com
Senha: teste123
Tipo: Aluno
```

**Dados do Perfil:**
- Nome: João Silva
- Bio: Apaixonado por fitness e transformação corporal
- Fotos capturadas: 8 (frente, lateral, costas em 3 períodos)
- Exames enviados: 3 (sangue, composição corporal)
- Posts criados: 3 (com marcações de profissionais)
- Badges conquistadas: 5
- Profissionais conectados: 3

---

## 👨‍⚕️ Contas de Profissionais

### 1️⃣ Personal Trainer

```
Email: personal@fitevolve.com
Senha: teste123
Especialidade: Personal Trainer
```

**Acesso do Aluno:**
- ✅ Fotos: SIM
- ✅ Exames: SIM
- ✅ Treino: SIM
- ✅ Nutrição: SIM
- ✅ Suplementos: SIM

---

### 2️⃣ Nutricionista

```
Email: nutri@fitevolve.com
Senha: teste123
Especialidade: Nutricionista
```

**Acesso do Aluno:**
- ❌ Fotos: NÃO
- ✅ Exames: SIM
- ❌ Treino: NÃO
- ✅ Nutrição: SIM
- ✅ Suplementos: SIM

---

### 3️⃣ Fisioterapeuta

```
Email: fisio@fitevolve.com
Senha: teste123
Especialidade: Fisioterapeuta
```

**Acesso do Aluno:**
- ✅ Fotos: SIM
- ✅ Exames: SIM
- ✅ Treino: SIM
- ❌ Nutrição: NÃO
- ❌ Suplementos: NÃO

---

## 📊 Dados Fictícios Disponíveis

### 📸 Fotos de Evolução

| Data | Ângulo | Status |
|------|--------|--------|
| 15/01/2024 | Frente, Lateral, Costas | Capturadas |
| 15/02/2024 | Frente, Lateral, Costas | Capturadas |
| 15/03/2024 | Frente, Lateral | Capturadas |

**Timelapse:** Vídeo de progressão de 2 meses disponível

---

### 🧪 Exames Laboratoriais

#### Exame 1 - 20/01/2024 (Sangue)

```json
{
  "glucose": 95,
  "cholesterol": 180,
  "triglycerides": 120,
  "hdl": 50,
  "ldl": 110
}
```

**Insight IA:** Seus níveis de colesterol estão normais. Continue mantendo a atividade física regular.

---

#### Exame 2 - 20/02/2024 (Sangue)

```json
{
  "glucose": 92,
  "cholesterol": 165,
  "triglycerides": 110,
  "hdl": 55,
  "ldl": 100
}
```

**Insight IA:** Excelente melhora! Seus biomarcadores melhoraram significativamente. Continue com o programa.

**Comparação:**
- Glicose: ↓ 95 → 92 (-3%)
- Colesterol: ↓ 180 → 165 (-8.3%)
- Triglicerídeos: ↓ 120 → 110 (-8.3%)

---

#### Exame 3 - 15/03/2024 (Composição Corporal)

```json
{
  "weight": 78.5,
  "bodyFat": 18.5,
  "muscleMass": 35.2,
  "bmi": 24.8
}
```

**Insight IA:** Perda de 2kg de gordura corporal e ganho de 1.5kg de massa muscular. Progresso excelente!

---

### 📱 Posts Criados

| Data | Conteúdo | Profissional Marcado | Curtidas |
|------|----------|---------------------|----------|
| 15/02/2024 | Completei 30 dias de consistência! 💪 | Personal Trainer | 24 |
| 25/02/2024 | Exames melhoraram muito! 🙏 | Nutricionista | 18 |
| 15/03/2024 | Antes e depois de 2 meses! 🔥 | Personal Trainer | 42 |

---

### 🏆 Badges Conquistadas

| Badge | Data | Descrição |
|-------|------|-----------|
| 🎯 Primeira Foto | 15/01/2024 | Capturou sua primeira foto |
| 📅 7 Dias Consistente | 22/01/2024 | Manteve consistência por 7 dias |
| 📅 30 Dias Consistente | 15/02/2024 | Manteve consistência por 30 dias |
| 🧪 Primeiro Exame | 20/01/2024 | Enviou seu primeiro exame |
| 💚 Saúde em Melhora | 20/02/2024 | Biomarcadores melhoraram |

---

### 📈 Relatório Mensal (Março 2024)

**Resumo:**
- Fotos capturadas: 5
- Exames enviados: 1
- Posts criados: 1
- Badges conquistadas: 1
- Consistência: 72%

**Gráficos:**
- Evolução de biomarcadores: ↑ 15% melhora
- Progresso visual: Visível em comparação antes/depois
- Engajamento: 3 profissionais conectados

**Insights Personalizados:**
- "Você está indo bem! Continue capturando fotos e enviando exames."
- "Sua consistência aumentou 15% este mês!"
- "Mantenha a consistência! Capture fotos regularmente para acompanhar melhor sua evolução visual."

---

## 🎮 Funcionalidades para Testar

### ✅ Como Aluno

1. **Login/Registro**
   - Fazer login com `aluno@fitevolve.com`
   - Ver onboarding e permissões

2. **Home Screen**
   - Ver frase do dia personalizada
   - Acessar ações rápidas (Capturar Foto, Upload Exame)
   - Ver progresso recente

3. **Câmera**
   - Capturar fotos com overlay padronizado
   - Visualizar cofre de fotos privado
   - Gerar timelapse

4. **Exames**
   - Visualizar histórico de exames
   - Comparar resultados antes/depois
   - Ver insights de IA
   - Exportar em PDF

5. **Feed Social**
   - Ver posts públicos
   - Marcar profissionais em posts
   - Curtir e comentar
   - Compartilhar timelapse

6. **Perfil**
   - Ver estatísticas (fotos, exames, posts)
   - Visualizar badges conquistadas
   - Editar dados pessoais
   - Ver progresso de conclusão do perfil

7. **Privacidade**
   - Gerenciar acesso de profissionais
   - Alternar permissões por tipo de dado
   - Revogar acesso imediatamente

8. **Relatórios**
   - Ver gráficos de evolução
   - Filtrar por período
   - Exportar PDF
   - Compartilhar com profissionais

9. **Marketplace**
   - Buscar profissionais
   - Filtrar por especialidade
   - Ver avaliações
   - Conectar com profissional

### ✅ Como Profissional

1. **Login**
   - Fazer login com credenciais de profissional

2. **Marketplace**
   - Ver perfil e estatísticas
   - Visualizar posts onde foi marcado
   - Gerenciar alunos conectados

3. **Alunos Conectados**
   - Ver dados conforme permissões
   - Visualizar fotos de evolução
   - Acessar exames e insights
   - Deixar comentários

---

## 📝 Notas Importantes

- **Dados são fictícios:** Todos os dados são exemplos para demonstração
- **Fotos:** Usando avatares do DiceBear para exemplo
- **Exames:** Valores realistas de biomarcadores
- **Datas:** Distribuídas ao longo de 3 meses (Jan-Mar 2024)
- **Sem dados reais:** Nenhum dado pessoal real foi utilizado

---

## 🚀 Como Começar

1. Abra o app no seu dispositivo ou Expo Go
2. Faça login com `aluno@fitevolve.com` / `teste123`
3. Complete o onboarding (selecione tipo de usuário e permissões)
4. Explore todas as funcionalidades com os dados fictícios
5. Teste diferentes cenários (profissionais, permissões, etc.)

---

## 💡 Dicas de Teste

- **Câmera:** Teste o overlay com diferentes ângulos
- **Exames:** Compare os 3 exames para ver a evolução
- **Gráficos:** Interaja com os gráficos animados
- **Privacidade:** Teste revogar/conceder permissões
- **Feed:** Crie um novo post e marque um profissional
- **Relatórios:** Exporte PDF e compartilhe

---

**Última atualização:** 14/05/2026
