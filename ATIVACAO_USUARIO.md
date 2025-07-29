# Ativação do Usuário - testedesistema01@gmail.com

Este documento contém instruções para ativar o usuário `testedesistema01@gmail.com` e restaurar seu acesso aos condomínios, vigilantes e motos que estavam ativos anteriormente.

## 🎯 Objetivo

Ativar o usuário e garantir que ele tenha acesso a:
- ✅ Condomínios existentes
- ✅ Vigilantes dos condomínios
- ✅ Motos dos condomínios
- ✅ Todas as funcionalidades do sistema

## 🛠️ Opções de Ativação

### 1. Script SQL (Recomendado - Mais Completo)

Execute o script `ativar_usuario.sql` no **Supabase Dashboard**:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Navegue até o seu projeto
3. Vá para a seção "SQL Editor"
4. Cole e execute o conteúdo do arquivo `ativar_usuario.sql`

**O que este script faz:**
- ✅ Verifica se o usuário existe
- ✅ Ativa o usuário (status = 'active')
- ✅ Remove bloqueios (frozen_at = NULL)
- ✅ Associa condomínios sem user_id ao usuário
- ✅ Mostra resumo completo de acesso

### 2. Script JavaScript (Console do Navegador)

Execute o script `ativar_usuario.js` no console do navegador:

1. Abra o sistema no navegador
2. Pressione `F12` para abrir as ferramentas de desenvolvedor
3. Vá para a aba "Console"
4. Cole e execute o conteúdo do arquivo `ativar_usuario.js`

### 3. Componente React (Interface Visual)

Use o componente `UserActivation.tsx` na interface:

1. Importe o componente onde desejar usá-lo
2. O email já vem pré-configurado
3. Clique em "Verificar" para ver o status atual
4. Clique em "Ativar Usuário" para ativar

## 📋 Passos Detalhados

### Passo 1: Verificar Status Atual
```sql
-- Verificar se o usuário existe e seu status
SELECT 
  id, 
  email, 
  account_status,
  created_at 
FROM public.profiles 
WHERE email = 'testedesistema01@gmail.com';
```

### Passo 2: Ativar o Usuário
```sql
-- Ativar o usuário
UPDATE public.profiles 
SET account_status = 'active',
    approved_at = now(),
    approved_by = (SELECT id FROM public.profiles WHERE email = 'kauankg@hotmail.com'),
    frozen_at = NULL,
    frozen_by = NULL
WHERE email = 'testedesistema01@gmail.com';
```

### Passo 3: Associar Condomínios
```sql
-- Associar condomínios sem user_id ao usuário
UPDATE public.condominiums 
SET user_id = (SELECT id FROM public.profiles WHERE email = 'testedesistema01@gmail.com')
WHERE user_id IS NULL OR user_id = '';
```

### Passo 4: Verificar Acesso
```sql
-- Verificar tudo que o usuário tem acesso
SELECT 
  'CONDOMÍNIOS' as tipo,
  c.id,
  c.name as nome,
  c.address as endereco
FROM public.condominiums c
JOIN public.profiles p ON c.user_id = p.id
WHERE p.email = 'testedesistema01@gmail.com'

UNION ALL

SELECT 
  'VIGILANTES' as tipo,
  v.id,
  v.name as nome,
  c.name as endereco
FROM public.vigilantes v
JOIN public.condominiums c ON v.condominium_id = c.id
JOIN public.profiles p ON c.user_id = p.id
WHERE p.email = 'testedesistema01@gmail.com'

UNION ALL

SELECT 
  'MOTOS' as tipo,
  m.id,
  CONCAT(m.brand, ' ', m.model) as nome,
  c.name as endereco
FROM public.motorcycles m
JOIN public.condominiums c ON m.condominium_id = c.id
JOIN public.profiles p ON c.user_id = p.id
WHERE p.email = 'testedesistema01@gmail.com'

ORDER BY tipo, nome;
```

## 🔍 Verificação Pós-Ativação

Após executar a ativação, verifique se:

### 1. Status do Usuário
- ✅ `account_status` = 'active'
- ✅ `approved_at` = data atual
- ✅ `frozen_at` = NULL

### 2. Condomínios
- ✅ Condomínios existentes estão associados ao usuário
- ✅ `user_id` aponta para o ID do usuário ativado

### 3. Vigilantes e Motos
- ✅ Vigilantes dos condomínios são visíveis
- ✅ Motos dos condomínios são visíveis
- ✅ Relacionamentos estão corretos

## 🚨 Troubleshooting

### Usuário Não Encontrado
```sql
-- Verificar se o usuário existe
SELECT * FROM public.profiles WHERE email = 'testedesistema01@gmail.com';
```

### Condomínios Não Associados
```sql
-- Verificar condomínios sem user_id
SELECT * FROM public.condominiums WHERE user_id IS NULL;
```

### Erro de Permissão
- Verifique se você está logado como administrador
- Verifique se tem permissões para modificar a tabela `profiles`

### Vigilantes/Motos Não Aparecem
```sql
-- Verificar relacionamentos
SELECT 
  v.name as vigilante,
  c.name as condominio,
  p.email as usuario
FROM public.vigilantes v
JOIN public.condominiums c ON v.condominium_id = c.id
JOIN public.profiles p ON c.user_id = p.id
WHERE p.email = 'testedesistema01@gmail.com';
```

## 📊 Resultado Esperado

Após a ativação bem-sucedida, o usuário deve ter:

### Status da Conta
- **Email**: testedesistema01@gmail.com
- **Status**: Ativo
- **Aprovado em**: Data atual
- **Bloqueado**: Não

### Acesso Restaurado
- **Condomínios**: Todos os condomínios existentes
- **Vigilantes**: Todos os vigilantes dos condomínios
- **Motos**: Todas as motos dos condomínios
- **Funcionalidades**: Login, checklist, relatórios, etc.

## 🔄 Rollback (Se Necessário)

Se precisar desativar o usuário novamente:

```sql
-- Desativar usuário
UPDATE public.profiles 
SET account_status = 'frozen',
    frozen_at = now(),
    frozen_by = (SELECT id FROM public.profiles WHERE email = 'kauankg@hotmail.com')
WHERE email = 'testedesistema01@gmail.com';
```

## 📞 Suporte

Se encontrar problemas durante a ativação:

1. Verifique os logs no console do navegador
2. Execute as consultas de verificação
3. Confirme se todas as tabelas têm os dados esperados
4. Teste o login do usuário após a ativação

---

**✅ Após executar a ativação, o usuário `testedesistema01@gmail.com` deve conseguir fazer login e acessar todos os condomínios, vigilantes e motos que estavam ativos anteriormente.** 