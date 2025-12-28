# 🚀 Guia de Deploy na Vercel

Este projeto está configurado e pronto para deploy na Vercel. Siga os passos abaixo para colocar sua barbearia online.

## 1. Preparação

Certifique-se de que você tem conta na [Vercel](https://vercel.com) e acesso ao seu repositório GitHub.

## 2. Deploy Inicial

1.  Acesse o dashboard da Vercel e clique em **"Add New..."** > **"Project"**.
2.  Importe o repositório do **sou-negao-barber-shop**.
3.  Nas configurações de deploy, o **Framework Preset** deve ser detectado automaticamente como **Vite**.
4.  O **Root Directory** deve ser a pasta onde está o `package.json` (neste caso, `sounegao`).

## 3. Configuração de Variáveis de Ambiente

Antes de clicar em "Deploy", expanda a seção **Environment Variables** e adicione as seguintes chaves (você pode copiar do seu arquivo `.env` local):

| Nome da Variável | Descrição |
| :--- | :--- |
| `VITE_SUPABASE_URL` | URL do seu projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase |
| `VITE_GEMINI_API_KEY` | Chave da API do Google Gemini (para o ChatBot) |

> **Nota:** É crucial adicionar o prefixo `VITE_` para que essas variáveis sejam acessíveis no navegador.

## 4. Configurações Pós-Deploy

Após o site estar no ar (você receberá uma URL como `https://sou-negao-barber.vercel.app`), você precisa configurar as permissões de autenticação.

### No Supabase (Essencial para Login Google)
1.  Vá em **Authentication** > **URL Configuration**.
2.  Em **Site URL**, coloque sua URL da Vercel (ex: `https://sou-negao-barber.vercel.app`).
3.  Em **Redirect URLs**, adicione a mesma URL. Isso permite que o Google redirecione o usuário de volta para seu site após o login.

### No Google Cloud Console (Para o Pop-up do Google)
1.  Acesse o projeto onde você criou as credenciais OAuth.
2.  Edite a credencial do cliente Web.
3.  Em **Origens JavaScript autorizadas**, adicione sua URL da Vercel (ex: `https://sou-negao-barber.vercel.app`).
4.  Em **URIs de redirecionamento autorizados**, adicione a URL de callback do Supabase (geralmente `https://<seu-projeto>.supabase.co/auth/v1/callback`), se já não estiver lá.

## 5. Resolução de Problemas Comuns

-   **Tela Branca / Erro 404 ao recarregar**: O arquivo `vercel.json` incluído na pasta raiz já resolve isso redirecionando todas as rotas para o `index.html`.
-   **Erro de Login**: Verifique se a URL da Vercel foi adicionada corretamente no Supabase.

---
**Pronto!** Sua barbearia está online. 💈
