import { supabase } from '@/integrations/supabase/client';

// Função para buscar a logo do usuário
export const getUserLogo = async (userId?: string): Promise<string> => {
  if (!userId) {
    return '/lovable-uploads/3ff36fea-6d51-4fea-a019-d8989718b9cd.png';
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('logo_url')
      .eq('id', userId)
      .single();

    if (error || !data?.logo_url) {
      return '/lovable-uploads/3ff36fea-6d51-4fea-a019-d8989718b9cd.png';
    }

    return data.logo_url;
  } catch (error) {
    console.error('Erro ao buscar logo do usuário:', error);
    return '/lovable-uploads/3ff36fea-6d51-4fea-a019-d8989718b9cd.png';
  }
};