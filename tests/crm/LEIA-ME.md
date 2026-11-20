# Testes do CRM (área Comercial)

São as 64 verificações da página `clientes/comercial/index.html`, escritas pela Cláudia em 18/11/2026 e trazidas para o repositório pelo Agnaldo em 19/11/2026.

- `mock.js`: banco falso em memória que imita o supabase-js. Todos os dados são inventados. Nada toca no banco real.
- `run.cjs`: roteiro em Playwright (Node) que sobe um servidor local com o site, abre a página e faz as verificações.

## Como rodar

Na raiz do repositório, com o Playwright instalado (`npm i playwright`):

```
node tests/crm/run.cjs
```

Termina com "0 falhas de 64" quando está tudo certo (e código de saída 1 se algo falhar).

Opções por variável de ambiente:
- `CHROME`: caminho de um Chrome instalado. Sem ela, usa `/usr/bin/google-chrome` se existir, ou o navegador do próprio Playwright.
- `PORTA`: porta do servidor local (padrão 8765).
- `CRM_FOTOS`: pasta para as fotos das telas (padrão: uma pasta temporária).

## Por que fica em `tests/crm/`

Os testes rápidos do repositório rodam com `node --test tests/*.cjs` e não precisam de navegador. Este precisa, então fica em pasta própria e não entra naquele comando.

Rodar sempre que `clientes/comercial/index.html` mudar. Se a página ganhar tela nova, a regra do que conferir é da Cláudia; o roteiro é do Agnaldo.
