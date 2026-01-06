'use client';

import { CheckCircle, Info, XCircle } from 'lucide-react';

interface Props {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function SubscriptionAlert({ type, message }: Props) {
  const styles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: XCircle,
      iconColor: 'text-red-600',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600',
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className={`${style.bg} border rounded-xl p-4 flex items-start gap-3`}>
      <Icon className={`h-5 w-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
      <p className={`text-sm font-medium ${style.text}`}>{message}</p>
    </div>
  );
}
