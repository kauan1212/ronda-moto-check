
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sanitizeInput } from '@/utils/inputSanitizer';
import { useRateLimit } from '@/hooks/useRateLimit';
import { ArrowLeft } from 'lucide-react';

interface PasswordRecoveryProps {
  onBack: () => void;
}

const PasswordRecovery = ({ onBack }: PasswordRecoveryProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isBlocked, checkRateLimit, recordAttempt, getRemainingTime } = useRateLimit('password-recovery', 3, 15 * 60 * 1000);

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkRateLimit()) {
      const remaining = getRemainingTime();
      toast.error(`Muitas tentativas de recuperação. Tente novamente em ${Math.ceil(remaining / 60)} minutos.`);
      return;
    }

    setIsLoading(true);

    try {
      const sanitizedEmail = sanitizeInput(email);
      const redirectUrl = `${window.location.origin}/auth/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: redirectUrl
      });

      if (error) {
        recordAttempt(false);
        if (error.message.includes('rate limit')) {
          toast.error('Muitas tentativas de recuperação. Tente novamente mais tarde.');
        } else {
          toast.error('Erro ao enviar email de recuperação. Verifique se o email está correto.');
        }
        return;
      }

      recordAttempt(true);

      // Log the password reset request
      await supabase.from('password_resets').insert({
        email: sanitizedEmail,
        request_type: 'user_request'
      });

      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setEmail('');
    } catch (error) {
      console.error('Password recovery error:', error);
      recordAttempt(false);
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-1 h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>Recuperar Senha</CardTitle>
            <CardDescription>
              Digite seu email para receber um link de recuperação
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordRecovery} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recovery-email">Email</Label>
            <Input
              id="recovery-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={isBlocked || isLoading}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || isBlocked}
          >
            {isLoading ? 'Enviando...' : 'Enviar Email de Recuperação'}
          </Button>

          {isBlocked && (
            <p className="text-sm text-red-600 text-center">
              Muitas tentativas. Aguarde {Math.ceil(getRemainingTime() / 60)} minutos.
            </p>
          )}

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={onBack}
              className="text-sm"
            >
              Voltar ao login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PasswordRecovery;
