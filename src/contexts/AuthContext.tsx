
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'vigilante';
  condominium_id: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Primeiro tenta buscar na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, is_admin')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.log('Profile not found in profiles table, creating one...');
        
        // Se não encontrar, cria um profile básico
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const newProfile = {
            id: userId,
            email: userData.user.email || '',
            full_name: userData.user.user_metadata?.full_name || 'Usuário',
            is_admin: true // Por padrão será admin
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            // Se não conseguir criar, retorna um profile padrão
            return {
              id: userId,
              email: userData.user.email || '',
              full_name: userData.user.user_metadata?.full_name || 'Usuário',
              role: 'admin' as const,
              condominium_id: null
            };
          }

          const mappedProfile: Profile = {
            id: createdProfile.id,
            email: createdProfile.email || '',
            full_name: createdProfile.full_name || '',
            role: createdProfile.is_admin ? 'admin' : 'vigilante',
            condominium_id: null
          };
          
          console.log('Created new profile:', mappedProfile);
          return mappedProfile;
        }
      } else if (profileData) {
        const mappedProfile: Profile = {
          id: profileData.id,
          email: profileData.email || '',
          full_name: profileData.full_name || '',
          role: profileData.is_admin ? 'admin' : 'vigilante',
          condominium_id: null
        };
        
        console.log('Found existing profile:', mappedProfile);
        return mappedProfile;
      }
    } catch (error) {
      console.error('Error in profile fetch:', error);
      
      // Em caso de erro, retorna um profile padrão para não bloquear o acesso
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        return {
          id: userId,
          email: userData.user.email || '',
          full_name: userData.user.user_metadata?.full_name || 'Usuário',
          role: 'admin' as const,
          condominium_id: null
        };
      }
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, 'Session:', !!session);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User logged in, fetching profile...');
          const userProfile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setProfile(userProfile);
            console.log('Profile set:', userProfile);
          }
        } else {
          setProfile(null);
          console.log('User logged out, profile cleared');
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('Found existing session, fetching profile...');
            const userProfile = await fetchUserProfile(session.user.id);
            if (mounted) {
              setProfile(userProfile);
              console.log('Profile initialized:', userProfile);
            }
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting to sign in...');
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        let errorMessage = 'Erro ao fazer login';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Entre em contato com o administrador';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos';
        }
        
        toast.error(errorMessage);
        return { error };
      } else {
        console.log('Sign in successful');
        toast.success('Login realizado com sucesso!');
        return { error: null };
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      toast.error('Erro inesperado ao fazer login');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      console.log('Attempting to sign up...');
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        let errorMessage = 'Erro ao criar conta';
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Email inválido';
        }
        
        toast.error(errorMessage);
        return { error };
      } else {
        console.log('Sign up successful');
        toast.success('Conta criada com sucesso! Você já pode fazer login.');
        return { error: null };
      }
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      toast.error('Erro inesperado ao criar conta');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Erro ao fazer logout');
      } else {
        toast.success('Logout realizado com sucesso!');
        setProfile(null);
      }
    } catch (error) {
      toast.error('Erro inesperado ao fazer logout');
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
