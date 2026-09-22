-- Preserva anexos do recrutador ao receber uma nova etapa do site.
CREATE OR REPLACE FUNCTION public.lv_receber_candidato_do_site(p_nome text, p_email text, p_telefone text, p_vaga_titulo text, p_obs text DEFAULT NULL::text, p_documentos jsonb DEFAULT '[]'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_vaga        record;
  v_email       text := lower(trim(coalesce(p_email, '')));
  v_nome        text := trim(coalesce(p_nome, ''));
  v_id          text;
  v_agora       timestamptz := now();
  v_existe      record;
  v_fonte       text;
  v_rank_novo   int;
  v_rank_atual  int;
  v_hist_obs    text;
  v_hist_base   jsonb;
BEGIN
  -- Validações mínimas: sem nome ou e-mail não dá para identificar ninguém.
  IF v_nome = '' OR v_email = '' OR position('@' in v_email) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'motivo', 'Nome ou e-mail inválido.');
  END IF;

  -- Corta textos exagerados: o campo é público e alguém pode mandar 1 MB de texto.
  v_nome  := left(v_nome, 200);
  v_email := left(v_email, 200);
  p_obs   := left(coalesce(p_obs, ''), 4000);

  -- ── Descobre de qual etapa do site veio esta chamada ──────────────────────
  IF p_obs LIKE '%CANDIDATURA RECEBIDA%' THEN
    v_fonte     := 'Site La Vie (currículo)';
    v_rank_novo := 1;
    v_hist_obs  := 'Candidatura recebida pelo site. Teste DISC e formulário técnico pendentes.';
  ELSIF p_obs LIKE '%Parcial (só DISC)%' THEN
    v_fonte     := 'Site La Vie (currículo + DISC)';
    v_rank_novo := 2;
    v_hist_obs  := 'Teste DISC concluído. Formulário técnico da vaga pendente.';
  ELSE
    v_fonte     := 'Site La Vie (currículo + DISC + formulário)';
    v_rank_novo := 3;
    v_hist_obs  := 'Candidatura completa recebida automaticamente pelo site.';
  END IF;

  -- A vaga define a empresa. Sem vaga encontrada, não há como saber em qual
  -- cliente o candidato entra, então recusamos em vez de criar registro órfão.
  SELECT id, titulo, empresa_id INTO v_vaga
  FROM public.vagas
  WHERE lower(trim(titulo)) = lower(trim(coalesce(p_vaga_titulo, '')))
  ORDER BY criado_em DESC NULLS LAST
  LIMIT 1;

  IF v_vaga.id IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'motivo', 'Vaga não encontrada no R&S: "' || coalesce(p_vaga_titulo,'') ||
                '". Cadastre a vaga com esse título exato para os candidatos entrarem sozinhos.');
  END IF;

  -- Já existe esse candidato nessa vaga?
  SELECT id, etapa, fonte, historico INTO v_existe
  FROM public.candidatos
  WHERE lower(trim(email)) = v_email AND vaga_id = v_vaga.id
  ORDER BY criado_em DESC NULLS LAST
  LIMIT 1;

  IF v_existe.id IS NOT NULL THEN
    -- Nível que o registro já tinha, para a fonte nunca regredir.
    v_rank_atual := CASE coalesce(v_existe.fonte, '')
      WHEN 'Site La Vie (currículo + DISC + formulário)' THEN 3
      WHEN 'Site La Vie (vaga + DISC + formulário)'      THEN 3  -- rótulo antigo
      WHEN 'Site La Vie (currículo + DISC)'              THEN 2
      WHEN 'Site La Vie (currículo)'                     THEN 1
      ELSE 0
    END;

    -- Histórico só é array; registro antigo com outro formato recomeça vazio.
    v_hist_base := CASE WHEN jsonb_typeof(v_existe.historico) = 'array'
                        THEN v_existe.historico ELSE '[]'::jsonb END;

    -- Atualiza sem mexer na etapa: quem já avançou no processo não volta atrás.
    UPDATE public.candidatos SET
      nome          = v_nome,
      telefone      = coalesce(nullif(trim(p_telefone), ''), telefone),
      fonte         = CASE WHEN v_rank_novo > v_rank_atual THEN v_fonte ELSE fonte END,
      -- Etapa mais completa substitui a observação, para o painel mostrar o
      -- dossiê atual no topo. Reenvio do mesmo nível ou anterior só acrescenta.
      obs           = CASE WHEN v_rank_novo < v_rank_atual THEN obs
                           WHEN coalesce(obs,'') = p_obs THEN obs
                           WHEN v_rank_novo > v_rank_atual
                           THEN p_obs
                           ELSE coalesce(obs, '') ||
                                E'\n\n[Atualização pelo site em ' ||
                                to_char(v_agora, 'DD/MM/YYYY HH24:MI') || '] ' || p_obs
                      END,
      documentos    = CASE WHEN jsonb_array_length(coalesce(p_documentos,'[]'::jsonb)) > 0
                           THEN (
                             SELECT coalesce(jsonb_agg(d.doc ORDER BY d.ord), '[]'::jsonb)
                             FROM (
                               SELECT DISTINCT ON (coalesce(item->>'path',item->>'url',item::text))
                                 item AS doc, pos AS ord
                               FROM jsonb_array_elements(
                                 CASE WHEN jsonb_typeof(documentos)='array' THEN documentos ELSE '[]'::jsonb END
                                 || p_documentos
                               ) WITH ORDINALITY AS anexos(item,pos)
                               ORDER BY coalesce(item->>'path',item->>'url',item::text),pos
                             ) d
                           ) ELSE documentos END,
      historico     = v_hist_base || jsonb_build_array(jsonb_build_object(
                        'etapa',   v_existe.etapa,
                        'data',    v_agora,
                        'obs',     v_hist_obs,
                        'usuario', 'Site (automático)')),
      atualizado_em = v_agora
    WHERE id = v_existe.id;

    RETURN jsonb_build_object('ok', true, 'acao', 'atualizado',
                              'candidato_id', v_existe.id, 'etapa', v_existe.etapa,
                              'fonte', CASE WHEN v_rank_novo > v_rank_atual THEN v_fonte ELSE v_existe.fonte END);
  END IF;

  v_id := 'site-' || replace(gen_random_uuid()::text, '-', '');

  INSERT INTO public.candidatos (
    id, nome, telefone, email, vaga_id, etapa, data_entrada,
    fonte, obs, documentos, historico, criado_por, criado_em, atualizado_em, empresa_id
  ) VALUES (
    v_id, v_nome, nullif(trim(p_telefone), ''), v_email, v_vaga.id,
    'triagem', v_agora::date,
    v_fonte,
    p_obs,
    coalesce(p_documentos, '[]'::jsonb),
    jsonb_build_array(jsonb_build_object(
      'etapa','triagem','data', v_agora,
      'obs', v_hist_obs,
      'usuario','Site (automático)')),
    'Site (automático)', v_agora, v_agora, v_vaga.empresa_id
  );

  RETURN jsonb_build_object('ok', true, 'acao', 'criado', 'candidato_id', v_id, 'fonte', v_fonte);
END;
$function$

