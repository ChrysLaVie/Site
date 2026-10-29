#!/usr/bin/env node
// Gera a página própria de cada vaga ativa (vagas/<nome>/index.html) com:
//  - cartão de prévia (og:title, og:description, og:image) para WhatsApp e LinkedIn;
//  - marcação JobPosting (JSON-LD) para a vaga aparecer no Google Vagas;
// e atualiza sitemap.xml e robots.txt.
//
// Uso:
//   node ferramentas/gerar-paginas-vagas.cjs                 (busca as vagas no Supabase do site)
//   node ferramentas/gerar-paginas-vagas.cjs --dados v.json  (usa um JSON já baixado)
//
// Páginas de vagas que saíram do ar continuam abrindo (rota.js), mas perdem a
// marcação do Google, para a vaga sumir do Google Vagas.

const fs = require('fs');
const path = require('path');

const SITE = 'https://lavieconsultoria.com';
const SUPABASE = 'https://doinfhruwdwctnuoujxl.supabase.co';
const CHAVE = 'sb_publishable_6nicL2Ly8B3kIPH_v1a3Rg_BpBeBj2I';
const RAIZ = path.join(__dirname, '..');
const MARCA = '<!-- gerada por ferramentas/gerar-paginas-vagas.cjs -->';
const COLUNAS = 'id,title,slug,area,local,tipo,modelo,descricao,responsabilidades,requisitos,diferenciais,remuneracao,created_at,arte_linkedin,arte_feed,ativa,arquivada';

