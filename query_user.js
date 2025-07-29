// Script para consultar o usuário com email: testedesistema01@gmail.com
// Execute este script no console do navegador (F12 -> Console)

// Função para consultar usuário por email
async function queryUserByEmail(email) {
  try {
    console.log('🔍 Consultando usuário com email:', email);
    
    // Consultar na tabela profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (profileError) {
      console.log('❌ Erro ao consultar perfil:', profileError);
      if (profileError.code === 'PGRST116') {
        console.log('ℹ️ Usuário não encontrado na tabela profiles');
      }
    } else {
      console.log('✅ Perfil encontrado:', profile);
    }
    
    // Consultar na tabela auth.users (requer permissões de admin)
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email);
      
      if (authError) {
        console.log('❌ Erro ao consultar auth.users:', authError);
      } else {
        console.log('✅ Usuário auth encontrado:', authUser);
      }
    } catch (adminError) {
      console.log('⚠️ Não foi possível consultar auth.users (requer permissões de admin):', adminError.message);
    }
    
    // Consultar roles do usuário
    if (profile) {
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', profile.id);
      
      if (rolesError) {
        console.log('❌ Erro ao consultar roles:', rolesError);
      } else {
        console.log('✅ Roles do usuário:', roles);
      }
    }
    
    return { profile, authUser: null, roles: null };
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
    return null;
  }
}

// Executar a consulta
queryUserByEmail('testedesistema01@gmail.com'); 