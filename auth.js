-- ============================================================
-- Terra Pulse — Painel Gerencial · Schema Supabase/Postgres
-- Modelo do store.js: cada coleção é a tabela sbs_<nome> com
--   id text PK, data jsonb (o item inteiro), updated_at timestamptz.
-- (O prefixo interno `sbs_` é mantido de propósito: é o MESMO nome de
--  tabela que o Worker Terra Pulse Brasil usa no barramento compartilhado
--  `sbs_integracao`. Trocar o prefixo quebraria a integração — não mexa.)
-- Rode este arquivo no SQL Editor do Supabase (uma vez).
-- ============================================================

create or replace function sbs_criar_colecao(nome text) returns void as $$
begin
  execute format($f$
    create table if not exists %I (
      id         text primary key,
      data       jsonb not null default '{}'::jsonb,
      updated_at timestamptz not null default now()
    );
    create index if not exists %I on %I using gin (data);
    create index if not exists %I on %I ((data->>'tenant'));
  $f$, 'sbs_'||nome, 'ix_'||nome||'_data', 'sbs_'||nome, 'ix_'||nome||'_tenant', 'sbs_'||nome);
end;
$$ language plpgsql;

-- Coleções da plataforma.
select sbs_criar_colecao(n) from unnest(array[
  'usuarios','tenants','auditoria',
  'vendedores','vendas','eventos','leads','orcamentos',
  'produtos','campanhas','notificacoes','demandas','parceiros','alertas','cashback','lixeira',
  'monitoramentos','aprovacoes','aprovacoes_hist','governanca','dossies','canais','integracao','biblioteca','metricas',
  'mi_cotacoes','mi_concorrentes','mi_cc_movimentos','mi_regioes','mi_tendencias'
]) as n;

-- Segurança: as Pages Functions usam a SERVICE_KEY (bypassa RLS).
-- RLS LIGADO e SEM políticas públicas → nenhum acesso anônimo direto.
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname='public' and tablename like 'sbs_%'
  loop
    execute format('alter table %I enable row level security;', t.tablename);
  end loop;
end $$;

-- Pronto. O primeiro login semeia sbs_usuarios automaticamente
-- (equipe Terra Pulse ou USERS_JSON), senha inicial 12345678, precisaTrocar=true.
-- A tabela sbs_integracao é o BARRAMENTO compartilhado com o Worker.
