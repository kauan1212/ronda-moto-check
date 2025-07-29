
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useRateLimit } from '@/hooks/useRateLimit';
import { sanitizeInput } from '@/utils/inputSanitizer';
import PasswordRecovery from '@/components/auth/PasswordRecovery';

const SecureLoginPage = () => {
  const { user, loading } = useAuth();
  const { isBlocked, checkRateLimit, recordAttempt, getRemainingTime } = useRateLimit('login', 5, 15 * 60 * 1000);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', confirmPassword: '', fullName: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);

  console.log('🔐 SecureLoginPage state:', { user: user?.email, loading });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    console.log('✅ SecureLoginPage: User authenticated, redirecting to home');
    return <Navigate to="/" replace />;
  }

  if (showPasswordRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <PasswordRecovery onBack={() => setShowPasswordRecovery(false)} />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔐 SecureLoginPage: Login attempt for:', loginData.email);
    
    if (!checkRateLimit()) {
      const remaining = getRemainingTime();
      toast.error(`Muitas tentativas de login. Tente novamente em ${Math.ceil(remaining / 60)} minutos.`);
      return;
    }

    setIsLoading(true);

    try {
      const sanitizedEmail = sanitizeInput(loginData.email);
      const sanitizedPassword = loginData.password; // Don't sanitize passwords

      console.log('🔐 SecureLoginPage: Attempting login with sanitized email');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      if (error) {
        console.error('❌ SecureLoginPage: Login error:', error);
        recordAttempt(false);
        
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Por favor, confirme seu email antes de fazer login.');
        } else {
          toast.error('Erro ao fazer login. Tente novamente.');
        }
        return;
      }

      if (data.user) {
        console.log('✅ SecureLoginPage: Login successful, checking account status');
        
        // Check account status with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile check timeout')), 5000)
        );

        const profilePromise = supabase
          .from('profiles')
          .select('account_status')
          .eq('id', data.user.id)
          .single();

        try {
          const { data: profile } = await Promise.race([profilePromise, timeoutPromise]) as any;

          if (profile?.account_status === 'pending') {
            console.log('⏳ SecureLoginPage: Account pending');
            await supabase.auth.signOut();
            toast.error('Sua conta está pendente de aprovação pelo administrador.');
            recordAttempt(false);
            return;
          }

          if (profile?.account_status === 'frozen') {
            console.log('🧊 SecureLoginPage: Account frozen');
            await supabase.auth.signOut();
            toast.error('Sua conta foi congelada. Entre em contato com o administrador.');
            recordAttempt(false);
            return;
          }

          console.log('✅ SecureLoginPage: Account status check passed');
          recordAttempt(true);
          toast.success('Login realizado com sucesso!');
        } catch (statusError) {
          console.error('⚠️ SecureLoginPage: Error checking account status:', statusError);
          // Allow login to proceed even if status check fails
          recordAttempt(true);
          toast.success('Login realizado com sucesso!');
        }
      }
    } catch (error) {
      recordAttempt(false);
      console.error('💥 SecureLoginPage: Unexpected login error:', error);
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('📝 SecureLoginPage: Signup attempt for:', signupData.email);

    if (signupData.password !== signupData.confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    if (signupData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const sanitizedData = {
        email: sanitizeInput(signupData.email),
        fullName: sanitizeInput(signupData.fullName),
        password: signupData.password
      };

      const redirectUrl = `${window.location.origin}/`;
      
      console.log('📝 SecureLoginPage: Creating account with sanitized data');

      const { error } = await supabase.auth.signUp({
        email: sanitizedData.email,
        password: sanitizedData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: sanitizedData.fullName
          }
        }
      });

      if (error) {
        console.error('❌ SecureLoginPage: Signup error:', error);
        if (error.message.includes('already registered')) {
          toast.error('Este email já está registrado. Tente fazer login.');
        } else {
          toast.error(`Erro ao criar conta: ${error.message}`);
        }
        return;
      }

      console.log('✅ SecureLoginPage: Signup successful');
      toast.success('Conta criada! Verifique seu email e aguarde aprovação do administrador.');
      setSignupData({ email: '', password: '', confirmPassword: '', fullName: '' });
    } catch (error) {
      console.error('💥 SecureLoginPage: Unexpected signup error:', error);
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sistema de Vistoria</CardTitle>
          <CardDescription>
            Faça login ou crie sua conta para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={isBlocked}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    disabled={isBlocked}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || isBlocked}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
                
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowPasswordRecovery(true)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Esqueci minha senha
                  </Button>
                </div>

                {isBlocked && (
                  <p className="text-sm text-red-600 text-center">
                    Muitas tentativas. Aguarde {Math.ceil(getRemainingTime() / 60)} minutos.
                  </p>
                )}
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome Completo</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Criando conta...' : 'Criar Conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureLoginPage;