// Mesma regra de vagas/index.html (_slugTexto / _slugVaga).
function slugTexto(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/\((a|o|as|os|es)\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function slugs(vagas) {
  const mapa = new Map();
  const grupos = {};
  vagas.forEach(v => { const b = slugTexto(v.title) || String(v.id); (grupos[b] = grupos[b] || []).push(v); });
  Object.entries(grupos).forEach(([b, lista]) => {
    lista.sort((a, c) => String(a.created_at || '').localeCompare(String(c.created_at || '')));
    lista.forEach((v, i) => mapa.set(v.id, i > 0 ? `${b}-${i + 1}` : b));
  });
  return mapa;
}

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lista = a => (Array.isArray(a) ? a : []).filter(Boolean);

function tipoEmprego(t) {
  const x = slugTexto(t);
  if (x.includes('estag')) return 'INTERN';
  if (x.includes('temporar')) return 'TEMPORARY';
  if (x.includes('pj') || x.includes('autonom') || x.includes('freela')) return 'CONTRACTOR';
  if (x.includes('meio-periodo') || x.includes('part')) return 'PART_TIME';
  return 'FULL_TIME';
}

// Primeiro valor "R$ 1.234,56" de pelo menos R$ 1.000 na remuneração ou na descrição.
function salario(v) {
  for (const txt of [v.remuneracao, v.descricao]) {
    const achados = String(txt || '').match(/R\$\s?\d{1,3}(?:\.\d{3})+(?:,\d{2})?/g) || [];
    for (const a of achados) {
      const n = Number(a.replace(/[^\d,]/g, '').replace(',', '.'));
      if (n >= 1000 && n < 100000) return n;
    }
  }
  return null;
}

function local(v) {
  const [cidade, uf] = String(v.local || 'Goiânia/GO').split('/').map(s => s.trim());
  return { cidade: cidade || 'Goiânia', uf: uf || 'GO' };
}

function resumo(v) {
  return [v.tipo, v.modelo && v.local ? `${v.modelo} em ${v.local}` : (v.modelo || v.local), v.remuneracao]
    .filter(Boolean).join(' · ');
}

function descricaoHtml(v) {
  const p = String(v.descricao || '').split(/\n{2,}/).map(t => `<p>${esc(t).replace(/\n/g, '<br>')}</p>`).join('');
  const bloco = (titulo, itens) => itens.length ? `<p><strong>${titulo}</strong></p><ul>${itens.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : '';
  return p + bloco('Responsabilidades', lista(v.responsabilidades)) + bloco('Requisitos', lista(v.requisitos))
    + bloco('Diferenciais', lista(v.diferenciais))
    + (v.remuneracao ? `<p><strong>Remuneração:</strong> ${esc(v.remuneracao)}</p>` : '')
    + '<p>Processo seletivo conduzido pela La Vie Consultoria. Candidate-se pelo site.</p>';
}

function jobPosting(v, url) {
  const { cidade, uf } = local(v);
  const remoto = slugTexto(v.modelo) === 'remoto';
  const j = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: v.title,
    description: descricaoHtml(v),
    identifier: { '@type': 'PropertyValue', name: 'La Vie Consultoria', value: v.id },
    datePosted: String(v.created_at || new Date().toISOString()).slice(0, 10),
    employmentType: tipoEmprego(v.tipo),
    hiringOrganization: { '@type': 'Organization', name: 'La Vie Consultoria', sameAs: SITE, logo: `${SITE}/logo.png` },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: cidade, addressRegion: uf, addressCountry: 'BR' } },
    directApply: true,
    url,
  };
  if (v.area) j.industry = v.area;
  if (remoto) { j.jobLocationType = 'TELECOMMUTE'; j.applicantLocationRequirements = { '@type': 'Country', name: 'BR' }; }
  const s = salario(v);
  if (s) j.baseSalary = { '@type': 'MonetaryAmount', currency: 'BRL', value: { '@type': 'QuantitativeValue', value: s, unitText: 'MONTH' } };
  // "</" dentro do JSON fecharia a tag <script>.
  return JSON.stringify(j, null, 2).replace(/<\//g, '<\\/');
}

function pagina(v, nome) {
  const url = `${SITE}/vagas/${nome}`;
  const desc = `${resumo(v)}. Veja os detalhes e candidate-se pelo site da La Vie Consultoria.`;
  const img = v.arte_linkedin || v.arte_feed || `${SITE}/og-image.jpg`;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${MARCA}
<!-- Página própria da vaga: cartão de prévia no WhatsApp/LinkedIn, marcação do Google Vagas, e abre a vaga na página de vagas. -->
<title>${esc(v.title)} · Vagas · La Vie Consultoria</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="La Vie Consultoria">
<meta property="og:title" content="Vaga: ${esc(v.title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${esc(img)}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json" data-manter>
${jobPosting(v, url)}
</script>
<script src="/vagas/rota.js"></script>
</head>
<body style="background:#F5F1EA">
<noscript><h1>${esc(v.title)}</h1>${descricaoHtml(v)}<p><a href="${SITE}/vagas/">Ver vagas e candidatar-se</a></p></noscript>
</body>
</html>
`;
}

async function carregar() {
  const i = process.argv.indexOf('--dados');
  if (i > 0) return JSON.parse(fs.readFileSync(process.argv[i + 1], 'utf8'));
  const r = await fetch(`${SUPABASE}/rest/v1/vagas?select=${COLUNAS}&ativa=eq.true`, { headers: { apikey: CHAVE, Authorization: `Bearer ${CHAVE}` } });
  if (!r.ok) throw new Error(`Supabase respondeu ${r.status}`);
  return r.json();
}

async function main() {
  const vagas = (await carregar()).filter(v => v.ativa && !v.arquivada);
  if (!vagas.length) throw new Error('Nenhuma vaga ativa veio do banco; nada foi alterado.');
  const nomes = slugs(vagas);
  const ativas = new Set();

  vagas.forEach(v => {
    const nome = nomes.get(v.id);
    ativas.add(nome);
    const dir = path.join(RAIZ, 'vagas', nome);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), pagina(v, nome));
    console.log('vaga ativa:', nome);
  });

  // Vagas que saíram do ar: tira a marcação do Google, mantém a página abrindo.
  fs.readdirSync(path.join(RAIZ, 'vagas'), { withFileTypes: true })
    .filter(d => d.isDirectory() && !ativas.has(d.name))
    .forEach(d => {
      const f = path.join(RAIZ, 'vagas', d.name, 'index.html');
      if (!fs.existsSync(f)) return;
      const html = fs.readFileSync(f, 'utf8');
      const sem = html.replace(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\n?/g, '');
      if (sem !== html) { fs.writeFileSync(f, sem); console.log('marcação removida (vaga fora do ar):', d.name); }
    });

  const hoje = new Date().toISOString().slice(0, 10);
  const urls = [`${SITE}/`, `${SITE}/vagas/`, `${SITE}/portfolio.html`, ...[...ativas].map(n => `${SITE}/vagas/${n}`)];
  fs.writeFileSync(path.join(RAIZ, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    + urls.map(u => `  <url><loc>${u}</loc><lastmod>${hoje}</lastmod></url>`).join('\n') + '\n</urlset>\n');
  fs.writeFileSync(path.join(RAIZ, 'robots.txt'),
    `User-agent: *\nDisallow: /clientes/\nDisallow: /database/\nDisallow: /tests/\n\nSitemap: ${SITE}/sitemap.xml\n`);
  console.log('sitemap.xml e robots.txt atualizados');
}

main().catch(e => { console.error(e.message); process.exit(1); });
