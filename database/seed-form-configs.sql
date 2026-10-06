-- ════════════════════════════════════════════════════════════════════════════
-- SEED · Configurações dos formulários de vaga
-- ════════════════════════════════════════════════════════════════════════════
-- Fonte de verdade: os formulários estáticos do site (vagas/forms-*.html).
-- A ordem das perguntas (ids q0,q1,... e a0,a1,...) e a ordem das opções de
-- cada questão seguem EXATAMENTE a ordem dos arrays nos arquivos HTML — é essa
-- ordem que as páginas usam ao montar o objeto `respostas` enviado para a
-- função lv_corrigir_quiz, portanto o gabarito abaixo só é válido enquanto a
-- ordem nos arquivos não mudar.
--
--   lv_form_configs   : o que o candidato vê (sem o campo `correct`).
--   lv_form_gabaritos : índice da opção correta, como string, por pergunta.
--
-- Idempotente: upsert por slug (insert ... on conflict (slug) do update ...).
-- Gerado em 2026-10-06. NÃO aplicar sem revisão.

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- 1) consultor-especialista · "Consultor Especialista"
--    Origem: vagas/forms-consultor-protecao-veicular.html
--    Sem quiz de múltipla escolha (só perguntas abertas) → sem gabarito.
-- ────────────────────────────────────────────────────────────────────────────
insert into lv_form_configs
  (slug, vaga_titulo, form_titulo, intro, condicoes, cientes, quiz, abertas, disc_ideal, pede_pretensao, ativa)
values (
  'consultor-especialista',
  'Consultor Especialista',
  'Formulário da Vaga · Consultor Comercial, Proteção Veicular',
  $$Leia com atenção as informações abaixo antes de preencher o formulário. Suas respostas serão analisadas pela nossa equipe, e entraremos em contato para as próximas etapas do processo.$$,
  $$[
    {"label": "Contratação", "valor": "CLT"},
    {"label": "Remuneração", "valor": "Salário-base de R$ 1.900,00 (CLT) + comissão de 50% por adesão (paga toda sexta-feira) + bônus por meta de até R$ 4.000,00 + R$ 728,00 em cartão de alimentação + transporte + prêmio assiduidade de R$ 100,00 + day off no aniversário (folga sem desconto). Potencial de ganho de até R$ 10.000,00 por mês."},
    {"label": "Local", "valor": "Goiânia/GO · Presencial"},
    {"label": "Horário", "valor": "Segunda a sexta, das 8h às 17h30, com eventuais sábados programados, incluindo participação em eventos. Atendimento interno via CRM e prospecção ativa em campo."}
  ]$$::jsonb,
  $$[
    {"campo": "ciente_clt", "texto": "Estou ciente de que a contratação é no modelo CLT."},
    {"campo": "ciente_remuneracao", "texto": "Estou ciente de que a remuneração é composta por salário-base de R$ 1.900,00 (CLT), comissão de 50% por adesão, paga toda sexta-feira, bônus por meta de até R$ 4.000,00, R$ 728,00 em cartão de alimentação + transporte, prêmio assiduidade de R$ 100,00 e day off no aniversário (folga sem desconto), com potencial de ganho de até R$ 10.000,00 por mês."},
    {"campo": "ciente_presencial", "texto": "Estou ciente de que a vaga é presencial, em Goiânia/GO, de segunda a sexta, das 8h às 17h30, com eventuais sábados programados, incluindo participação em eventos, e envolve atendimento interno via CRM e também prospecção ativa em campo."}
  ]$$::jsonb,
  '[]'::jsonb,
  $$[
    {"id": "a0",  "bloco": "Sobre você", "pergunta": "Conte um pouco sobre você."},
    {"id": "a1",  "bloco": "Sobre você", "pergunta": "Fale sobre sua experiência em vendas e algum marco importante na sua carreira."},
    {"id": "a2",  "bloco": "Sobre você", "pergunta": "Compartilhe um erro que cometeu e que aprendeu com ele."},
    {"id": "a3",  "bloco": "Sobre você", "pergunta": "Como você se motiva?"},
    {"id": "a4",  "bloco": "Sobre você", "pergunta": "Por que saiu do último emprego?"},
    {"id": "a5",  "bloco": "Sobre você", "pergunta": "Onde você se vê em sua carreira daqui a um ano?"},
    {"id": "a6",  "bloco": "Sobre você", "pergunta": "E sua vida pessoal daqui a cinco anos?"},
    {"id": "a7",  "bloco": "Sobre você", "pergunta": "Você tem algum relacionamento (amigos, familiares, parceiros) com alguém da empresa?"},
    {"id": "a8",  "bloco": "Sobre você", "pergunta": "Cite dois pontos positivos e dois aspectos que você gostaria de desenvolver em si mesmo."},
    {"id": "a9",  "bloco": "Sobre você", "pergunta": "Qual o seu valor ideal de ganho mensal?"},
    {"id": "a10", "bloco": "Avaliação comportamental e de vendas", "pergunta": "Em até 8 linhas, convença o recrutador a contratar você para esta vaga. Considere que ele tem apenas 1 minuto para tomar a decisão."},
    {"id": "a11", "bloco": "Avaliação comportamental e de vendas", "pergunta": "Qual foi a maior quantia de dinheiro que você já ganhou em um único mês? Explique como alcançou esse resultado, o que precisou fazer para chegar lá e o que fez com esse dinheiro."},
    {"id": "a12", "bloco": "Avaliação comportamental e de vendas", "pergunta": "Conte uma meta importante que você não alcançou. O que aconteceu e qual foi sua responsabilidade nesse resultado?"},
    {"id": "a13", "bloco": "Avaliação comportamental e de vendas", "pergunta": "Um cliente diz: \"Gostei da proposta, confio em você, mas vou fechar com seu concorrente porque ele ficou R$ 30 mais barato.\" Você terá apenas uma mensagem de WhatsApp para responder. Escreva exatamente o que enviaria."},
    {"id": "a14", "bloco": "Avaliação comportamental e de vendas", "pergunta": "Analise a situação: todos que fazem treinamento vendem, mas nem todos que vendem fazem treinamento. O que você pode afirmar com certeza? E o que não pode afirmar?"},
    {"id": "a15", "bloco": "Avaliação comportamental e de vendas", "pergunta": "Segundo as pessoas que melhor conhecem você, quais suas duas maiores forças (qualidades) e os dois comportamentos que mais atrapalham seu crescimento? Justifique com exemplos."},
    {"id": "a16", "bloco": "Avaliação comportamental e de vendas", "pergunta": "O que te move mais: dinheiro, crescimento, reconhecimento ou liberdade? Explique o porquê."}
  ]$$::jsonb,
  '["I", "D"]'::jsonb,
  true,
  true
)
on conflict (slug) do update set
  vaga_titulo    = excluded.vaga_titulo,
  form_titulo    = excluded.form_titulo,
  intro          = excluded.intro,
  condicoes      = excluded.condicoes,
  cientes        = excluded.cientes,
  quiz           = excluded.quiz,
  abertas        = excluded.abertas,
  disc_ideal     = excluded.disc_ideal,
  pede_pretensao = excluded.pede_pretensao,
  ativa          = excluded.ativa;

