-- Mantém as respostas e a etapa ao reenviar uma falha de integração.
alter table public.rs_sync_pendentes add column if not exists payload_rs jsonb;
