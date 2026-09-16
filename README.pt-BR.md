# StockPilot

Controle de estoque e compras para um pequeno galpão — produtos, fornecedores e pedidos de compra, com níveis de estoque que nunca são editados diretamente. Toda mudança em uma quantidade é um movimento registrado e atribuível, e receber uma remessa é um fluxo de primeira classe, com recebimento parcial e transições de status automáticas.

[Read in English](./README.md)

## Por que esse projeto existe

A maioria das demos de estoque deixa você dar um `PATCH` num campo `quantity` e pronto. É assim que a contagem de estoque silenciosamente diverge da realidade e ninguém consegue explicar o porquê. O StockPilot trata `quantityOnHand` como um valor derivado e cacheado: a única forma de mudá-lo é registrar um `StockMovement` (recebido, vendido, devolvido ou um ajuste manual), e as duas escritas acontecem na mesma transação do banco. O resultado é uma trilha de auditoria completa de graça — pra qualquer produto você consegue responder "como chegamos nesse número?" sem precisar adivinhar.

## Arquitetura

```
apps/
  web/   Next.js 16 (App Router, TypeScript, Tailwind) — produtos, pedidos de compra, fornecedores, dashboard
  api/   Node/Express (TypeScript) — API REST, Prisma ORM, PostgreSQL
```

```
src/
  domain/              stockLedger.ts — lógica pura de delta/validação, sem framework, testada
                        errors.ts — erros de domínio tipados, mapeados para códigos HTTP
  modules/<nome>/      <nome>.schema.ts    validação de entrada com Zod
                        <nome>.service.ts   regra de negócio
                        <nome>.repository.ts (products, purchaseOrders — as escritas transacionais ficam aqui)
                        <nome>.routes.ts    router do Express, controllers finos
  middlewares/         autenticação, checagem de papel, rate limiting, tratamento central de erro
```

Sem Socket.IO aqui, de propósito — nem todo produto precisa de websocket, e um dashboard de galpão que atualiza a cada 30 segundos é a resposta honesta pra esse domínio.

## A parte interessante: movimentos de estoque seguros contra concorrência

Registrar um movimento não lê a quantidade atual, faz a conta em JavaScript e escreve de volta — esse padrão perde atualizações sob requisições concorrentes. Em vez disso (`products.repository.ts`):

```ts
tx.product.updateMany({
  where: { id: productId, quantityOnHand: { gte: -delta } },
  data: { quantityOnHand: { increment: delta } },
});
```

A checagem de piso (`quantityOnHand >= -delta`) e o incremento acontecem em um único `UPDATE` atômico. Se duas vendas competem pela última unidade, é o banco de dados — não o código da aplicação — quem decide qual ganha; a que perde tem seu `updateMany` batendo em zero linhas, e a transação retorna "estoque insuficiente" sem nunca criar um registro de movimento para uma mudança que não aconteceu. O recebimento de pedidos de compra usa o mesmo padrão transacional para atualizar a quantidade recebida do item, o estoque do produto e o ledger juntos, e só promove o pedido para `RECEIVED` quando cada linha é totalmente entregue.

## Segurança

- Senhas com hash via bcrypt (fator de custo 12); sessões são JWTs em cookies `httpOnly` e `sameSite=lax`.
- Dois papéis, aplicados no servidor: `STAFF` pode registrar movimentos de estoque do dia a dia (recebido/vendido/devolvido) e receber pedidos de compra; só `ADMIN` pode criar produtos, fornecedores, submeter pedidos de compra ou fazer ajustes manuais de estoque — uma requisição de um token `STAFF` pra qualquer uma dessas ações é rejeitada com `403` independente do que a interface mostra.
- Toda entrada é validada com Zod na borda da aplicação, incluindo uma união discriminada para que um "ajuste" e uma "venda" não possam ser confundidos entre si nem no nível de tipos.
- O Prisma parametriza todas as queries; rate limiting nos endpoints de autenticação; cabeçalhos de segurança via `helmet`; CORS restrito à origem configurada do frontend.
- Nenhum segredo fica versionado no repositório — veja [Como rodar](#como-rodar).

## Como rodar

### Pré-requisitos

- Node.js 20+
- Uma instância de PostgreSQL 14+ (local ou hospedada)

### 1. Configurar a API

```bash
cd apps/api
cp .env.example .env
```

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | String de conexão do PostgreSQL |
| `JWT_SECRET` | String aleatória, 32+ caracteres (`openssl rand -hex 32`) |
| `WEB_ORIGIN` | URL do frontend, para o CORS (`http://localhost:3002` em dev) |

```bash
npm install
npm run prisma:migrate   # cria o schema
npm run prisma:seed      # equipe, fornecedores, produtos e um pedido de compra submetido, de demonstração
npm run dev              # http://localhost:4002
```

Contas de demonstração criadas pelo seed (senha `Passw0rd!123`):

| Papel | Email |
| --- | --- |
| Admin | `admin@stockpilot.dev` |
| Staff | `staff@stockpilot.dev` |

### 2. Configurar o frontend

```bash
cd apps/web
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL
npm install
npm run dev -- -p 3002             # http://localhost:3002
```

## Testes

```bash
cd apps/api
npm test        # testes unitários do ledger de estoque (Vitest)
```

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · TanStack Query · Node.js · Express · Prisma · PostgreSQL · Zod · Vitest
