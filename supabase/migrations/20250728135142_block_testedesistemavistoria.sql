-- Bloquear acesso do usuário testedesistemavistoria@gmail.com
-- Esta migração define o status da conta como 'frozen' para que o sistema
-- mostre automaticamente a mensagem "Acesso Negado" quando este usuário
-- tentar acessar qualquer funcionalidade do sistema

UPDATE public.profiles 
SET account_status = 'frozen',
    frozen_by = (SELECT id FROM public.profiles WHERE email = 'kauankg@hotmail.com'),
    frozen_at = now()
WHERE email = 'testedesistemavistoria@gmail.com';

-- Verificar se o usuário existe e foi atualizado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = 'testedesistemavistoria@gmail.com'
  ) THEN
    RAISE NOTICE 'Usuário testedesistemavistoria@gmail.com não encontrado na tabela profiles';
  ELSE
    RAISE NOTICE 'Usuário testedesistemavistoria@gmail.com bloqueado com sucesso';
  END IF;
END $$;
