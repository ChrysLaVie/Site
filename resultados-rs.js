/* Resultados completos seguem no cadastro privado do candidato, sem links públicos. */
function lvResultadoDocumento(tipo, dados) {
  const copia=JSON.parse(JSON.stringify(dados));
  // Identidade por conteúdo: retentativas não acrescentam anexos iguais.
  const serial=JSON.stringify(copia);
  let hash=2166136261;
  for(let i=0;i<serial.length;i++) hash=Math.imul(hash^serial.charCodeAt(i),16777619)>>>0;
  return {nome:tipo==='disc'?'Resultado DISC (automático)':'Formulário completo (automático)',
    path:'resultado-site/'+tipo+'/'+hash.toString(16),resultadoSite:tipo,dados:copia,
    enviadoPor:'Site (automático)',enviadoEm:new Date().toISOString()};
}
function lvResultadoHtml(doc) {
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={nome:'Nome',name:'Nome',email:'E-mail',phone:'Telefone',whatsapp:'WhatsApp',vaga_titulo:'Vaga',pretensao_salarial:'Pretensão salarial',observacoes:'Observações',technical_score:'Pontuação técnica',technical_answers:'Respostas do questionário',pergunta:'Pergunta',escolhida:'Resposta',correta:'Resposta correta',resposta:'Resposta',respostas_perfil:'Perfil profissional',respostas_comerciais:'Experiência comercial',qualificacao:'Qualificação',situacoes:'Situações práticas',scores:'Pontuações DISC',primary:'Perfil predominante',secondary:'Perfil secundário',primary_profile:'Perfil predominante',secondary_profile:'Perfil secundário',most:'Pontuações DISC',ciente_pj:'Ciência do regime PJ',ciente_clt:'Ciência do regime CLT',ciente_remuneracao:'Ciência da remuneração',ciente_presencial:'Ciência do trabalho presencial',ciente_horario:'Ciência da jornada',created_at:'Data do envio',nota_conhecimentos:'Nota de conhecimentos',aptidao:'Aptidão',pontos_teorica:'Pontos na prova teórica',total_teorica:'Total da prova teórica',remuneracao_exibida:'Remuneração apresentada'};
  const perfis={D:'Dominância',I:'Influência',S:'Estabilidade',C:'Conformidade'};
  function render(v,key='',depth=0){
    if(depth>8)return esc(JSON.stringify(v));
    if(v===null||v===undefined)return 'Não informado';
    if(typeof v==='boolean')return v?'Sim':'Não';
    if(Array.isArray(v))return '<ol>'+v.map(x=>'<li>'+render(x,'',depth+1)+'</li>').join('')+'</ol>';
    if(typeof v==='object')return '<dl>'+Object.entries(v).filter(([k])=>!['id','arquivada','pdf_url'].includes(k)).map(([k,x])=>'<dt>'+esc(labels[k]||k.replace(/_/g,' '))+'</dt><dd>'+render(x,k,depth+1)+'</dd>').join('')+'</dl>';
    return esc(/^(primary|secondary)(_profile)?$/.test(key)?(perfis[v]||v):v);
  }
  return '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>'+esc(doc.nome)+'</title><style>body{font:15px/1.5 system-ui;max-width:800px;margin:40px auto;padding:0 24px;color:#333}h1{font-family:Georgia}dt{font-weight:600;margin-top:16px}dd{margin:4px 0 12px;white-space:pre-wrap}li{break-inside:avoid;border-bottom:1px solid #ddd;padding:10px 0}button{padding:10px 16px}footer{margin-top:32px;color:#666}@media print{button{display:none}body{margin:0}dt{break-after:avoid}}</style><button onclick="window.print()">Imprimir / Salvar em PDF</button><h1>La Vie Consultoria</h1><h2>'+esc(doc.nome)+'</h2>'+render(doc.dados)+'<footer>Documento de uso interno do processo seletivo. Enviado automaticamente pelo site.</footer></html>';
}
function lvAbrirResultado(doc){
  const tela=window.open('','_blank');
  if(!tela){alert('Permita abrir uma nova janela para visualizar o resultado.');return;}
  tela.opener=null;
  tela.document.write(lvResultadoHtml(doc));
  tela.document.close();
}
