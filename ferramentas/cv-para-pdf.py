#!/usr/bin/env python3
"""
Converte para PDF os currículos que chegaram em Word (doc, docx, odt, rtf) e grava o PDF
no cadastro do candidato (Supabase do R&S), como primeiro documento, nome "Currículo (PDF) · <nome>".
O arquivo original continua no cadastro.

Uso (Secretária da La Vie):
  LV_TOKEN=<token de links_assinados> python3 cv-para-pdf.py
Opções: --limite N (padrão 40), --so-listar.

Precisa de: soffice (LibreOffice), curl ou urllib. Sem o token o script não roda.
"""
import json, os, subprocess, sys, tempfile, time, urllib.request, urllib.error, re, unicodedata

RS_URL   = "https://pdtwypuqfnglfaadubvz.supabase.co"
SITE_URL = "https://doinfhruwdwctnuoujxl.supabase.co"
RS_KEY   = "sb_publishable_ZSbHiK2ZkFT3q0OJt--4qw_Q2Oc3MMK"  # chave publicável (mesma do painel)
TOKEN    = os.environ.get("LV_TOKEN", "").strip()
LIMITE   = 40
SO_LISTAR = "--so-listar" in sys.argv
for i, a in enumerate(sys.argv):
    if a == "--limite" and i + 1 < len(sys.argv):
        LIMITE = int(sys.argv[i + 1])

if not TOKEN:
    print("Falta LV_TOKEN (token de links_assinados).", file=sys.stderr); sys.exit(2)


def http(url, data=None, headers=None, method=None, raw=False):
    req = urllib.request.Request(url, data=data, method=method or ("POST" if data is not None else "GET"))
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=120) as r:
        b = r.read()
        return b if raw else (json.loads(b.decode()) if b else None)


def rpc(nome, params):
    return http(f"{RS_URL}/rest/v1/rpc/{nome}", json.dumps(params).encode(),
                {"apikey": RS_KEY, "Authorization": f"Bearer {RS_KEY}", "Content-Type": "application/json"})


def links_assinados(bucket, paths):
    base = SITE_URL if bucket == "curriculos" else RS_URL
    out = http(f"{base}/functions/v1/links-assinados",
               json.dumps({"token": TOKEN, "bucket": bucket, "paths": paths, "minutos": 30}).encode(),
               {"Content-Type": "application/json"})
    return {l["path"]: l.get("url") for l in out.get("links", [])}


def slug(s):
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^A-Za-z0-9]+", "_", s).strip("_")
    return s[:60] or "arquivo"


pend = rpc("lv_cv_pdf_pendentes", {"p_token": TOKEN}) or []
print(f"{len(pend)} documento(s) em Word sem PDF.")
if SO_LISTAR:
    for p in pend:
        print(f"  {p['candidato_id']} · {p['nome']} · {p['bucket']}/{p['path']}")
    sys.exit(0)

pend = pend[:LIMITE]
# links assinados por bucket (até 50 por chamada)
links = {}
for bucket in ("documentos", "curriculos"):
    paths = sorted({p["path"] for p in pend if p["bucket"] == bucket})
    for i in range(0, len(paths), 50):
        links[bucket] = {**links.get(bucket, {}), **links_assinados(bucket, paths[i:i + 50])}

ok, falhas = [], []
cache_pdf = {}  # (bucket, path) -> caminho do PDF local (mesmo arquivo em vários cadastros)
with tempfile.TemporaryDirectory() as tmp:
    for p in pend:
        cand, bucket, path = p["candidato_id"], p["bucket"], p["path"]
        try:
            chave = (bucket, path)
            if chave not in cache_pdf:
                url = links.get(bucket, {}).get(path)
                if not url:
                    raise RuntimeError("sem link assinado (arquivo não existe no bucket?)")
                ext = os.path.splitext(path)[1].lower() or ".docx"
                local = os.path.join(tmp, f"{len(cache_pdf)}_{slug(os.path.basename(path))}{ext}")
                with open(local, "wb") as f:
                    f.write(http(url, raw=True))
                outdir = os.path.join(tmp, f"out{len(cache_pdf)}")
                os.makedirs(outdir, exist_ok=True)
                r = subprocess.run(["soffice", "--headless", "--norestore", "--convert-to", "pdf", "--outdir", outdir, local],
                                   capture_output=True, text=True, timeout=180)
                pdfs = [x for x in os.listdir(outdir) if x.lower().endswith(".pdf")]
                if not pdfs:
                    raise RuntimeError("LibreOffice não gerou PDF: " + (r.stderr or r.stdout)[-300:])
                pdf_local = os.path.join(outdir, pdfs[0])
                with open(pdf_local, "rb") as f:
                    if f.read(5) != b"%PDF-":
                        raise RuntimeError("saída não é PDF")
                cache_pdf[chave] = pdf_local
            pdf_local = cache_pdf[chave]
            tamanho = os.path.getsize(pdf_local)
            destino = f"{cand}/{int(time.time()*1000)}_curriculo_pdf_{slug(p['nome'])}.pdf"
            with open(pdf_local, "rb") as f:
                dados = f.read()
            http(f"{RS_URL}/storage/v1/object/documentos/{destino}", dados,
                 {"apikey": RS_KEY, "Authorization": f"Bearer {RS_KEY}", "Content-Type": "application/pdf"})
            res = rpc("lv_cv_pdf_registrar", {"p_token": TOKEN, "p_candidato_id": cand, "p_origem_path": path,
                                               "p_pdf_path": destino, "p_tamanho_kb": max(1, round(tamanho / 1024))})
            ok.append((p["nome"], cand, res.get("nome") if isinstance(res, dict) else res))
            print(f"ok   {p['nome']} ({cand}) -> {destino}")
        except Exception as e:  # segue para o próximo; relata no fim
            falhas.append((p["nome"], cand, path, str(e)[:200]))
            print(f"ERRO {p['nome']} ({cand}) {path}: {e}", file=sys.stderr)

print(f"\nConvertidos: {len(ok)} · Falhas: {len(falhas)}")
for n, c, pth, e in falhas:
    print(f"  falha: {n} ({c}) {pth}: {e}")
