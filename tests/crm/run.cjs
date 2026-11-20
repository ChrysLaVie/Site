// Testes da área Comercial (CRM): 64 verificações de clientes/comercial/index.html.
// Escritos pela Cláudia em 18/11/2026; adaptados pelo Agnaldo em 19/11/2026 para rodar de
// qualquer máquina. Não tocam no banco real: a página roda com o banco falso de mock.js.
// Como rodar: veja LEIA-ME.md nesta pasta.
const { chromium } = require('playwright');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const RAIZ = path.join(__dirname, '..', '..');           // raiz do repositório
const PORTA = Number(process.env.PORTA || 8765);
const SAIDA = process.env.CRM_FOTOS || fs.mkdtempSync(path.join(os.tmpdir(), 'crm-testes-')); // fotos das telas
const TIPOS = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.json':'application/json', '.ico':'image/x-icon', '.webp':'image/webp' };
function servidor(){
  return new Promise((res, rej) => {
    const s = http.createServer((req, r) => {
      let rel = decodeURIComponent(req.url.split('?')[0]);
      if (rel.endsWith('/')) rel += 'index.html';
      const arq = path.join(RAIZ, rel);
      if (!arq.startsWith(RAIZ)) { r.writeHead(403); return r.end(); }
      fs.readFile(arq, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TIPOS[path.extname(arq).toLowerCase()] || 'application/octet-stream' }); r.end(b); });
    });
    s.on('error', rej); s.listen(PORTA, '127.0.0.1', () => res(s));
  });
}
(async () => {
  const srv = await servidor();
  const opcoes = { args:['--no-sandbox'] };
  const chrome = process.env.CHROME || (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : '');
  if (chrome) opcoes.executablePath = chrome;   // sem isso, usa o navegador do próprio Playwright
  const browser = await chromium.launch(opcoes);
  const mock = fs.readFileSync(__dirname+'/mock.js','utf8').replaceAll('127.0.0.1:8765', '127.0.0.1:'+PORTA);
  const res = []; const ok = (n,c,extra) => { console.log((c?'PASS ':'FAIL ')+n+(c?'':' '+(extra||''))); res.push((c?'PASS ':'FAIL ')+n+(c?'':' '+(extra||''))); };
  async function nova(pre, vp){ const ctx = await browser.newContext({ viewport: vp||{width:1360,height:900} }); const page = await ctx.newPage(); const errs=[]; page.on('pageerror', e=>errs.push(String(e))); page.on('console', m=>{ if(m.type()==='error' && !/Failed to load resource|net::ERR|falha simulada/.test(m.text())) errs.push(m.text()); });
    await page.route('**/*', r => { const u=r.request().url(); if(u.startsWith('http://127.0.0.1')) return r.continue(); return r.abort(); });
    await page.addInitScript((pre||'')+';'+mock); await page.goto('http://127.0.0.1:'+PORTA+'/clientes/comercial/'); await page.waitForTimeout(400); return {page,errs,ctx}; }

  // 1. sem sessão e sem permissão
  let t = await nova('window.__NOSESSION__=true');
  ok('sem sessão mostra portão', await t.page.isVisible('#gate') && !(await t.page.isVisible('#app')));
  await t.ctx.close();
  t = await nova('window.__ROLE__="cliente_admin"');
  ok('cliente não entra', (await t.page.textContent('#gate-t'))==='Área restrita' && !(await t.page.isVisible('#app')));
  ok('cliente não carrega tabelas crm', !(await t.page.evaluate(()=> (window.__LOG__||[]).some(x=>x.startsWith('crm_')))));
  await t.ctx.close();

  // 2. master
  t = await nova(''); const p = t.page;
  ok('app visível', await p.isVisible('#app'));
  const hoje = await p.textContent('#view');
  ok('Hoje: atrasado aparece', /Atrasado desde/.test(hoje) && /Cobrar retorno/.test(hoje));
  ok('Hoje: proposta vencida', /Validade vencida/.test(hoje) && /há 22 dias/.test(hoje));
  ok('Hoje: sem próxima ação', /Definir retorno/.test(hoje));
  ok('Hoje: KPI funil 3 e valor', /R\$\s?15\.000/.test(hoje) && /R\$\s?500 por mês/.test(hoje));
  ok('badge de pendências = 1', (await p.textContent('.tab.on .n'))==='1');
  ok('XSS escapado', (await p.evaluate(()=>document.querySelectorAll('#view script').length))===0 && /Cartão Exemplo <script>/.test(hoje));
  await p.screenshot({path:SAIDA+'/01-hoje.png', fullPage:true});

  // Funil
  await p.click('[data-act="aba"][data-id="funil"]');
  ok('funil: 5 colunas abertas', (await p.locator('.kcol').count())===5);
  ok('funil: 3 cartões', (await p.locator('.kcard').count())===3);
  await p.screenshot({path:SAIDA+'/02-funil.png', fullPage:true});
  // arrastar: contato -> negociacao
  const card = p.locator('.kcol[data-etapa="contato"] .kcard').first(); const alvo = p.locator('.kcol[data-etapa="negociacao"]');
  await card.dragTo(alvo); await p.waitForTimeout(300);
  ok('arrastar muda etapa', (await p.locator('.kcol[data-etapa="negociacao"] .kcard').count())===1, await p.evaluate(()=>JSON.stringify(window.__DB__.crm_oportunidades.map(o=>o.etapa))));
  // arrastar para perdido pede motivo
  await p.check('[data-in="funil.fechadas"]'); await p.waitForTimeout(100);
  ok('mostrar fechadas: 7 colunas', (await p.locator('.kcol').count())===7);
  await p.evaluate(()=>{document.querySelector('.kan').scrollLeft=9999;}); await p.waitForTimeout(100);
  await p.locator('.kcol[data-etapa="negociacao"] .kcard').first().dragTo(p.locator('.kcol[data-etapa="perdido"]')); await p.waitForTimeout(200);
  ok('perdido pede motivo', await p.isVisible('#mv-motivo'));
  await p.click('#m-salvar'); await p.waitForTimeout(150);
  ok('sem motivo não salva', await p.isVisible('#mv-motivo') && (await p.evaluate(()=>window.__DB__.crm_oportunidades.filter(o=>o.etapa==='perdido').length))===0);
  await p.fill('#mv-motivo','Sem resposta'); await p.click('#m-salvar'); await p.waitForTimeout(300);
  ok('perdido com motivo', (await p.evaluate(()=>{const o=window.__DB__.crm_oportunidades.find(o=>o.etapa==='perdido'); return o&&o.motivo_perda;}))==='Sem resposta' && !(await p.isVisible('.modal')));

  // Novo lead com conta nova
  await p.click('.top [data-act="novo-lead"]'); await p.waitForTimeout(100);
  ok('novo lead: campos de conta nova visíveis', await p.isVisible('#o-n-nome'));
  await p.click('#m-salvar'); await p.waitForTimeout(100);
  ok('novo lead: valida título', await p.isVisible('.modal') && /Escreva o que a pessoa quer/.test(await p.textContent('#msg-root')));
  await p.fill('#o-n-nome','Padaria Teste'); await p.fill('#o-n-contato','João'); await p.fill('#o-n-tel','62 98888-7777'); await p.fill('#o-titulo','Triagem de talentos'); await p.fill('#o-valor','1.234,50'); await p.fill('#o-acao','Ligar'); await p.fill('#o-quando','2026-11-20');
  await p.click('[data-act="item-add"]'); await p.selectOption('#o-itens [data-item-prod]', {label:'Revisão de Currículo'}); await p.fill('#o-itens [data-item-valor]','250');
  await p.click('#m-salvar'); await p.waitForTimeout(400);
  const db1 = await p.evaluate(()=>({c:window.__DB__.crm_contas.find(c=>c.nome==='Padaria Teste'), k:window.__DB__.crm_contatos.find(k=>k.nome==='João'), o:window.__DB__.crm_oportunidades.find(o=>o.titulo==='Triagem de talentos'), i:window.__DB__.crm_oportunidade_itens}));
  ok('novo lead cria conta, contato, oportunidade e item', db1.c && db1.k && db1.k.conta_id===db1.c.id && db1.o && db1.o.conta_id===db1.c.id && db1.o.valor===1234.5 && db1.o.contato_id===db1.k.id && db1.i.length===1 && db1.i[0].valor===250, JSON.stringify(db1));
  ok('modal fecha e cartão aparece', !(await p.isVisible('.modal')) && /Triagem de talentos/.test(await p.textContent('#view')));

  // editar oportunidade: abrir e salvar sem mexer não recria itens
  await p.evaluate(()=>{window.__LOG__=[];});
  await p.click('.kcard:has-text("Triagem de talentos")'); await p.waitForTimeout(100);
  ok('editar: item carregado', (await p.locator('#o-itens [data-item]').count())===1 && (await p.inputValue('#o-valor'))==='1234,5');
  await p.click('#m-salvar'); await p.waitForTimeout(300);
  ok('salvar sem mudar não regrava itens', !(await p.evaluate(()=>window.__LOG__.some(x=>x.startsWith('crm_oportunidade_itens')))));

  // Contas
  await p.click('[data-act="aba"][data-id="contas"]');
  ok('contas: 4 linhas', (await p.locator('tr.clk').count())===4);
  await p.fill('[data-in="contas.q"]','fulan'); await p.waitForTimeout(100);
  ok('busca por contato', (await p.locator('tr.clk').count())===1 && (await p.evaluate(()=>document.activeElement && document.activeElement.dataset.in))==='contas.q');
  await p.fill('[data-in="contas.q"]',''); await p.selectOption('[data-in="contas.sit"]','cliente_ativo'); await p.waitForTimeout(100);
  ok('filtro situação', (await p.locator('tr.clk').count())===1);
  await p.click('tr.clk'); await p.waitForTimeout(150);
  const dr = await p.textContent('.drawer');
  ok('gaveta: financeiro do R&S', /Recebido/.test(dr) && /R\$\s?1\.000/.test(dr) && /R\$\s?500/.test(dr));
  await p.screenshot({path:SAIDA+'/03-conta.png'});
  await p.fill('#at-txt','Falei com o Giuseppe'); await p.click('[data-act="ativ-salvar"]'); await p.waitForTimeout(200);
  ok('atividade registrada e gaveta continua aberta', /Falei com o Giuseppe/.test(await p.textContent('.drawer')) && (await p.evaluate(()=>window.__DB__.crm_atividades.some(a=>a.texto==='Falei com o Giuseppe'&&a.criado_por==='Chrys'))));
  await p.click('[data-act="contato-novo"]'); await p.fill('#k-nome','Giuseppe Vecci'); await p.check('#k-dec'); await p.click('#m-salvar'); await p.waitForTimeout(250);
  ok('contato novo com selo Decide', /Giuseppe Vecci/.test(await p.textContent('.drawer')) && /Decide/.test(await p.textContent('.drawer')));
  // ocultar conta
  await p.click('[data-act="conta-editar"]'); await p.check('#c-oculta'); await p.click('#m-salvar'); await p.waitForTimeout(250);
  await p.keyboard.press('Escape'); await p.selectOption('[data-in="contas.sit"]',''); await p.waitForTimeout(100);
  ok('conta oculta some da lista sem apagar', (await p.locator('tr.clk').count())===3 && (await p.evaluate(()=>window.__DB__.crm_contas.length))===4);
  await p.check('[data-in="contas.ocultas"]'); await p.waitForTimeout(100);
  ok('mostrar ocultas', (await p.locator('tr.clk').count())===4);

  // Propostas
  await p.click('[data-act="aba"][data-id="propostas"]');
  ok('propostas em aberto: 2 (enviada + a confirmar)', (await p.locator('tr.clk').count())===2);
  const href = await p.getAttribute('tr.clk a[data-stop]','href'); ok('link do arquivo', href==='https://docs.google.com/document/d/abc');
  await p.click('tr.clk:has-text("Cartão Exemplo") td:first-child'); await p.waitForTimeout(100);
  await p.selectOption('#p-status','aceita'); await p.click('#m-salvar'); await p.waitForTimeout(250);
  ok('status da proposta salvo e conferir limpo', (await p.evaluate(()=>{const x=window.__DB__.crm_propostas.find(x=>x.destinatario==='Fulana'); return x.status==='aceita' && x.conferir===false;})));
  await p.click('.head [data-act="prop-nova"]'); await p.waitForTimeout(100);
  await p.click('#m-salvar'); await p.waitForTimeout(100); ok('proposta: valida conta', await p.isVisible('.modal'));
  await p.selectOption('#p-conta',{label:'Maria Exemplo'}); await p.waitForTimeout(100);
  ok('proposta: oportunidades da conta aparecem', await p.isVisible('#p-opp'));
  await p.fill('#p-titulo','Marketing pessoal'); await p.fill('#p-valor','R$ 2.500'); await p.click('#m-salvar'); await p.waitForTimeout(250);
  ok('proposta nova salva com valor', (await p.evaluate(()=>{const x=window.__DB__.crm_propostas.find(x=>x.titulo==='Marketing pessoal'); return x && x.valor===2500 && x.validade_dias===15;})));
  await p.screenshot({path:SAIDA+'/04-propostas.png', fullPage:true});
  // falha do banco aparece
  await p.evaluate(()=>{window.__FAIL__='crm_propostas:update';});
  await p.click('tr.clk:has-text("Marketing pessoal") td:first-child'); await p.fill('#p-titulo','Outro'); await p.click('#m-salvar'); await p.waitForTimeout(250);
  ok('erro do banco: avisa e mantém a janela', await p.isVisible('.modal') && /Não foi possível salvar a proposta/.test(await p.textContent('#msg-root')) && !(await p.isDisabled('#m-salvar')));
  await p.evaluate(()=>{window.__FAIL__=null;}); await p.keyboard.press('Escape');
  // excluir proposta
  await p.selectOption('[data-in="propostas.status"]',''); await p.waitForTimeout(100);
  const antes = await p.locator('tr.clk').count();
  await p.click('tr.clk:has-text("Antiga") td:first-child'); await p.click('[data-act="prop-excluir"]'); await p.waitForTimeout(100); await p.click('#m-salvar'); await p.waitForTimeout(250);
  ok('excluir proposta com confirmação', (await p.locator('tr.clk').count())===antes-1);

  ok('num: formatos', await p.evaluate(()=>JSON.stringify([num('2.500'),num('R$ 2.500,00'),num('1.234.567'),num('250'),num('12.5'),num('1722,33'),num(''),num('abc'),num('3.000,5')]))==='[2500,2500,1234567,250,12.5,1722.33,null,null,3000.5]');
  // Catálogo
  await p.click('[data-act="aba"][data-id="catalogo"]');
  const cat = await p.textContent('#view');
  ok('catálogo: preços', /A partir de R\$\s?250/.test(cat) && /R\$\s?2\.000 a R\$\s?2\.800 por mês/.test(cat) && /De R\$\s?2\.000,01 a R\$\s?4\.000: 60%/.test(cat) && /Acima de R\$\s?8\.000: 40%/.test(cat));
  const cid = await p.getAttribute('[data-calc]','data-calc');
  await p.fill('[data-calc]','3.000'); await p.waitForTimeout(80);
  ok('simulador 3.000 = 1.800 (60%)', /R\$\s?1\.800/.test(await p.textContent('#calc-out-'+cid)) && /60%/.test(await p.textContent('#calc-out-'+cid)) && !(await p.isVisible('.modal')));
  await p.fill('[data-calc]','1722,33'); await p.waitForTimeout(80);
  ok('simulador 1.722,33 = 1.205,63 (70%)', /1\.205,63/.test(await p.textContent('#calc-out-'+cid)));
  await p.fill('[data-calc]','10000'); await p.waitForTimeout(80);
  ok('simulador 10.000 = 4.000 (40%)', /R\$\s?4\.000/.test(await p.textContent('#calc-out-'+cid)));
  await p.screenshot({path:SAIDA+'/05-catalogo.png', fullPage:true});
  await p.click('.head [data-act="prod-novo"]'); await p.fill('#pr-nome','Produto X'); await p.selectOption('#pr-tipo','percentual_salario'); await p.waitForTimeout(50);
  await p.fill('#pr-faixas [data-fx-pct]','80'); await p.click('[data-act="faixa-add"]');
  await p.locator('#pr-faixas [data-fx-ate]').nth(1).fill('1500'); await p.locator('#pr-faixas [data-fx-pct]').nth(1).fill('100');
  await p.click('#m-salvar'); await p.waitForTimeout(250);
  ok('produto com faixas ordenadas', (await p.evaluate(()=>JSON.stringify(window.__DB__.crm_produtos.find(x=>x.nome==='Produto X').faixas)))==='[{"ate":1500,"pct":100},{"ate":null,"pct":80}]');
  await p.click('.prod:has-text("Revisão de Currículo") .n'); await p.selectOption('#pr-status','inativo'); await p.click('#m-salvar'); await p.waitForTimeout(250);
  ok('inativo some do catálogo padrão', !/Revisão de Currículo/.test(await p.textContent('#view')));
  // Materiais
  await p.click('[data-act="aba"][data-id="materiais"]');
  ok('materiais: cartão com imagem e legenda', (await p.locator('.mat').count())===1 && (await p.locator('.mat-img img').count())===1 && /Sou a Chrys/.test(await p.textContent('.mat-leg')));
  await p.evaluate(()=>{ window.__CLIP__=null; navigator.clipboard.writeText = async t => { window.__CLIP__=t; }; });
  await p.click('[data-act="mat-copiar"]'); await p.waitForTimeout(100);
  ok('copiar legenda leva o texto inteiro', (await p.evaluate(()=>window.__CLIP__))==='Olá, pessoal.\nSou a Chrys.' && /Legenda copiada/.test(await p.textContent('#msg-root')) && !(await p.isVisible('.modal')));
  await p.click('[data-act="mat-uso"]'); await p.waitForTimeout(100); await p.click('#m-salvar'); await p.waitForTimeout(100);
  ok('uso: exige onde', await p.isVisible('.modal'));
  await p.fill('#us-onde','Grupo de networking'); await p.click('#m-salvar'); await p.waitForTimeout(250);
  ok('uso registrado', (await p.evaluate(()=>window.__DB__.crm_materiais[0].usos.length===1 && window.__DB__.crm_materiais[0].usos[0].onde==='Grupo de networking')) && /Usado 1 vez/.test(await p.textContent('.mat-f')));
  await p.click('.head [data-act="mat-novo"]'); await p.fill('#mt-titulo','Post de vaga'); await p.fill('#mt-canal','Instagram'); await p.fill('#mt-leg','Texto do post');
  await p.setInputFiles('#mt-arq', {name:'Arte nova ção.png', mimeType:'image/png', buffer: Buffer.from('89504e470d0a1a0a','hex')});
  await p.click('#m-salvar'); await p.waitForTimeout(350);
  const mm = await p.evaluate(()=>({m:window.__DB__.crm_materiais.find(x=>x.titulo==='Post de vaga'), arq:window.__ARQ__}));
  ok('material novo com arquivo enviado ao bucket', mm.m && mm.arq.length===1 && mm.m.arquivo_path===mm.arq[0] && /^materiais\/\d+_Arte-nova-cao\.png$/.test(mm.arq[0]) && mm.m.arquivo_nome==='Arte nova ção.png' && mm.m.arquivo_mime==='image/png', JSON.stringify(mm));
  ok('material novo aparece com prévia', (await p.locator('.mat').count())===2 && (await p.locator('.mat-img img').count())===2);
  await p.selectOption('[data-in="mat.canal"]','Instagram'); await p.waitForTimeout(100);
  ok('filtro por canal', (await p.locator('.mat').count())===1);
  await p.evaluate(()=>{window.__FAIL__='storage:upload';});
  await p.click('.mat .n'); await p.setInputFiles('#mt-arq', {name:'x.png', mimeType:'image/png', buffer: Buffer.from('00','hex')}); await p.click('#m-salvar'); await p.waitForTimeout(250);
  ok('falha no envio do arquivo: avisa e não grava', await p.isVisible('.modal') && /Não foi possível enviar o arquivo/.test(await p.textContent('#msg-root')));
  await p.evaluate(()=>{window.__FAIL__=null;}); await p.keyboard.press('Escape');
  await p.click('.mat .n'); await p.check('#mt-arqv'); await p.click('#m-salvar'); await p.waitForTimeout(250);
  ok('arquivar tira da lista sem apagar', (await p.locator('.mat').count())===0 && (await p.evaluate(()=>window.__DB__.crm_materiais.length))===2);
  await p.selectOption('[data-in="mat.canal"]',''); await p.check('[data-in="mat.arquivados"]'); await p.waitForTimeout(100);
  await p.click('.mat:has-text("Post de vaga") .n'); await p.click('[data-act="mat-excluir"]'); await p.waitForTimeout(100); await p.click('#m-salvar'); await p.waitForTimeout(300);
  ok('excluir material remove registro e arquivo', (await p.evaluate(()=>window.__DB__.crm_materiais.length===1 && window.__ARQ__.length===0)));
  await p.screenshot({path:SAIDA+'/08-materiais.png', fullPage:true});
  // Canais
  await p.click('[data-act="aba"][data-id="canais"]');
  ok('canais: 3 grupos e 4 canais', (await p.locator('#view .h2').count())===3 && (await p.locator('#view .item').count())===4 && /4 canais: 2 para produtos de empresas e 2 para produtos de pessoas/.test(await p.textContent('#view')));
  await p.selectOption('[data-in="canais.uso"]','pj'); await p.waitForTimeout(100);
  ok('canais: filtro produtos de empresas', (await p.locator('#view .item').count())===2 && !/Indeed/.test(await p.textContent('#view')));
  await p.selectOption('[data-in="canais.uso"]','nenhum'); await p.waitForTimeout(100);
  ok('canais: só vagas', (await p.locator('#view .item').count())===1 && /Indeed/.test(await p.textContent('#view')));
  await p.selectOption('[data-in="canais.uso"]',''); await p.click('.head [data-act="canal-novo"]'); await p.fill('#cn-nome','ABRH-GO'); await p.fill('#cn-grupo','Eventos'); await p.click('#m-salvar'); await p.waitForTimeout(250);
  ok('canal novo salvo', (await p.evaluate(()=>{const c=window.__DB__.crm_canais.find(x=>x.nome==='ABRH-GO'); return c && c.grupo==='Eventos' && c.produtos==='pj' && c.divulga_vagas===false && c.ordem>40;})) && /ABRH-GO/.test(await p.textContent('#view')), await p.evaluate(()=>JSON.stringify(window.__DB__.crm_canais.find(x=>x.nome==='ABRH-GO'))+' | '+document.getElementById('msg-root').textContent));
  await p.click('.item:has-text("Indeed") .t'); await p.uncheck('#cn-ativo'); await p.click('#m-salvar'); await p.waitForTimeout(250);
  ok('canal inativo sai da lista', !/Indeed/.test(await p.textContent('#view')) && (await p.evaluate(()=>window.__DB__.crm_canais.length))===5);
  await p.screenshot({path:SAIDA+'/09-canais.png', fullPage:true});
  ok('sem erros de script', t.errs.length===0, JSON.stringify(t.errs));
  await t.ctx.close();

  // celular
  t = await nova('', {width:390,height:800});
  ok('celular: sem rolagem lateral na página', await t.page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
  await t.page.click('[data-act="aba"][data-id="contas"]'); await t.page.click('tr.clk'); await t.page.waitForTimeout(150);
  await t.page.screenshot({path:SAIDA+'/06-celular-conta.png'});
  await t.page.keyboard.press('Escape'); await t.page.click('[data-act="aba"][data-id="hoje"]'); await t.page.screenshot({path:SAIDA+'/07-celular-hoje.png', fullPage:true});
  ok('celular: sem erros', t.errs.length===0, JSON.stringify(t.errs));
  await t.ctx.close();
  await browser.close();
  srv.close();
  const falhas = res.filter(r=>r.startsWith('FAIL')).length;
  console.log(falhas+' falhas de '+res.length+' (fotos das telas em '+SAIDA+')');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error('ERRO', String(e).slice(0,300)); process.exit(1); });
