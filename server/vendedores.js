/* Vendedores — cadastro da equipe comercial (App do Vendedor).
   GET    /api/vendedores
   POST   /api/vendedores  { id?, nome, email?, telefone?, cidade?, uf?, parceira?, gerente?, ativo? }
   PATCH  /api/vendedores  { id, ...campos }
   DELETE /api/vendedores?id=...
   Coleção: "vendedores". Isolado por tenant.
*/
const { list, get, put, remove, ok, fail, audit, clientIp, tenantStore, pageOpts } = require('./_lib/store');
const { fromEvent, tenantFromEvent, requireAuth } = require('./_lib/auth');

exports.handler = async (event) => {
  try {
    const db = tenantStore(tenantFromEvent(event));
    const u = fromEvent(event) || {};

    if (event.httpMethod === 'GET') {
      const q = event.queryStringParameters || {};
      return ok(await db.list('vendedores', {}, pageOpts(q)));
    }

    if (event.httpMethod === 'POST') {
      const r = requireAuth(event, ['marketing', 'gerente', 'ceo', 'admin']);
      if (r.erro) return fail(r.erro, r.code);
      const b = JSON.parse(event.body || '{}');
      if (!b.nome) return fail('Informe o nome do vendedor');
      const now = new Date().toISOString();
      const item = {
        id: b.id || ('vend_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)),
        nome: String(b.nome).trim(),
        email: (b.email || '').trim().toLowerCase(),
        telefone: b.telefone || '',
        cidade: b.cidade || '',
        uf: b.uf || '',
        parceira: b.parceira || '',
        gerente: b.gerente || '',
        ativo: b.ativo !== false,
        criadoEm: now,
        criadoPor: u.sub || 'sistema'
      };
      const saved = await db.put('vendedores', item);
      await audit({ usuario: u.sub, perfil: u.perfil, acao: b.id ? 'editou' : 'criou', entidade: 'vendedores', entidadeId: saved.id, ip: clientIp(event) });
      return ok(saved);
    }

    if (event.httpMethod === 'PATCH') {
      const r = requireAuth(event, ['marketing', 'gerente', 'ceo', 'admin']);
      if (r.erro) return fail(r.erro, r.code);
      const b = JSON.parse(event.body || '{}');
      if (!b.id) return fail('id obrigatório');
      const cur = await db.get('vendedores', b.id);
      if (!cur) return fail('Vendedor não encontrado', 404);
      const saved = await db.put('vendedores', Object.assign({}, cur, b, { atualizadoEm: new Date().toISOString() }));
      await audit({ usuario: u.sub, perfil: u.perfil, acao: 'editou', entidade: 'vendedores', entidadeId: b.id, ip: clientIp(event) });
      return ok(saved);
    }

    if (event.httpMethod === 'DELETE') {
      const r = requireAuth(event, ['marketing', 'gerente', 'ceo', 'admin']);
      if (r.erro) return fail(r.erro, r.code);
      const id = (event.queryStringParameters || {}).id;
      if (!id) return fail('id obrigatório');
      await db.remove('vendedores', id);
      await audit({ usuario: u.sub, perfil: u.perfil, acao: 'removeu', entidade: 'vendedores', entidadeId: id, ip: clientIp(event) });
      return ok({ removido: id });
    }

    return fail('Método não suportado', 405);
  } catch (e) { return fail(e.message, 500); }
};
