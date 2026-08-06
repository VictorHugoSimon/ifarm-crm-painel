# Passo a passo — subir o Painel Gerencial Terra Pulse

Stack: **Cloudflare Pages** (site + funções `/api/*`) + **Supabase** (banco).
Todo `git push` para `main` gera um novo deploy automático. Tempo: ~30 min.

---

## FASE 1 — Código no GitHub

Crie um repositório **privado** vazio (ex.: `terra-pulse-painel`) em github.com/new
e, dentro desta pasta:
```bash
git init
git add -A
git commit -m "Terra Pulse — painel gerencial (clone do Painel SBS)"
git branch -M main
git remote add origin https://github.com/VictorHugoSimon/terra-pulse-painel.git
git push -u origin main
```

---

## FASE 2 — Banco no Supabase

1. **supabase.com → New project** (plano free). Guarde a senha do banco.
2. Menu **SQL Editor → + New query**.
3. Cole TODO o conteúdo de `backend/supabase-schema.sql` e clique **Run**.
4. **Settings → API**, copie e guarde:
   - **Project URL** → vira `SUPABASE_URL`
   - **service_role key** (secret) → vira `SUPABASE_SERVICE_KEY`

> Use o **MESMO** projeto Supabase no Worker Terra Pulse (ver `COMO-CONECTAR.md`),
> senão os dois não compartilham dados.

---

## FASE 3 — Site no Cloudflare Pages

1. **dash.cloudflare.com → Workers & Pages → Create → aba Pages → Connect to Git**.
2. Escolha o repositório `terra-pulse-painel`.
3. Build:
   - **Framework preset:** `None`
   - **Build command:** *(em branco)*
   - **Build output directory:** `/`
4. **Save and Deploy**.

---

## FASE 4 — Variáveis de ambiente

Pages → **Settings → Environment variables** → **Add** (para **Production**, e
repita em **Preview**). Use `.env.example` como referência:

| Nome | Valor |
|---|---|
| `SUPABASE_URL` | Project URL do Supabase |
| `SUPABASE_SERVICE_KEY` | service_role key do Supabase |
| `AUTH_SECRET` | frase secreta longa e aleatória |
| `FORCAR_2FA` | `off` (opcional — desliga o 2FA obrigatório) |
| `GROQ_API_KEY` | chave Groq (opcional, IA) |
| `SBS_BRASIL_URL` | URL do worker (ver COMO-CONECTAR) |
| `INTEG_KEY` | mesma chave do worker (ver COMO-CONECTAR) |

---

## FASE 5 — Compatibilidade Node

Pages → **Settings → Functions** (ou **Runtime**) → **Compatibility flags** →
adicione `nodejs_compat` em **Production** e **Preview**.

---

## FASE 6 — Republicar

**Deployments** → último deploy → **⋯ → Retry deployment**.
O site fica em `https://terra-pulse-painel.pages.dev`.

---

## FASE 7 — Testes

- [ ] `https://SEU-PROJETO.pages.dev/api/tenants` responde `{"ok":true,...}`
- [ ] A home abre o painel com a marca **Terra Pulse** (verde)
- [ ] Login `admin@terrapulse.com.br` / `12345678` entra (troca de senha no 1º acesso)
- [ ] Criar um evento → recarregar → o evento continua (gravou no Supabase)
- [ ] Aba de integração mostra os dados vindos do Worker (após `COMO-CONECTAR.md`)

Se `/api/*` responder erro de "Banco não configurado", falta a Fase 4/5.

---

## Dia a dia
```bash
git add -A && git commit -m "mudança" && git push origin main
```
O Cloudflare publica sozinho em ~1–2 min. Não precisa mexer em variáveis de novo.
