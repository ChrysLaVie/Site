const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../clientes/index.html'),'utf8');
const context=vm.createContext({});
for(const name of ['_candidatoNoCicloVaga','dataDossieVaga']){
 const start=src.indexOf('function '+name+'(');
 vm.runInContext(src.slice(start,src.indexOf('\n}',start)+2),context);
}
const vaga={id:'reposicao',dataReabertura:'2026-09-02'};
test('contratação anterior não identifica o candidato vigente de uma reposição',()=>{
 assert.equal(context._candidatoNoCicloVaga({vagaId:'reposicao',etapa:'admissao',criadoEm:'2026-08-05',historico:[{etapa:'admissao',data:'2026-08-14T18:00:00Z'}]},vaga),false);
});
test('candidato cadastrado antes pode participar do novo ciclo',()=>{
 assert.equal(context._candidatoNoCicloVaga({vagaId:'reposicao',etapa:'aprovacao',criadoEm:'2026-08-05',historico:[{etapa:'aprovacao',data:'2026-09-20T18:00:00Z'}]},vaga),true);
});
test('dossiê usa aprovação dentro do ciclo, sem herdar datas antigas ou posteriores ao fechamento',()=>{
 const cands=[{vagaId:'reposicao',historico:[{etapa:'aprovacao',data:'2026-08-10'},{etapa:'aprovacao',data:'2026-09-10'},{etapa:'aprovacao',data:'2026-09-25'}]}];
 assert.equal(context.dataDossieVaga('reposicao',cands,'2026-09-02','2026-09-23'),'2026-09-10');
 assert.equal(context.dataDossieVaga('reposicao',cands,'2026-09-11','2026-09-23'),null);
});