-- ────────────────────────────────────────────────────────────────────────────
-- 2) vendas-educacional · "Consultor(a) de Vendas · Educacional"
--    Origem: vagas/forms-consultor-vendas-educacional.html
--    Quiz de 5 questões (q0..q4), sem perguntas abertas.
-- ────────────────────────────────────────────────────────────────────────────
insert into lv_form_configs
  (slug, vaga_titulo, form_titulo, intro, condicoes, cientes, quiz, abertas, disc_ideal, pede_pretensao, ativa)
values (
  'vendas-educacional',
  'Consultor(a) de Vendas · Educacional',
  'Formulário da Vaga · Consultor(a) de Vendas · Educacional',
  $$Leia com atenção as informações abaixo antes de preencher o formulário. Suas respostas serão analisadas pela nossa equipe, e entraremos em contato para as próximas etapas do processo.$$,
  $$[
    {"label": "Contratação", "valor": "PJ"},
    {"label": "Remuneração", "valor": "R$ 2.500,00 (PJ) + comissão"},
    {"label": "Benefícios", "valor": "13º salário pago via nota fiscal, no mês subsequente ao mês de aniversário do contrato; ao completar 1 ano de contrato, 30 dias de recesso sem prejuízo do valor da nota fiscal; bolsa de estudos que inicia em 60%, sobe para 70% após o 1º ano de contrato e chega a 80% após o 2º ano (exceto para os cursos de Odontologia e Gastronomia)."},
    {"label": "Local", "valor": "Goiânia/GO · Presencial"},
    {"label": "Horário", "valor": "Funcionamento do departamento: segunda a sexta, das 08h às 18h, e sábados alternados (um sim, um não), das 08h às 12h."}
  ]$$::jsonb,
  $$[
    {"campo": "ciente_pj", "texto": "Estou ciente de que a contratação é no modelo PJ."},
    {"campo": "ciente_remuneracao", "texto": "Estou ciente de que a remuneração é de R$ 2.500,00 (PJ) + comissão para esta vaga."},
    {"campo": "ciente_presencial", "texto": "Estou ciente de que a vaga é presencial, em Goiânia/GO."},
    {"campo": "ciente_horario", "texto": "Estou ciente do horário de funcionamento do departamento: segunda a sexta, das 08h às 18h, e sábados alternados (um sim, um não), das 08h às 12h. (Como a contratação é PJ, isso se refere ao funcionamento do setor, não a uma jornada fixa obrigatória.)"}
  ]$$::jsonb,
  $$[
    {
      "id": "q0",
      "pergunta": "No trabalho de captação, o que diferencia um lead \"quente\" de um lead \"frio\"?",
      "opcoes": [
        "O lead quente foi cadastrado há mais tempo na base do que o frio",
        "O lead quente demonstrou interesse recente e tem intenção próxima de matrícula; o frio ainda está distante da decisão",
        "O lead quente vem por telefone e o frio vem por WhatsApp",
        "Não há diferença prática: os dois devem receber exatamente a mesma abordagem"
      ]
    },
    {
      "id": "q1",
      "pergunta": "Um interessado pede informações pelo WhatsApp, recebe os valores e para de responder. Qual a conduta mais adequada?",
      "opcoes": [
        "Encerrar o atendimento, porque o silêncio significa desistência",
        "Enviar mensagens diariamente até obter uma resposta",
        "Registrar o contato no CRM e retomar em follow-up planejado, entendendo a objeção antes de repetir a proposta",
        "Repassar o contato para outro consultor e não acompanhar mais"
      ]
    },
    {
      "id": "q2",
      "pergunta": "Para que serve alimentar o CRM a cada contato realizado?",
      "opcoes": [
        "Apenas para o gestor conferir quantas ligações foram feitas no dia",
        "Para manter o histórico do interessado, permitir follow-up no tempo certo e não perder oportunidades da base",
        "Somente para gerar o relatório do fim do mês",
        "Não tem função prática quando o consultor já anota tudo em caderno próprio"
      ]
    },
    {
      "id": "q3",
      "pergunta": "Um aluno chega para efetivar a matrícula e a documentação está incompleta. O que fazer?",
      "opcoes": [
        "Concluir a matrícula assim mesmo e cobrar os documentos depois do início das aulas",
        "Recusar o atendimento e orientar que procure a instituição em outro dia",
        "Conferir o que falta, orientar com clareza sobre o documento pendente e acompanhar até a regularização",
        "Preencher os dados faltantes por conta própria para não perder a venda"
      ]
    },
    {
      "id": "q4",
      "pergunta": "Na comercialização de parcerias educacionais com empresas, qual a sequência correta depois do aceite do cliente?",
      "opcoes": [
        "Assinar o contrato direto com o cliente, sem envolver o Jurídico",
        "Solicitar a documentação, encaminhar ao Jurídico para emissão do contrato, colher as assinaturas e protocolar as vias nas áreas responsáveis",
        "Enviar o projeto ao e-MEC antes de qualquer assinatura",
        "Emitir os boletos primeiro e tratar do contrato depois do primeiro pagamento"
      ]
    }
  ]$$::jsonb,
  '[]'::jsonb,
  '["I", "D"]'::jsonb,
  true,
  true
)
on conflict (slug) do update set
  vaga_titulo    = excluded.vaga_titulo,
  form_titulo    = excluded.form_titulo,
  intro          = excluded.intro,
  condicoes      = excluded.condicoes,
  cientes        = excluded.cientes,
  quiz           = excluded.quiz,
  abertas        = excluded.abertas,
  disc_ideal     = excluded.disc_ideal,
  pede_pretensao = excluded.pede_pretensao,
  ativa          = excluded.ativa;

