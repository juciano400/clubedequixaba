# Deploy no Railway e painel /admin

## Como o site roda

- Build: `pnpm build` (gera o front em `dist/public` e o servidor em `dist/index.js`).
- Start: `pnpm start` (Express serve o site e a API, na porta `PORT`).
- Já configurado em `railway.json` + `nixpacks.toml` (Node 22, pnpm via corepack).
  O Railway injeta `PORT` automaticamente.

## Painel de conteúdo (/admin)

Acesse `/admin` e entre com o e-mail **profjuciano**. No painel dá para:

- **Agenda de encontros** — adicionar/remover encontros (título, data, horário, tipo, local).
- **Capas das obras** — adicionar/remover obras com upload da imagem da capa.

O que você salva aparece automaticamente na página inicial (seções "Próximos
encontros" e "Recomendados do mês").

> O login é apenas por e-mail (sem senha), conforme solicitado. Para trocar o
> e-mail de acesso, defina a variável `ADMIN_EMAIL`.

## Persistência dos dados (IMPORTANTE)

A agenda e as capas ficam salvas em disco, no diretório apontado por `DATA_DIR`
(padrão: `./data`). O sistema de arquivos do Railway é **efêmero**: sem um Volume,
os dados são reiniciados a cada novo deploy.

Para os dados durarem no Railway:

1. No serviço, crie um **Volume** (Settings → Volumes) montado, por exemplo, em `/data`.
2. Adicione a variável de ambiente `DATA_DIR=/data`.

Pronto — a agenda, as capas enviadas e o `content.json` passam a persistir entre deploys.

## Variáveis de ambiente

| Variável       | Padrão                         | Para quê |
| -------------- | ------------------------------ | -------- |
| `PORT`         | injetada pelo Railway          | porta do servidor |
| `DATA_DIR`     | `./data`                       | onde salvar agenda e capas (use o Volume) |
| `ADMIN_EMAIL`  | `profjuciano`                  | e-mail de acesso ao /admin |
| `ADMIN_SECRET` | `clube-de-leitura-de-quixaba`  | segredo usado para assinar o token de sessão (recomendado definir um próprio) |

## Rodando localmente

- Desenvolvimento visual: `pnpm dev` (Vite). O `/admin` e a API só funcionam com o
  servidor de produção — nesse modo a home usa o conteúdo padrão.
- Para testar o painel localmente: `pnpm build && pnpm start` e abra `http://localhost:3000/admin`.
