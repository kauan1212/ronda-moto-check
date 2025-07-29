# Consulta de Usuário - testedesistema01@gmail.com

Este documento contém instruções para consultar o usuário com email `testedesistema01@gmail.com` no sistema.

## Opções de Consulta

### 1. Script SQL (Recomendado)

Execute o script `query_user.sql` no **Supabase Dashboard**:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Navegue até o seu projeto
3. Vá para a seção "SQL Editor"
4. Cole e execute o conteúdo do arquivo `query_user.sql`

Este script irá:
- Consultar a tabela `profiles` para informações do usuário
- Consultar a tabela `auth.users` para dados de autenticação
- Consultar a tabela `user_roles` para permissões

### 2. Script JavaScript (Console do Navegador)

Execute o script `query_user.js` no console do navegador:

1. Abra o sistema no navegador
2. Pressione `F12` para abrir as ferramentas de desenvolvedor
3. Vá para a aba "Console"
4. Cole e execute o conteúdo do arquivo `query_user.js`

### 3. Componente React (Interface)

Use o componente `UserQuery.tsx` na interface:

1. Importe o componente onde desejar usá-lo
2. O componente já vem pré-configurado com o email `testedesistema01@gmail.com`
3. Clique em "Consultar" para buscar as informações

## Estrutura dos Dados

O sistema armazena informações do usuário em:

### Tabela `profiles`
- `id`: UUID único do usuário
- `email`: Email do usuário
- `full_name`: Nome completo
- `is_admin`: Se é administrador
- `account_status`: Status da conta (pending/active/frozen)
- `created_at`: Data de criação
- `approved_at`: Data de aprovação
- `approved_by`: Quem aprovou
- `frozen_at`: Data de bloqueio
- `frozen_by`: Quem bloqueou
- `logo_url`: URL da logo personalizada

### Tabela `user_roles`
- `id`: ID da role
- `user_id`: ID do usuário
- `role`: Tipo de role (admin/user)
- `created_at`: Data de criação da role

### Tabela `auth.users`
- `id`: UUID único do usuário
- `email`: Email do usuário
- `created_at`: Data de criação
- `last_sign_in_at`: Último login
- `email_confirmed_at`: Data de confirmação do email
- `raw_user_meta_data`: Metadados do usuário

## Possíveis Resultados

### Usuário Encontrado
Se o usuário existir, você verá todas as informações detalhadas incluindo:
- Dados básicos (ID, email, nome)
- Status da conta
- Permissões e roles
- Datas importantes
- Logo personalizada

### Usuário Não Encontrado
Se o usuário não existir, você receberá uma mensagem indicando que o usuário não foi encontrado na base de dados.

## Permissões Necessárias

- **Consulta básica**: Qualquer usuário autenticado pode consultar perfis
- **Consulta de auth.users**: Requer permissões de administrador
- **Consulta de roles**: Qualquer usuário autenticado pode consultar suas próprias roles

## Exemplo de Uso

```sql
-- Consulta direta no SQL Editor
SELECT * FROM public.profiles WHERE email = 'testedesistema01@gmail.com';
```

```javascript
// Consulta via JavaScript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('email', 'testedesistema01@gmail.com')
  .single();
```

## Troubleshooting

### Erro de Permissão
Se você receber erro de permissão, verifique se:
- Está logado no sistema
- Tem permissões de administrador (se necessário)

### Usuário Não Encontrado
Se o usuário não for encontrado, verifique se:
- O email está correto
- O usuário foi realmente criado no sistema
- Não há problemas de sincronização entre `auth.users` e `profiles`

### Erro de Conexão
Se houver erro de conexão, verifique se:
- A conexão com o Supabase está funcionando
- As credenciais estão corretas
- Não há problemas de rede 