<div align="center">
  <h1>💈 Sou Negão Barbearia</h1>
  <p><strong>Sistema de Agendamento Online para Barbearia</strong></p>
  <p>Uma aplicação web moderna e responsiva para gestão de agendamentos de barbearia.</p>
  
  <img src="https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-2.89-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Autenticação](#-autenticação)
- [Configuração do Google OAuth](#-configuração-do-google-oauth-supabase)
- [Funcionalidades por Perfil](#-funcionalidades-por-perfil)

---

## 🎯 Sobre o Projeto

**Sou Negão Barbearia** é um sistema completo de agendamento online desenvolvido para barbearias. O projeto oferece uma experiência moderna e intuitiva tanto para clientes quanto para profissionais e administradores.

### Destaques:
- 🎨 **Design Premium** com modo escuro e animações suaves
- 📱 **Totalmente Responsivo** com navegação mobile-first
- 🤖 **ChatBot Integrado** com IA (Google Gemini)
- 📊 **Dashboard Administrativo** completo
- 📅 **Gestão de Horários** por barbeiro

---

## ✨ Funcionalidades

### Para Clientes
- ✅ Visualização de serviços disponíveis com preços
- ✅ Seleção de profissional (barbeiro)
- ✅ Calendário interativo para escolha de data
- ✅ Visualização de horários disponíveis em tempo real
- ✅ Seleção de múltiplos serviços (combo)
- ✅ Resumo do agendamento com cálculo automático
- ✅ ChatBot com IA para dúvidas e sugestões

### Para Barbeiros
- ✅ Área restrita com login
- ✅ Visualização de agendamentos do dia
- ✅ Gestão de horários de trabalho
- ✅ Atualização de perfil e foto

### Para Administradores
- ✅ Dashboard completo de gestão
- ✅ Cadastro e edição de barbeiros
- ✅ Cadastro e edição de serviços
- ✅ Gestão de usuários do sistema
- ✅ Visualização de todos os agendamentos

---

## 🛠 Tecnologias Utilizadas

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **React** | 19.2.3 | Biblioteca de UI |
| **TypeScript** | 5.8.2 | Tipagem estática |
| **Vite** | 6.2.0 | Build tool e dev server |
| **Supabase** | 2.89.0 | Backend as a Service (Auth, DB, Storage) |
| **Tailwind CSS** | CDN | Framework CSS utility-first |
| **Google Gemini** | 1.34.0 | IA para ChatBot |

---

## 📦 Pré-requisitos

Antes de começar, você precisará ter instalado:

- **Node.js** (v18 ou superior)
- **npm** ou **yarn**
- Uma conta no **[Supabase](https://supabase.com/)**
- Uma chave de API do **[Google AI Studio](https://aistudio.google.com/)**

---

## 🚀 Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/sou-negao-barber-shop.git
cd sou-negao-barber-shop/sounegao
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais (veja a seção [Variáveis de Ambiente](#-variáveis-de-ambiente)).

### 4. Execute o projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

### 5. Build para produção

```bash
npm run build
npm run preview
```

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` com as seguintes variáveis:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Google Gemini API (para ChatBot)
VITE_GEMINI_API_KEY=sua_gemini_api_key_aqui
```

### Onde obter as credenciais:

| Variável | Onde encontrar |
|----------|----------------|
| `VITE_SUPABASE_URL` | [Supabase Dashboard](https://supabase.com/dashboard) → Seu Projeto → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | [Supabase Dashboard](https://supabase.com/dashboard) → Seu Projeto → Settings → API |
| `VITE_GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |

---

## 📁 Estrutura do Projeto

```
sounegao/
├── components/           # Componentes React
│   ├── AdminDashboard.tsx    # Painel administrativo
│   ├── BarberCard.tsx        # Card de seleção de barbeiro
│   ├── BarberProfile.tsx     # Perfil do barbeiro logado
│   ├── BottomNavigation.tsx  # Navegação mobile
│   ├── Calendar.tsx          # Calendário de agendamento
│   ├── ChatBot.tsx           # ChatBot com IA
│   ├── Header.tsx            # Cabeçalho
│   ├── Home.tsx              # Página inicial
│   ├── Login.tsx             # Tela de login
│   ├── ServiceCard.tsx       # Card de serviço
│   ├── Services.tsx          # Página de serviços
│   └── WorkingHours.tsx      # Horários de trabalho
├── lib/                  # Configurações de bibliotecas
│   └── supabase.ts           # Cliente Supabase
├── services/             # Serviços/APIs
│   ├── appointmentService.ts # Agendamentos
│   ├── authService.ts        # Autenticação
│   ├── barberService.ts      # Barbeiros
│   ├── geminiService.ts      # IA Gemini
│   ├── scheduleService.ts    # Horários
│   └── serviceService.ts     # Serviços oferecidos
├── public/               # Arquivos estáticos
├── App.tsx               # Componente principal
├── types.ts              # Tipos TypeScript
├── constants.tsx         # Constantes da aplicação
├── index.html            # HTML principal
├── index.tsx             # Entry point React
├── index.css             # Estilos globais
├── vite.config.ts        # Configuração Vite
└── package.json          # Dependências
```

---

## 🔑 Autenticação

O sistema possui autenticação baseada em **perfis de usuário** com diferentes níveis de acesso:

### Tipos de Usuário

| Perfil | Descrição | Acesso |
|--------|-----------|--------|
| `system_admin` | Administrador do sistema | Acesso total |
| `admin` | Gerente da barbearia | Dashboard administrativo |
| `barber` | Barbeiro | Perfil e agendamentos próprios |

### Login Atual (Email/Senha)

O sistema utiliza autenticação via **RPC do Supabase** com email e senha:

1. Acesse a área de login através do rodapé do site
2. Insira seu email e senha cadastrados
3. O sistema redireciona para o painel correspondente ao perfil

---

## 🌐 Configuração do Google OAuth (Supabase)

Para habilitar login com **Google** na aplicação, siga os passos abaixo:

### Passo 1: Criar Credenciais no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services → Credentials**
4. Clique em **Create Credentials → OAuth Client ID**
5. Selecione **Web Application**
6. Configure os campos conforme abaixo:

#### 📍 Origens JavaScript Autorizadas (Authorized JavaScript Origins)

Adicione **TODAS** as origens abaixo para garantir funcionamento em desenvolvimento e produção:

| Ambiente | Origem |
|----------|--------|
| Desenvolvimento (Vite padrão) | `http://localhost:5173` |
| Desenvolvimento (Vite alternativo) | `http://localhost:5174` |
| Desenvolvimento (porta alternativa) | `http://localhost:3000` |
| Desenvolvimento (127.0.0.1) | `http://127.0.0.1:5173` |
| Desenvolvimento (127.0.0.1 alternativo) | `http://127.0.0.1:5174` |
| Preview de produção | `http://localhost:4173` |
| Supabase | `https://SEU_PROJETO.supabase.co` |
| Produção | `https://seu-dominio.com` |

> ⚠️ **Importante**: Substitua `SEU_PROJETO` pelo ID do seu projeto Supabase e `seu-dominio.com` pelo seu domínio real.

#### 🔗 URIs de Redirecionamento Autorizados (Authorized Redirect URIs)

Adicione **TODAS** as URIs abaixo:

| Descrição | URI |
|-----------|-----|
| **Callback Supabase (OBRIGATÓRIO)** | `https://SEU_PROJETO.supabase.co/auth/v1/callback` |
| Localhost Vite padrão | `http://localhost:5173` |
| Localhost Vite padrão (com barra) | `http://localhost:5173/` |
| Localhost porta alternativa | `http://localhost:5174` |
| Localhost porta 3000 | `http://localhost:3000` |
| Localhost 127.0.0.1 | `http://127.0.0.1:5173` |
| Preview local | `http://localhost:4173` |
| Produção | `https://seu-dominio.com` |
| Produção (com barra) | `https://seu-dominio.com/` |

> 💡 **Dica**: O callback principal usado pelo Supabase é `https://SEU_PROJETO.supabase.co/auth/v1/callback`. Os demais são para redirecionamento após autenticação.

7. Copie o **Client ID** e **Client Secret**

### Passo 2: Configurar no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication → Providers**
4. Encontre **Google** e clique para configurar
5. Cole o **Client ID** e **Client Secret** obtidos no Google Cloud
6. Ative o provider e salve

### Passo 3: Atualizar o Código (Opcional)

A integração já está completa nos componentes `CustomerLogin.tsx` e `customerAuthService.ts`.

---

## 👥 Funcionalidades por Perfil

### 🏠 Visitante (Público)
- Visualizar página inicial
- Ver serviços disponíveis
- Visualizar detalhes dos serviços e preços

### 👤 Cliente (Autenticado com Google)
- **Meus Agendamentos**:
  - Visualizar agendamentos futuros confirmados e pendentes
  - Acessar histórico completo de serviços realizados
  - Ver detalhes: data, hora, profissional, serviços e valor
  - Status visual dos agendamentos (Confirmado, Pendente, Concluído)
- Agendar novos horários (requer login)
- Usar o ChatBot

### 💈 Barbeiro
- Acessar área restrita (Login email/senha)
- Ver agendamentos do dia (Lista e Cards)
- **Gestão Financeira e Relatórios**:
  - Dashboard completo com Faturamento, Qtd. Serviços e Ticket Médio
  - Gráfico de evolução diária de receitas
  - Filtros por período (Hoje, Mês, Personalizado)
  - Lista detalhada de serviços realizados com valores
  - Exportação de dados para Excel/CSV
- Gerenciar horários de trabalho (Padrão Semanal)
- Bloquear dias/horários específicos (Folgas/Feriados)
- Atualizar status dos agendamentos (Concluir/Cancelar)

### 👔 Administrador
- Gerenciar barbeiros (CRUD)
- Gerenciar serviços (CRUD)
- Gerenciar usuários do sistema
- Visualizar todos os agendamentos
- Configurar horários de funcionamento

---

## 📞 Contato

**Sou Negão Barbearia**

- 📍 Rua Senhor do Bonfim S/N
- 📱 (73) 98825-9991
- ⏰ Seg-Sex: 09:00 - 19:30 | Dom: 09:00 - 13:00 | Sáb: Fechado

---

## 📄 Licença

Este projeto é privado e de uso exclusivo da **Sou Negão Barbearia**.

---

<div align="center">
  <p>Desenvolvido com ❤️ para <strong>Sou Negão Barbearia</strong></p>
  <p>© 2026 Todos os direitos reservados.</p>
</div>
