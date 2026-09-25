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

// Mapa vaga -> formulário, usado pelo DISC (redireciona para o formulário) e
// pelo R&S (link nos avisos de etapa pendente). Fica dentro de uma função
// para as constantes não colidirem com as páginas que carregam este arquivo.
const lvFormsUrlParaVaga = (() => {
  // Cada vaga tem seu próprio formulário, com perguntas técnicas do cargo.
  // Vaga sem formulário cadastrado NÃO é redirecionada: o candidato encerra aqui,
  // para não responder um questionário técnico de outro cargo e receber uma nota
  // que não é dele.
  const FORMS_GERENTE_CAPTACAO  = 'https://lavieconsultoria.com/vagas/forms-gerente-captacao.html';
  const FORMS_COORD_INSTITUTO   = 'https://lavieconsultoria.com/vagas/forms-coord-instituto.html';
  const FORMS_GERENTE_MARKETING = 'https://lavieconsultoria.com/vagas/forms-gerente-marketing.html';
  const FORMS_COORD_RELACIONAMENTO = 'https://lavieconsultoria.com/vagas/forms-coord-relacionamento.html';
  const FORMS_MOTORISTA = 'https://lavieconsultoria.com/vagas/forms-motorista.html';
  const FORMS_COORD_COMERCIALIZACAO = 'https://lavieconsultoria.com/vagas/forms-coord-comercializacao.html';
  const FORMS_COORD_ACADEMICO = 'https://lavieconsultoria.com/vagas/forms-coord-academico.html';
  const FORMS_DUCARMO_VENDEDORA = 'https://lavieconsultoria.com/vagas/forms-ducarmo-vendedora.html';
  const FORMS_CONSULTOR_ESPECIALISTA = 'https://lavieconsultoria.com/vagas/forms-consultor-protecao-veicular.html';
  const FORMS_VENDAS_EDUCACIONAL = 'https://lavieconsultoria.com/vagas/forms-consultor-vendas-educacional.html';
  const FORMS_ANALISTA_MARKETING = 'https://lavieconsultoria.com/vagas/forms-analista-marketing.html';
  const FORMS_SECRETARIA = 'https://lavieconsultoria.com/vagas/forms-secretaria.html';
  const FORMS_ENSEADA_BACURIS = 'https://lavieconsultoria.com/vagas/forms-coord-marketing-enseada.html';
  const FORMS_AUX_DP = 'https://lavieconsultoria.com/vagas/forms-aux-dp.html';
  const FORMS_ROMA_CONSULTOR_VENDAS = 'https://lavieconsultoria.com/vagas/forms-roma-consultor-vendas.html';

  const VAGAS_COM_FORMS_PROPRIO = {
    'Gerente de Captação de Alunos e Televendas':            FORMS_GERENTE_CAPTACAO,
    'Coordenador de Instituto Tecnológico':                  FORMS_COORD_INSTITUTO,
    'Gerente de Marketing':                                  FORMS_GERENTE_MARKETING,
    'Coordenador de Relacionamento e Experiência do Aluno':  FORMS_COORD_RELACIONAMENTO,
    'Motorista Carreteiro':                                 FORMS_MOTORISTA,
    'Coordenador(a) Geral de Comercialização':               FORMS_COORD_COMERCIALIZACAO,
    'Coordenador(a) Acadêmico':                              FORMS_COORD_ACADEMICO,
    'Consultor(a) de Vendas':                                FORMS_DUCARMO_VENDEDORA,
    'Consultor(a) de Vendas · Educacional':                  FORMS_VENDAS_EDUCACIONAL,
    'Consultor Especialista':                                FORMS_CONSULTOR_ESPECIALISTA,
    'Analista de Marketing':                                 FORMS_ANALISTA_MARKETING,
    'Secretária':                                            FORMS_SECRETARIA,
    'Coordenador(a) de Marketing e Comercial - Enseada dos Bacuris': FORMS_ENSEADA_BACURIS,
    'Aux. de Departamento Pessoal':                          FORMS_AUX_DP,
    'Consultor(a) de Vendas Interno':                        FORMS_ROMA_CONSULTOR_VENDAS
  };

  // Retorna a URL do formulário da vaga, ou null se a vaga não tiver um.
  function formsUrlParaVaga(titulo) {
    const t = (titulo || '').trim();
    if (VAGAS_COM_FORMS_PROPRIO[t]) return VAGAS_COM_FORMS_PROPRIO[t];
    // Comparação tolerante a acento, caixa e espaço extra
    const norm = x => (x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                       .toLowerCase().replace(/\s+/g, ' ').trim();
    const alvo = norm(t);
    const achado = Object.keys(VAGAS_COM_FORMS_PROPRIO).find(k => norm(k) === alvo);
    if (achado) return VAGAS_COM_FORMS_PROPRIO[achado];
    // Comparação por aproximação (contém): cobre título cadastrado com sufixo/prefixo
    // extra no site das vagas (ex.: "Gerente de Marketing - Home Office"), evitando que
    // uma pequena diferença de cadastro derrube o candidato do fluxo silenciosamente.
    const parecido = Object.keys(VAGAS_COM_FORMS_PROPRIO).find(k => {
      const nk = norm(k);
      return nk.length > 3 && (alvo.includes(nk) || nk.includes(alvo));
    });
    return parecido ? VAGAS_COM_FORMS_PROPRIO[parecido] : null;
  }
  return formsUrlParaVaga;
})();
