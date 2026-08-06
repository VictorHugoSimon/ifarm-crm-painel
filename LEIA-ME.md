# Terra Pulse — Painel Gerencial (clone do Painel SBS)

Painel de **gestão/marketing** clonado do "Painel SBS" e re-marcado para
**Terra Pulse**. Roda em **Cloudflare Pages** (site + funções `/api/*`) com banco
**Supabase**. Conversa com o **Worker Terra Pulse Brasil** (o operacional que já
está no ar) por um **barramento compartilhado no Supabase**.

Comece pelo `PASSO-A-PASSO.md`. Para ligar os dois sistemas, veja `COMO-CONECTAR.md`.

## Papéis deste painel
- **Marketing** · **Gerente Nacional** · **CEO** · **Inteligência de Mercado** ·
  **TI** · **Admin (todos os painéis)**.
- Usuários são semeados no **primeiro login** (senha inicial `12345678`, troca
  obrigatória). Lista em `server/auth.js` / router, todos `@terrapulse.com.br`.

## Estrutura
```
terra-pulse-painel/
├── PASSO-A-PASSO.md            ← deploy (Pages + Supabase)
├── COMO-CONECTAR.md            ← liga este painel ao Worker Terra Pulse
├── painel-ifarm.html             front-end (o site abre aqui — ver _redirects)
├── index.html                  cópia do front (mesmo bundle)
├── _redirects                  / → /painel-ifarm.html; protege /server e /backend
├── functions/api/[[path]].js   roteador das funções /api/*
├── server/*.js                 handlers de cada rota (login, campanhas, leads…)
├── server/_lib/*.js            store (Supabase) + auth (token/2FA)
├── backend/supabase-schema.sql cria as tabelas do Supabase (rode 1x)
├── assets/                     logos Terra Pulse + ícones PWA
├── manifest.webmanifest, sw.js PWA
├── .env.example                variáveis de ambiente (modelo)
└── package.json, .gitignore
```

## O que mudou em relação ao Painel SBS
| Item | SBS | Terra Pulse |
|---|---|---|
| Nome / marca | SBS Green Seeds | Terra Pulse |
| Logos / ícones | flame SBS | wordmark + ícone Terra Pulse (verde) |
| E-mails semente | `@sbsgreen.com.br` | `@terrapulse.com.br` |
| Emissor 2FA | "SBS Green" | "Terra Pulse" |
| Cor de marca | teal/verde-escuro SBS | verde Terra Pulse (`#0f3a1f` / `#1f8f4e`) |
| Origem no barramento | lê `de=sbs-brasil` | lê `de=terra-pulse` (tag do worker) |

**Mantido de propósito (config interna, invisível):** o prefixo de tabela
`sbs_` no Supabase e o nome `sbs_integracao` do barramento — são o MESMO nome que
o Worker já usa; renomear quebraria a integração.

## ⚠️ Front-end é um bundle
`painel-ifarm.html` é um HTML **auto-contido** (o app inteiro embutido). Para editar
o app de verdade seria preciso a fonte original; aqui a re-marcação foi feita por
substituição de texto/logo dentro do bundle. Funciona igual em produção.

## Login inicial (após semear)
```
Admin:  admin@terrapulse.com.br  ·  senha 12345678
(Marketing, Gerente, CEO, Inteligência, TI também são criados — mesma senha.)
```
Troca de senha é pedida no 1º acesso. Para não exigir 2FA, deixe `FORCAR_2FA=off`.
