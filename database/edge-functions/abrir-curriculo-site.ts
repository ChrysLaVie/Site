// Edge Function "abrir-curriculo-site" — projeto Supabase do SITE
// (doinfhruwdwctnuoujxl). Implantada em 06/10/2026. Esta cópia existe só
// para versionar o código; a que roda é a publicada no Supabase.
//
// Assina URLs temporárias do bucket privado "curriculos" para usuários
// LOGADOS no painel R&S (projeto Supabase separado). Substitui a antiga
// policy que deixava o bucket legível por qualquer visitante anônimo.
//
// Chamada esperada (POST JSON):
//   Authorization: Bearer <anon key deste projeto>  (exigido pelo gateway)
//   x-rs-token: <access_token da sessão do usuário no projeto R&S>
//   body: { "path": "caminho/do/arquivo.pdf", "expiresIn": 60 }
// Resposta: { "signedUrl": "https://..." }
import { createClient } from "npm:@supabase/supabase-js@2";

const RS_URL = "https://pdtwypuqfnglfaadubvz.supabase.co";
const RS_PUBLISHABLE_KEY = "sb_publishable_ZSbHiK2ZkFT3q0OJt--4qw_Q2Oc3MMK";
const BUCKET = "curriculos";
const MAX_EXPIRES = 7 * 24 * 3600; // 7 dias: usado quando o link vai dentro de um PDF

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-rs-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function resposta(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return resposta(405, { error: "use POST" });

  // 1) Quem chama precisa ter uma sessão válida no projeto R&S.
  const rsToken = req.headers.get("x-rs-token") || "";
  if (!rsToken) return resposta(401, { error: "sessão do painel ausente" });
  const quem = await fetch(`${RS_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${rsToken}`, apikey: RS_PUBLISHABLE_KEY },
  });
  if (!quem.ok) return resposta(401, { error: "sessão do painel inválida ou expirada" });

  // 2) Valida o caminho pedido.
  let path = "";
  let expiresIn = 60;
  try {
    const body = await req.json();
    path = String(body.path || "").trim();
    expiresIn = Math.min(Math.max(parseInt(body.expiresIn, 10) || 60, 30), MAX_EXPIRES);
  } catch {
    return resposta(400, { error: "corpo JSON inválido" });
  }
  if (!path || path.includes("..")) return resposta(400, { error: "caminho inválido" });

  // 3) Assina com a service role (só vive aqui no servidor, nunca no site).
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error || !data) {
    return resposta(404, { error: (error && error.message) || "arquivo não encontrado" });
  }
  return resposta(200, { signedUrl: data.signedUrl });
});
