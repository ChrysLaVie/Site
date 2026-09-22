const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const clientes=read('clientes/index.html'),disc=read('disc/index.html');
function fn(src,name){const start=src.search(new RegExp('(?:async )?function '+name+'\\('));assert(start>=0,name);return src.slice(start,src.indexOf('\n}',start)+2);}
function ctx(extra={}){return vm.createContext({console:{error(){},warn(){},info(){}},setTimeout,clearTimeout,AbortController,app:{innerHTML:''},...extra});}
function loader(responses){
 const selections=[];
 const c=ctx({DEMO_MODE:false,currentEmpresa:'cambury',VAGAS_COLUNAS:'id,titulo',_loadSeq:0,_vagas:[],_cands:[],_entrevistas:[],_agenda:[],empresaTemProduto:()=>true,dbToVaga:x=>x,dbToCand:x=>x,dbToEntrev:x=>x,dbToAgenda:x=>x,setSyncOk:()=>{},mostrarCargaDados:()=>{},sb:{from(table){return {select(cols){selections.push([table,cols]);return this},eq(){return this},order(){return this},abortSignal(){return responses[table]}}}}});
 vm.runInContext(fn(clientes,'loadAll'),c);return {c,selections};
}
test('JavaScript de todas as páginas alteradas compila',()=>{
 const files=['clientes/index.html','disc/index.html','vagas/index.html',...fs.readdirSync(path.join(root,'vagas')).filter(f=>f.startsWith('forms-')).map(f=>'vagas/'+f)];
 for(const f of files){let n=0;for(const m of read(f).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){if(/src=|application\/ld\+json/.test(m[1]))continue;new vm.Script(m[2],{filename:f+':'+(++n)});}}
});
test('carregamento usa projeção leve e publica os quatro resultados',async()=>{
 const {c,selections}=loader(Object.fromEntries(['vagas','candidatos','entrevistas','agenda'].map(t=>[t,Promise.resolve({data:[{id:t}],error:null})])));
 assert.equal(await c.loadAll(),true);assert.equal(c._dadosCarregouOk,true);assert.equal(c._vagas[0].id,'vagas');assert.equal(selections[0][1],'id,titulo');
});
test('erro retornado pelo banco não vira sucesso com zero vagas',async()=>{
 const {c}=loader({vagas:{data:null,error:{message:'timeout'}},candidatos:{data:[]},entrevistas:{data:[]},agenda:{data:[]}});
 assert.equal(await c.loadAll(),false);assert.equal(c._dadosCarregouOk,false);assert.equal(c._vagasCarregouOk,false);
});
test('resposta de empresa anterior é descartada',async()=>{
 let resolve; const pending=new Promise(r=>resolve=r);
 const {c}=loader({vagas:pending,candidatos:{data:[]},entrevistas:{data:[]},agenda:{data:[]}});
 const p=c.loadAll();c.currentEmpresa='outro';resolve({data:[{id:'antiga'}]});assert.equal(await p,false);assert.equal(c._vagas.length,0);
});
test('editar campos da vaga preserva artes; edição explícita envia imagens',async()=>{
 let sent;const c=ctx({currentEmpresa:'cambury',DEMO_MODE:false,_vagas:[],vagaToDb:v=>({id:v.id,imagens:v.imagens,titulo:v.titulo}),sb:{from(){return {update(row){sent=row;return this},upsert(row){sent=row;return this},eq(){return this},select(){return Promise.resolve({data:[{id:'1'}]})}}}}});
 vm.runInContext(fn(clientes,'upsertVaga'),c);const v={id:'1',_persistida:true,imagens:[{data:'arte'}]};
 await c.upsertVaga(v);assert.equal('imagens' in sent,false);
 await c.upsertVaga(v,true);assert.equal(sent.imagens[0].data,'arte');
});
test('DISC só libera o formulário depois de salvar e atualizar R&S',async()=>{
 const events=[];let release;const p=new Promise(r=>release=r);
 const c=ctx({state:{scores:{D:1,I:2,S:4,C:3},name:'Teste',email:'teste@example.invalid'},incoming:{vaga:'Aux. de Departamento Pessoal'},saveResult:async()=>{events.push('salvar');await p},pushCandidatoSemFormsParaRS:async()=>{events.push('rs')},render:()=>events.push('render'),alert:()=>{throw Error('unexpected alert')}});
 vm.runInContext(fn(disc,'finishTest'),c);const done=c.finishTest();assert.deepEqual(events,['salvar']);release();await done;assert.deepEqual(events,['salvar','rs','render']);
});
test('falha ao salvar DISC mantém respostas e não libera confirmação',async()=>{
 let warned=false,rendered=false;const c=ctx({state:{scores:{D:1,I:2,S:4,C:3}},saveResult:async()=>{throw Error('RLS')},render:()=>rendered=true,alert:()=>warned=true});
 vm.runInContext(fn(disc,'finishTest'),c);await c.finishTest();assert.match(c.app.innerHTML,/Tentar novamente/);assert.equal(rendered,false);assert.equal(c.state.savingResult,false);
});
test('todos os formulários aguardam envio, separam arquivos e detectam erro da fila',async()=>{
 for(const f of fs.readdirSync(path.join(root,'vagas')).filter(f=>f.startsWith('forms-'))){
  const src=read('vagas/'+f);assert.match(src,/await pushCandidatoParaRS\(/,f);
  let docs;const c=ctx({rsDb:{},db:{rpc:async()=>({data:{cv_url:'a.pdf\nb.pdf'}})},montarDossieMatch:()=>'',_lvReceberComRetentativa:async p=>{docs=p.p_documentos;return {ok:true}}});
  vm.runInContext(fn(src,'pushCandidatoParaRS'),c);await c.pushCandidatoParaRS({email:'teste@example.invalid',nome:'Teste',vaga_titulo:'Teste'});assert.ok(docs,f+' não enviou payload');assert.equal(docs.length,2,f);assert.equal(docs[1].path,'b.pdf');
  assert.match(fn(src,'_registrarPendenciaRS'),/if\(erroFila\)throw erroFila/,f);
 }
});
