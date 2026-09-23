const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const context=()=>{const c=vm.createContext({});vm.runInContext(read('resultados-rs.js'),c);return c;};
function fn(src,name){const start=src.search(new RegExp('(?:async )?function '+name+'\\('));assert(start>=0);return src.slice(start,src.indexOf('\n}',start)+2);}
test('relatório preserva respostas, acentos e pontuação sem executar HTML do candidato',()=>{
 const c=context(),dados={nome:'Ação <img src=x onerror=alert(1)>',technical_score:0,technical_answers:[{pergunta:'Questão?',escolhida:'Resposta completa',correta:false}]};
 const d=c.lvResultadoDocumento('formulario',dados),html=c.lvResultadoHtml(d);
 assert.equal(d.dados.technical_answers[0].escolhida,'Resposta completa');assert.match(html,/Resposta completa/);assert.match(html,/Não/);assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img/);
 assert.equal(c.lvResultadoDocumento('formulario',dados).path,d.path);
});
test('todos os formulários entregam ao envio os mesmos campos que foram salvos',async()=>{
 for(const file of fs.readdirSync(path.join(root,'vagas')).filter(f=>f.startsWith('forms-'))){
  const src=read('vagas/'+file);let saved;const c=vm.createContext({db:{from(){return {insert:async p=>{saved=p;return {error:null}}}}}});
  vm.runInContext(fn(src,'saveForm'),c);
  const payload={nome:'Teste',technical_answers:[{pergunta:'Teste',escolhida:'Texto'}],pretensao_salarial:'2000',ciente_horario:true};
  const r=await c.saveForm(payload);assert.equal(r.payload,saved,file);assert.match(src,/await pushCandidatoParaRS\(\{\s*\.\.\.result.payload/,file);
 }
});
test('reenvio preserva relatório e só remove pendência confirmada pelo R&S',async()=>{
 const src=read('vagas/index.html');let sent,deleted=false;
 const c=vm.createContext({rsDb:{rpc:async(n,p)=>{sent=p;return {data:{ok:true}}}},db:{from(){return {delete(){deleted=true;return this},eq:async()=>({})}}}});
 vm.runInContext(fn(src,'reenviarPendenciaRS'),c);const payload={p_documentos:[{resultadoSite:'disc',dados:{scores:{D:2}}}]};
 assert.equal((await c.reenviarPendenciaRS({id:1,payload_rs:payload})).ok,true);assert.equal(sent,payload);assert.equal(deleted,true);
 deleted=false;c.rsDb.rpc=async()=>({error:{message:'indisponível'}});c.db.from=()=>({update:()=>({eq:async()=>({})})});
 assert.equal((await c.reenviarPendenciaRS({id:1,payload_rs:payload})).ok,false);assert.equal(deleted,false);
});
