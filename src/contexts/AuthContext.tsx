
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
      
      // Try to fetch from profiles table with new RLS policies
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, is_admin')
        .eq('id', userId)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (profileData) {
        const mappedProfile: Profile = {
          id: profileData.id,
          email: profileData.email || '',
          full_name: profileData.full_name || '',
          role: profileData.is_admin ? 'admin' : 'vigilante',
          condominium_id: null
        };
        
        console.log('Found profile:', mappedProfile);
        return mappedProfile;
      }

      // If no profile found, return null - the trigger should have created one
      console.log('No profile found for user');
      return null;
    } catch (error) {
      console.error('Error in profile fetch:', error);
      return null;
    }
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
          // Add a small delay to ensure the trigger has time to create the profile
          setTimeout(async () => {
            if (mounted) {
              const userProfile = await fetchUserProfile(session.user.id);
              if (mounted) {
                setProfile(userProfile);
                console.log('Profile set:', userProfile);
              }
            }
          }, 100);
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
      
      // Validate input
      if (!email?.trim() || !password?.trim()) {
        toast.error('Email e senha são obrigatórios');
        return { error: new Error('Missing credentials') };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
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
      
      // Enhanced input validation
      if (!email?.trim() || !password?.trim() || !fullName?.trim()) {
        toast.error('Todos os campos são obrigatórios');
        return { error: new Error('Missing required fields') };
      }

      if (password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres');
        return { error: new Error('Password too short') };
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Email inválido');
        return { error: new Error('Invalid email') };
      }
      
      const { error, data } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
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
        console.error('Sign out error:', error);
        toast.error('Erro ao fazer logout');
      } else {
        toast.success('Logout realizado com sucesso!');
        setProfile(null);
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error);
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
