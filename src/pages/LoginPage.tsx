
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LoginPageProps {
  onLoginSuccess: (isAdmin: boolean) => void;
}

const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [success, setSuccess] = useState('');
  const [userLogo, setUserLogo] = useState<string | null>(null);
  
  const { signIn, signUp, user, isAdmin } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('User logged in, redirecting...', { user: user.email, isAdmin });
      onLoginSuccess(isAdmin);
    }
  }, [user, isAdmin, onLoginSuccess]);

  // Carregar logo do usuário quando o email for inserido
  useEffect(() => {
    const loadUserLogo = async () => {
      if (email && email.includes('@')) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('logo_url')
            .eq('email', email)
            .single();

          if (data?.logo_url) {
            setUserLogo(data.logo_url);
          } else {
            setUserLogo(null);
          }
        } catch (error) {
          setUserLogo(null);
        }
      } else {
        setUserLogo(null);
      }
    };

    const timeoutId = setTimeout(loadUserLogo, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    console.log('Starting sign in process...');

    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        console.error('Sign in error:', error);
        
        if (error.message.includes('Sua conta está pendente de aprovação')) {
          setError('Sua conta está pendente de aprovação pelo administrador. Aguarde a liberação para acessar o sistema.');
        } else if (error.message.includes('Sua conta foi congelada')) {
          setError('Sua conta foi congelada pelo administrador. Entre em contato para mais informações.');
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos. Verifique suas credenciais.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Email ainda não confirmado. Verifique sua caixa de entrada.');
        } else {
          setError(`Erro no login: ${error.message}`);
        }
      } else if (data?.user) {
        console.log('Sign in successful:', data.user.email);
        toast.success('Login realizado com sucesso!');
        setSuccess('Login realizado com sucesso! Redirecionando...');
      }
    } catch (err: any) {
      console.error('Unexpected sign in error:', err);
      setError('Erro inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    console.log('Starting sign up process...');

    try {
      const { data, error } = await signUp(email, password, fullName);
      
      if (error) {
        console.error('Sign up error:', error);
        
        if (error.message.includes('User already registered')) {
          setError('Este email já está cadastrado. Tente fazer login.');
        } else if (error.message.includes('Password should be at least')) {
          setError('A senha deve ter pelo menos 6 caracteres.');
        } else {
          setError(`Erro ao criar conta: ${error.message}`);
        }
      } else if (data?.user) {
        console.log('Sign up successful:', data.user.email);
        
        if (data.user.email_confirmed_at) {
          toast.success('Conta criada! Aguarde aprovação do administrador.');
          setSuccess('Conta criada com sucesso! Sua conta será aprovada pelo administrador antes que você possa acessar o sistema.');
        } else {
          toast.success('Conta criada! Verifique seu email e aguarde aprovação.');
          setSuccess('Conta criada com sucesso! Verifique seu email para confirmar e aguarde a aprovação do administrador.');
        }
        setIsSignUp(false);
      }
    } catch (err: any) {
      console.error('Unexpected sign up error:', err);
      setError('Erro inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getErrorIcon = () => {
    if (error.includes('pendente de aprovação')) {
      return <Clock className="h-4 w-4" />;
    } else if (error.includes('congelada')) {
      return <XCircle className="h-4 w-4" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {userLogo ? (
            <div className="flex justify-center mb-4">
              <img 
                src={userLogo} 
                alt="Logo" 
                className="max-h-20 max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/3ff36fea-6d51-4fea-a019-d8989718b9cd.png" 
                alt="VigioSystem Logo" 
                className="h-20 w-20 object-contain"
              />
            </div>
          )}
          <CardTitle className="text-2xl">Sistema de Vigilância</CardTitle>
          <CardDescription>
            Faça login ou crie sua conta para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(value) => setIsSignUp(value === "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <div className="flex items-center gap-2">
                      {getErrorIcon()}
                      <AlertDescription>{error}</AlertDescription>
                    </div>
                  </Alert>
                )}
                
                {success && (
                  <Alert>
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Senha</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !email || !password}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-0.5 text-blue-600" />
                      <AlertDescription className="text-blue-700">{success}</AlertDescription>
                    </div>
                  </Alert>
                )}

                {email === 'kauankg@hotmail.com' && (
                  <Alert>
                    <AlertDescription>
                      ✅ Este email será automaticamente configurado como administrador do sistema.
                    </AlertDescription>
                  </Alert>
                )}

                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Importante:</strong> Novas contas precisam ser aprovadas pelo administrador antes do primeiro acesso.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-fullName">Nome Completo</Label>
                  <Input
                    id="signup-fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !email || !password || !fullName}
                >
                  {loading ? 'Criando...' : 'Criar Conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
