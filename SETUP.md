# Neostore Credenciamento — Setup Guide

## 1. Banco de dados (Supabase)

1. Crie um projeto em https://supabase.com
2. Vá em **Settings → Database → Connection string → URI**
3. Copie a string de conexão (formato: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`)
4. Cole no `.env`:
   ```
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
   ```

## 2. Configurar o banco local

```bash
# Criar as tabelas
npm run db:push

# Configurar o PIN admin (padrão: 1234)
ADMIN_PIN=1234 npm run db:seed
```

## 3. Desenvolvimento

```bash
npm run dev
# Acesse http://localhost:3000
```

## 4. Deploy na Vercel

1. Faça push para GitHub
2. Importe o projeto na Vercel
3. Configure as variáveis de ambiente:
   - `DATABASE_URL` — string de conexão do Supabase

4. A Vercel roda `npm run build` que já inclui `prisma generate`

## 5. Trocar o PIN admin

Via API (POST /api/admin/setup-pin):
```json
{ "pin": "NOVO_PIN_4_DIGITOS" }
```
Ou via seed:
```bash
ADMIN_PIN=5678 npm run db:seed
```

## Estrutura de arquivos

```
app/
  page.tsx              — Página principal (público + admin)
  api/
    days/               — CRUD de dias
    participants/       — CRUD de participantes
    admin/              — Autenticação por PIN
    import/             — Importação de backup JSON
components/
  registration/         — Formulário público
  admin/                — Painel admin, tabela, exportação
  layout/               — Header
lib/
  prisma.ts             — Singleton do Prisma
  auth.ts               — Hash/verificação do PIN (bcrypt)
  export.ts             — Excel, CSV, TXT, JSON
  utils.ts              — Máscaras, formatações
prisma/
  schema.prisma         — Schema do banco
  seed.ts               — Seed do PIN e primeiro dia
```
