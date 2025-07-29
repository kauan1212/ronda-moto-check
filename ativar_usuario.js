// Script para ativar o usuário testedesistema01@gmail.com
// Execute este script no console do navegador (F12 -> Console)

async function ativarUsuario(email) {
  try {
    console.log('🔧 Iniciando ativação do usuário:', email);
    
    // 1. Verificar se o usuário existe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log('❌ Usuário não encontrado:', email);
        return;
      }
      throw profileError;
    }
    
    console.log('✅ Usuário encontrado:', profile);
    
    // 2. Ativar o usuário
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        account_status: 'active',
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id,
        frozen_at: null,
        frozen_by: null
      })
      .eq('email', email)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Erro ao ativar usuário:', updateError);
      return;
    }
    
    console.log('✅ Usuário ativado com sucesso:', updatedProfile);
    
    // 3. Verificar condomínios existentes
    const { data: condominiums, error: condError } = await supabase
      .from('condominiums')
      .select('*')
      .order('created_at');
    
    if (condError) {
      console.error('❌ Erro ao buscar condomínios:', condError);
    } else {
      console.log('📋 Condomínios encontrados:', condominiums?.length || 0);
    }
    
    // 4. Associar condomínios sem user_id ao usuário ativado
    const { data: updatedCondominiums, error: condUpdateError } = await supabase
      .from('condominiums')
      .update({ user_id: profile.id })
      .is('user_id', null)
      .select();
    
    if (condUpdateError) {
      console.error('❌ Erro ao associar condomínios:', condUpdateError);
    } else if (updatedCondominiums && updatedCondominiums.length > 0) {
      console.log('✅ Condomínios associados:', updatedCondominiums.length);
    }
    
    // 5. Verificar vigilantes
    const { data: vigilantes, error: vigError } = await supabase
      .from('vigilantes')
      .select(`
        *,
        condominiums!inner(
          id,
          name,
          user_id
        )
      `)
      .eq('condominiums.user_id', profile.id);
    
    if (vigError) {
      console.error('❌ Erro ao buscar vigilantes:', vigError);
    } else {
      console.log('👮 Vigilantes do usuário:', vigilantes?.length || 0);
    }
    
    // 6. Verificar motos
    const { data: motorcycles, error: motoError } = await supabase
      .from('motorcycles')
      .select(`
        *,
        condominiums!inner(
          id,
          name,
          user_id
        )
      `)
      .eq('condominiums.user_id', profile.id);
    
    if (motoError) {
      console.error('❌ Erro ao buscar motos:', motoError);
    } else {
      console.log('🏍️ Motos do usuário:', motorcycles?.length || 0);
    }
    
    // 7. Resumo final
    console.log('🎉 Ativação concluída!');
    console.log('📊 Resumo:');
    console.log(`   - Usuário: ${email}`);
    console.log(`   - Status: ${updatedProfile.account_status}`);
    console.log(`   - Condomínios: ${updatedCondominiums?.length || 0} associados`);
    console.log(`   - Vigilantes: ${vigilantes?.length || 0} encontrados`);
    console.log(`   - Motos: ${motorcycles?.length || 0} encontradas`);
    
    // 8. Mostrar detalhes dos condomínios associados
    const { data: userCondominiums, error: userCondError } = await supabase
      .from('condominiums')
      .select('*')
      .eq('user_id', profile.id);
    
    if (!userCondError && userCondominiums) {
      console.log('🏢 Condomínios do usuário:');
      userCondominiums.forEach(cond => {
        console.log(`   - ${cond.name} (${cond.address})`);
      });
    }
    
    return {
      profile: updatedProfile,
      condominiums: userCondominiums,
      vigilantes,
      motorcycles
    };
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
    return null;
  }
}

// Função para verificar o status atual
async function verificarStatus(email) {
  try {
    console.log('🔍 Verificando status do usuário:', email);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log('📋 Status atual:');
    console.log(`   - Email: ${profile.email}`);
    console.log(`   - Nome: ${profile.full_name || 'Não informado'}`);
    console.log(`   - Status: ${profile.account_status}`);
    console.log(`   - Admin: ${profile.is_admin ? 'Sim' : 'Não'}`);
    console.log(`   - Criado em: ${new Date(profile.created_at).toLocaleString('pt-BR')}`);
    
    if (profile.approved_at) {
      console.log(`   - Aprovado em: ${new Date(profile.approved_at).toLocaleString('pt-BR')}`);
    }
    
    if (profile.frozen_at) {
      console.log(`   - Bloqueado em: ${new Date(profile.frozen_at).toLocaleString('pt-BR')}`);
    }
    
    return profile;
  } catch (error) {
    console.error('💥 Erro ao verificar status:', error);
  }
}

// Executar ativação
console.log('🚀 Iniciando processo de ativação...');
ativarUsuario('testedesistema01@gmail.com');

// Para verificar o status antes/depois, execute:
// verificarStatus('testedesistema01@gmail.com'); 