-- ────────────────────────────────────────────────────────────────────────────
-- 3) enseada-bacuris · "Coordenador(a) de Marketing e Comercial - Enseada dos Bacuris"
--    Origem: vagas/forms-coord-marketing-enseada.html
--    Quiz de 5 questões (q0..q4), sem perguntas abertas.
-- ────────────────────────────────────────────────────────────────────────────
insert into lv_form_configs
  (slug, vaga_titulo, form_titulo, intro, condicoes, cientes, quiz, abertas, disc_ideal, pede_pretensao, ativa)
values (
  'enseada-bacuris',
  'Coordenador(a) de Marketing e Comercial - Enseada dos Bacuris',
  'Formulário da Vaga · Coordenador(a) de Marketing e Comercial · Enseada dos Bacuris',
  $$Leia com atenção as informações abaixo antes de preencher o formulário. Suas respostas serão analisadas pela equipe de recrutamento da La Vie Consultoria, responsável pelo processo seletivo desta vaga, e entraremos em contato para as próximas etapas.

Sobre a vaga: a Enseada dos Bacuris é um empreendimento de casas de temporada no Lago das Brisas (GO). O Coordenador(a) de Marketing e Comercial cuida da divulgação das casas, do atendimento a interessados, da gestão das reservas e das rotinas administrativas do negócio, com foco principal em manter uma boa taxa de ocupação.$$,
  $$[
    {"label": "Contratação", "valor": "PJ"},
    {"label": "Remuneração", "valor": "R$ 3.000,00 mais comissão (PJ)"},
    {"label": "Local", "valor": "Modelo híbrido, com deslocamentos pontuais até o Lago das Brisas/GO"},
    {"label": "Horário", "valor": "A rotina envolve atendimento a hóspedes e interessados fora do horário comercial tradicional, incluindo fins de semana, conforme a necessidade das reservas."}
  ]$$::jsonb,
  $$[
    {"campo": "ciente_pj", "texto": "Estou ciente de que a contratação é no modelo PJ."},
    {"campo": "ciente_remuneracao", "texto": "Estou ciente de que a remuneração é de R$ 3.000,00 mais comissão (PJ) para esta vaga."},
    {"campo": "ciente_presencial", "texto": "Estou ciente de que a vaga é em modelo híbrido, com deslocamentos pontuais até o Lago das Brisas/GO."},
    {"campo": "ciente_horario", "texto": "Estou ciente de que a rotina envolve atendimento a hóspedes e interessados fora do horário comercial tradicional, incluindo fins de semana, conforme a necessidade das reservas."}
  ]$$::jsonb,
  $$[
    {
      "id": "q0",
      "pergunta": "A ocupação das casas está baixa em um período parado do calendário. Qual a atitude mais adequada do Coordenador de Marketing e Comercial?",
      "opcoes": [
        "Esperar a temporada de alta procura chegar naturalmente, sem tomar nenhuma ação",
        "Intensificar a divulgação, criar promoções pontuais e retomar contato com interessados antigos para reverter a baixa procura",
        "Baixar o preço das diárias pela metade sem avaliar o impacto no negócio",
        "Cancelar as reservas futuras para reorganizar a agenda"
      ]
    },
    {
      "id": "q1",
      "pergunta": "Um interessado entra em contato pelo WhatsApp perguntando sobre disponibilidade e valores das casas. Qual a conduta mais adequada?",
      "opcoes": [
        "Responder só com uma tabela de preços, sem fazer mais perguntas",
        "Entender a necessidade do interessado (datas, número de pessoas, motivo da viagem), indicar a opção mais adequada e conduzir até a reserva",
        "Encaminhar direto para o Mantenedor decidir",
        "Ignorar até que o interessado volte a perguntar"
      ]
    },
    {
      "id": "q2",
      "pergunta": "Qual é a função de plataformas como Stays, Airbnb e Booking na gestão das reservas de casas de temporada?",
      "opcoes": [
        "Servem só para postar fotos das casas",
        "Centralizar anúncios, calendário de disponibilidade e pagamentos, ajudando a evitar overbooking entre canais diferentes",
        "Substituem totalmente o contato direto com o hóspede",
        "São usadas somente para emitir nota fiscal"
      ]
    },
    {
      "id": "q3",
      "pergunta": "Duas reservas caíram na mesma data em canais diferentes (overbooking). Qual a atitude mais adequada?",
      "opcoes": [
        "Deixar que os próprios hóspedes resolvam entre si",
        "Verificar qual reserva foi confirmada primeiro, buscar rapidamente uma alternativa para o segundo hóspede e comunicar a situação com transparência",
        "Cancelar as duas reservas para não precisar lidar com o problema",
        "Aceitar as duas reservas e deixar para resolver no dia do check-in"
      ]
    },
    {
      "id": "q4",
      "pergunta": "Um hóspede já hospedado reclama de um problema na casa, como um eletrodoméstico com defeito. Qual a conduta mais adequada do Coordenador?",
      "opcoes": [
        "Anotar a reclamação e só resolver depois que o hóspede for embora",
        "Buscar resolver o quanto antes, informando prazo e solução ao hóspede, para garantir uma boa experiência durante a estadia",
        "Repassar direto ao Mantenedor sem dar retorno ao hóspede",
        "Oferecer desconto sem antes verificar o problema relatado"
      ]
    }
  ]$$::jsonb,
  '[]'::jsonb,
  '["D", "I"]'::jsonb,
  true,
  true
)
on conflict (slug) do update set
  vaga_titulo    = excluded.vaga_titulo,
  form_titulo    = excluded.form_titulo,
  intro          = excluded.intro,
  condicoes      = excluded.condicoes,
  cientes        = excluded.cientes,
  quiz           = excluded.quiz,
  abertas        = excluded.abertas,
  disc_ideal     = excluded.disc_ideal,
  pede_pretensao = excluded.pede_pretensao,
  ativa          = excluded.ativa;

