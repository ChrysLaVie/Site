const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../clientes/index.html'),'utf8');
const context=vm.createContext({});
for(const name of ['_agMin','_agIntervalo','_agSobrepoe']){
 const start=src.indexOf('function '+name+'(');
 assert.ok(start>0,'função '+name+' existe');
 vm.runInContext(src.slice(start,src.indexOf('\n}',start)+2),context);
}
const ev=(data,horaIni,horaFim)=>({data,horaIni,horaFim});
test('mesmo dia e mesma hora em empresas diferentes é choque',()=>{
 assert.equal(context._agSobrepoe(ev('2026-10-20','11:30','12:00'),ev('2026-10-20','11:30','12:00')),true);
});
test('horários que só se encostam não são choque',()=>{
 assert.equal(context._agSobrepoe(ev('2026-11-17','10:00','10:30'),ev('2026-11-17','10:30','11:00')),false);
});
test('sobreposição parcial é choque',()=>{
 assert.equal(context._agSobrepoe(ev('2026-11-17','10:00','10:40'),ev('2026-11-17','10:30','11:00')),true);
});
test('sem hora de fim conta 40 minutos',()=>{
 assert.equal(context._agSobrepoe(ev('2026-11-17','10:00',''),ev('2026-11-17','10:39','11:00')),true);
 assert.equal(context._agSobrepoe(ev('2026-11-17','10:00',null),ev('2026-11-17','10:40','11:00')),false);
});
test('dias diferentes ou compromisso sem horário nunca são choque',()=>{
 assert.equal(context._agSobrepoe(ev('2026-11-17','10:00','10:30'),ev('2026-11-18','10:00','10:30')),false);
 assert.equal(context._agSobrepoe(ev('2026-11-17','',''),ev('2026-11-17','10:00','10:30')),false);
});
test('hora vinda do banco com segundos também é lida',()=>{
 assert.equal(context._agMin('09:05:00'),545);
 assert.equal(context._agSobrepoe(ev('2026-11-17','09:00:00','09:30:00'),ev('2026-11-17','09:15','09:45')),true);
});
