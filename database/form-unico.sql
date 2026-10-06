-- Estrutura do FORMULÁRIO ÚNICO de vagas (/vagas/form.html?vaga=<slug>).
-- Aplicado no projeto Supabase do site (doinfhruwdwctnuoujxl) em 06/10/2026.
--
-- Uma vaga nova deixa de exigir um arquivo forms-<vaga>.html copiado: basta
-- inserir uma linha em lv_form_configs (e o gabarito em lv_form_gabaritos,
-- se a vaga tiver quiz). O gabarito nunca chega ao navegador: a nota é
-- calculada no servidor pela função lv_corrigir_quiz.

create table if not exists public.lv_form_configs (
  slug          text primary key,         -- ex.: 'analista-rh-dp' (casa com vagas.slug)
  vaga_titulo   text not null,            -- título exato da vaga (casa com o R&S)
  form_titulo   text not null,            -- título exibido no topo do formulário
  intro         text,                     -- parágrafo de boas-vindas
  condicoes     jsonb default '[]',       -- [{"label":"Remuneração","valor":"R$ ..."}]
  cientes       jsonb default '[]',       -- [{"campo":"ciente_pj","texto":"Estou ciente de que ..."}]
  quiz          jsonb default '[]',       -- [{"id":"q0","pergunta":"...","opcoes":["a","b","c","d"]}] SEM gabarito
  abertas       jsonb default '[]',       -- [{"id":"a0","pergunta":"..."}]
  disc_ideal    jsonb default '[]',       -- ["I","D"]
  pede_pretensao boolean default true,
  ativa         boolean default true,
  criado_em     timestamptz default now(),
  atualizado_em timestamptz default now()
);
alter table public.lv_form_configs enable row level security;
create policy lv_form_configs_select on public.lv_form_configs
  for select using (ativa = true);
create policy lv_form_configs_admin on public.lv_form_configs
  for all to authenticated using (true) with check (true);

-- Gabarito separado: RLS ligado e sem policy de leitura para anon — só a
-- função de correção (security definer) e usuários logados enxergam.
create table if not exists public.lv_form_gabaritos (
  slug      text primary key references public.lv_form_configs(slug) on delete cascade,
  respostas jsonb not null default '{}'   -- {"q0":"2","q1":"0"} (índice da opção correta, como string)
);
alter table public.lv_form_gabaritos enable row level security;
create policy lv_form_gabaritos_admin on public.lv_form_gabaritos
  for all to authenticated using (true) with check (true);

-- Correção no servidor: o navegador manda as respostas e recebe só a nota.
create or replace function public.lv_corrigir_quiz(p_slug text, p_respostas jsonb)
 returns jsonb
 language plpgsql
 stable security definer
 set search_path to 'public'
as $function$
declare
  v_gab jsonb;
  v_total int := 0;
  v_acertos int := 0;
  k text;
begin
  select respostas into v_gab from lv_form_gabaritos where slug = p_slug;
  if v_gab is null then
    return jsonb_build_object('ok', false, 'motivo', 'Vaga sem gabarito cadastrado.');
  end if;
  for k in select jsonb_object_keys(v_gab) loop
    v_total := v_total + 1;
    if p_respostas ? k and (p_respostas->>k) = (v_gab->>k) then
      v_acertos := v_acertos + 1;
    end if;
  end loop;
  if v_total = 0 then
    return jsonb_build_object('ok', true, 'acertos', 0, 'total', 0, 'pct', null);
  end if;
  return jsonb_build_object('ok', true, 'acertos', v_acertos, 'total', v_total,
                            'pct', round(100.0 * v_acertos / v_total));
end;
$function$;
revoke all on function public.lv_corrigir_quiz(text, jsonb) from public;
grant execute on function public.lv_corrigir_quiz(text, jsonb) to anon, authenticated;
