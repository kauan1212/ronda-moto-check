
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, UserCheck, UserX } from 'lucide-react';
import { UserProfile } from './types';

interface AccountStatusManagerProps {
  user: UserProfile;
  onApprove: (userId: string) => void;
  onFreeze: (userId: string) => void;
  onUnfreeze: (userId: string) => void;
  loading?: boolean;
}

const AccountStatusManager: React.FC<AccountStatusManagerProps> = ({
  user,
  onApprove,
  onFreeze,
  onUnfreeze,
  loading = false
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativa
          </Badge>
        );
      case 'frozen':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Congelada
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      default:
        return null;
    }
  };

  const getActionButtons = () => {
    switch (user.account_status) {
      case 'pending':
        return (
          <Button
            onClick={() => onApprove(user.id)}
            disabled={loading}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Aprovar
          </Button>
        );
      case 'active':
        return (
          <Button
            onClick={() => onFreeze(user.id)}
            disabled={loading}
            variant="destructive"
            size="sm"
          >
            <UserX className="h-4 w-4 mr-1" />
            Congelar
          </Button>
        );
      case 'frozen':
        return (
          <Button
            onClick={() => onUnfreeze(user.id)}
            disabled={loading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Descongelar
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getStatusBadge(user.account_status)}
      {getActionButtons()}
    </div>
  );
};

export default AccountStatusManager;
