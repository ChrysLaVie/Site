// Banco falso em memória para testar a página sem tocar no banco real.
(function(){
  let seq = 1;
  const uid = () => '00000000-0000-4000-8000-' + String(seq++).padStart(12,'0');
  const now = () => new Date().toISOString();
  const d = (n) => { const x=new Date(); x.setDate(x.getDate()+n); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0'); };
  const T = window.__DB__ = { profiles:[{id:'u1',nome:'Chrys',nome_completo:'Chrysthyan Kelly',role:(window.__ROLE__||'lavie_master'),ativo:true}],
    crm_contas:[], crm_contatos:[], crm_produtos:[], crm_oportunidades:[], crm_oportunidade_itens:[], crm_propostas:[], crm_atividades:[], crm_canais:[{id:'k1',nome:'Indeed',grupo:'Portais de emprego',divulga_vagas:true,produtos:'nenhum',ativo:true,ordem:10},{id:'k2',nome:'Página da La Vie',grupo:'LinkedIn',link_url:'https://www.linkedin.com/company/lavieconsultoria/',descricao:'Publicação de cada vaga.',divulga_vagas:true,produtos:'ambos',ativo:true,ordem:20},{id:'k3',nome:'Canal de vagas',grupo:'WhatsApp e Telegram',divulga_vagas:true,produtos:'pf',ativo:true,ordem:30},{id:'k4',nome:'Grupos de networking',grupo:'WhatsApp e Telegram',divulga_vagas:false,produtos:'pj',ativo:true,ordem:40}], crm_materiais:[{id:'m-1',titulo:'Apresentação para empresários',tipo:'arte',canal:'WhatsApp',publico:'pj',objetivo:'Grupos de networking',legenda:'Olá, pessoal.\nSou a Chrys.',link_url:'http://127.0.0.1:8765/logo.png',arquivo_nome:'arte.png',usos:[],arquivado:false,criado_em:'2026-11-18T16:00:00Z'}],
    pagamentos:[{empresa_id:'modelo',status:'pago',valor:1000},{empresa_id:'modelo',status:'pendente',valor:500}] };
  const c1={id:uid(),tipo:'pj',nome:'Faculdade Modelo',situacao:'cliente_ativo',empresa_id:'modelo',segmento:'Educação',cidade:'Goiânia',uf:'GO',oculta:false,conferir:false,obs:'Linha 1\nLinha 2'};
  const c2={id:uid(),tipo:'pj',nome:'Cartão Exemplo <script>alert(1)</script>',situacao:'lead',oculta:false,conferir:true};
  const c3={id:uid(),tipo:'pf',nome:'Maria Exemplo',situacao:'lead',oculta:false,conferir:false};
  T.crm_contas.push(c1,c2,c3);
  T.crm_contatos.push({id:uid(),conta_id:c2.id,nome:'Fulana',cargo:'Sócia',decisor:true,telefone:'62 99999-0000'});
  const p1={id:uid(),nome:'Recrutamento e Seleção por vaga',linha:'Pessoas',publico:'pj',tipo_preco:'percentual_salario',faixas:[{ate:2000,pct:70},{ate:4000,pct:60},{ate:8000,pct:50},{ate:null,pct:40}],detalhe_preco:'50% na abertura e 50% no fechamento.',status:'ativo',ordem:10};
  const p2={id:uid(),nome:'Revisão de Currículo',linha:'Carreira',publico:'pf',tipo_preco:'a_partir',valor:250,status:'ativo',ordem:20};
  const p3={id:uid(),nome:'Financeiro terceirizado',linha:'Financeiro',publico:'pj',tipo_preco:'mensal',valor:2000,valor_ate:2800,status:'ativo',ordem:30};
  T.crm_produtos.push(p1,p2,p3);
  const o1={id:uid(),conta_id:c2.id,titulo:'R&S de 6 vagas',etapa:'proposta',valor:9000,proxima_acao:'Cobrar retorno',proxima_acao_em:d(-2),criado_em:now(),conferir:false};
  const o2={id:uid(),conta_id:c3.id,titulo:'Marketing pessoal',etapa:'contato',criado_em:now(),conferir:false};
  const o3={id:uid(),conta_id:c1.id,titulo:'PCCS',etapa:'diagnostico',valor:6000,valor_mensal:500,proxima_acao:'Reunião',proxima_acao_em:d(3),criado_em:now(),conferir:false};
  T.crm_oportunidades.push(o1,o2,o3);
  T.crm_propostas.push({id:uid(),conta_id:c2.id,oportunidade_id:o1.id,titulo:'Recrutamento e Seleção por vaga',destinatario:'Fulana',enviada_em:d(-22),validade_dias:15,valor_texto:'70% do salário',status:'enviada',arquivo_url:'https://docs.google.com/document/d/abc',conferir:true},
                       {id:uid(),conta_id:c1.id,titulo:'Proposta de Atuação',enviada_em:'2026-06-17',status:'aceita',conferir:false},
                       {id:uid(),conta_id:c3.id,titulo:'Antiga',enviada_em:'2026-03-05',status:'a_confirmar',arquivo_nome:'x.pdf',conferir:true});
  T.crm_atividades.push({id:uid(),conta_id:c2.id,tipo:'proposta',texto:'Proposta registrada',em:now()});

  function Q(t){ this.t=t; this.op='select'; this.filters=[]; this.ord=null; this.one=false; this.ret=false; }
  Q.prototype.select=function(){ if(this.op==='select') this.op='select'; else this.ret=true; return this; };
  Q.prototype.order=function(c,o){ this.ord=[c,!o||o.ascending!==false]; return this; };
  Q.prototype.limit=function(){ return this; };
  Q.prototype.eq=function(c,v){ this.filters.push([c,v]); return this; };
  Q.prototype.insert=function(v){ this.op='insert'; this.v=v; return this; };
  Q.prototype.update=function(v){ this.op='update'; this.v=v; return this; };
  Q.prototype.delete=function(){ this.op='delete'; return this; };
  Q.prototype.single=function(){ this.one=true; return this; };
  Q.prototype.maybeSingle=function(){ this.one=true; return this; };
  Q.prototype.run=function(){
    const tab=T[this.t]; if(!tab) return {data:null,error:{message:'tabela inexistente '+this.t}};
    if(window.__FAIL__ && window.__FAIL__===this.t+':'+this.op) return {data:null,error:{message:'falha simulada'}};
    const m=r=>this.filters.every(f=>r[f[0]]===f[1]);
    let out;
    if(this.op==='select'){ out=tab.filter(m).slice(); if(this.ord){ const [c,a]=this.ord; out.sort((x,y)=>(String(x[c]??'')<String(y[c]??'')?-1:1)*(a?1:-1)); } }
    else if(this.op==='insert'){ const arr=Array.isArray(this.v)?this.v:[this.v]; out=arr.map(v=>Object.assign({id:uid(),criado_em:now(),oculta:false,conferir:false,ativo:true},v)); tab.push(...out);
      if(this.t==='crm_oportunidades') out.forEach(o=>T.crm_atividades.push({id:uid(),conta_id:o.conta_id,oportunidade_id:o.id,tipo:'etapa',texto:'Oportunidade criada: '+o.titulo,em:now()}));
      if(this.t==='crm_atividades') out.forEach(o=>{ o.em=o.em||now(); }); }
    else if(this.op==='update'){ out=tab.filter(m); out.forEach(r=>{ if(this.t==='crm_oportunidades' && this.v.etapa && this.v.etapa!==r.etapa){ T.crm_atividades.push({id:uid(),conta_id:r.conta_id,tipo:'etapa',texto:r.titulo+': '+r.etapa+' para '+this.v.etapa,em:now()}); if(['ganho','perdido'].includes(this.v.etapa)) r.fechado_em=d(0); } Object.assign(r,this.v); }); }
    else if(this.op==='delete'){ out=tab.filter(m); T[this.t]=tab.filter(r=>!m(r)); }
    (window.__LOG__=window.__LOG__||[]).push(this.t+':'+this.op);
    return {data:this.one?(out[0]||null):out,error:null};
  };
  Q.prototype.then=function(res,rej){ return Promise.resolve(this.run()).then(res,rej); };
  window.__ARQ__ = [];
  const st = { upload: async (p,f)=>{ if(window.__FAIL__==='storage:upload') return {data:null,error:{message:'falha simulada'}}; window.__ARQ__.push(p); return {data:{path:p},error:null}; },
    createSignedUrls: async (ps)=>({data:ps.map(p=>({path:p,signedUrl:'http://127.0.0.1:8765/logo.png?p='+encodeURIComponent(p)})),error:null}),
    remove: async (ps)=>{ window.__ARQ__ = window.__ARQ__.filter(x=>!ps.includes(x)); return {data:[],error:null}; } };
  window.__CRM_SB__ = { storage:{ from:()=>st }, from:t=>new Q(t), auth:{ getSession: async()=>({data:{session: window.__NOSESSION__?null:{user:{id:'u1',email:'chrys@lavieconsultoria.com'}}}}), signOut: async()=>({}) } };
})();