-- ────────────────────────────────────────────────────────────────────────────
-- 4) analista-rh-dp · "Analista de RH/DP" (vaga nova, ainda sem formulário
--    estático no site; sem quiz e sem gabarito)
-- ────────────────────────────────────────────────────────────────────────────
insert into lv_form_configs
  (slug, vaga_titulo, form_titulo, intro, condicoes, cientes, quiz, abertas, disc_ideal, pede_pretensao, ativa)
values (
  'analista-rh-dp',
  'Analista de RH/DP',
  'Formulário da Vaga · Analista de RH/DP',
  $$Vaga na Roma Distribuição, distribuidora de segurança eletrônica em Goiânia/GO. O(a) Analista de RH/DP conduz as rotinas de Departamento Pessoal e de RH, com apoio às rotinas do financeiro. Jornada de segunda a sexta, das 08h às 18h, com contratação CLT. Leia com atenção as condições abaixo antes de preencher o formulário.$$,
  $$[
    {"label": "Remuneração", "valor": "R$ 3.000,00"},
    {"label": "Benefícios", "valor": "VT + VR R$ 20,00/dia + Plano de Saúde Unimed"},
    {"label": "Local", "valor": "Goiânia/GO · Presencial"},
    {"label": "Horário", "valor": "Seg a sex, 08h às 18h"}
  ]$$::jsonb,
  $$[
    {"campo": "ciente_remuneracao", "texto": "Estou ciente de que a remuneração é de R$ 3.000,00 (CLT), com benefícios de VT + VR de R$ 20,00/dia + Plano de Saúde Unimed."},
    {"campo": "ciente_presencial", "texto": "Estou ciente de que a vaga é presencial, em Goiânia/GO."},
    {"campo": "ciente_horario", "texto": "Estou ciente de que o horário de trabalho é de segunda a sexta, das 08h às 18h."}
  ]$$::jsonb,
  '[]'::jsonb,
  -- RASCUNHO: revisar com a Chrys (perguntas abertas propostas, ainda não validadas)
  $$[
    {"id": "a0", "pergunta": "Descreva sua experiência com folha de pagamento, férias, rescisões e eSocial (sistemas que já usou, porte das empresas)."},
    {"id": "a1", "pergunta": "Que rotinas financeiras você já executou (contas a pagar/receber, conciliação)? Dê exemplos."},
    {"id": "a2", "pergunta": "Como está seu Excel? Cite funções/recursos que domina e como os usou no trabalho."}
  ]$$::jsonb,
  '["C", "S"]'::jsonb,
  true,
  true
)
on conflict (slug) do update set
  vaga_titulo    = excluded.vaga_titulo,
  form_titulo    = excluded.form_titulo,
  intro          = excluded.intro,
  condicoes      = excluded.condicoes,
  cientes        = excluded.cientes,
  quiz           = excluded.quiz,
  abertas        = excluded.abertas,
  disc_ideal     = excluded.disc_ideal,
  pede_pretensao = excluded.pede_pretensao,
  ativa          = excluded.ativa;

-- ════════════════════════════════════════════════════════════════════════════
-- GABARITOS (lv_form_gabaritos) — nunca expor ao navegador.
-- O valor é o ÍNDICE (base 0, como string) da opção correta dentro de
-- "opcoes", na mesma ordem gravada acima (que é a ordem dos arquivos HTML).
-- ════════════════════════════════════════════════════════════════════════════

-- vendas-educacional: q0→1, q1→2, q2→1, q3→2, q4→1
insert into lv_form_gabaritos (slug, respostas)
values (
  'vendas-educacional',
  '{"q0": "1", "q1": "2", "q2": "1", "q3": "2", "q4": "1"}'::jsonb
)
on conflict (slug) do update set
  respostas = excluded.respostas;

-- enseada-bacuris: q0→1, q1→1, q2→1, q3→1, q4→1
insert into lv_form_gabaritos (slug, respostas)
values (
  'enseada-bacuris',
  '{"q0": "1", "q1": "1", "q2": "1", "q3": "1", "q4": "1"}'::jsonb
)
on conflict (slug) do update set
  respostas = excluded.respostas;

-- consultor-especialista e analista-rh-dp não têm quiz → sem gabarito.

commit;
