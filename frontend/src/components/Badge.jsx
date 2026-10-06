import React from 'react';
import { Clock, Send, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const Badge = ({ status }) => {
  const normStatus = (status || 'PENDING').toUpperCase();

  const getBadgeConfig = () => {
    switch (normStatus) {
      case 'DRAFT':
        return { class: 'badge-draft', icon: Clock, label: 'Draft' };
      case 'SENDING':
        return { class: 'badge-sending', icon: Send, label: 'Sending' };
      case 'SENT':
        return { class: 'badge-sent', icon: Send, label: 'Sent' };
      case 'DELIVERED':
        return { class: 'badge-delivered', icon: CheckCircle2, label: 'Delivered' };
      case 'FAILED':
        return { class: 'badge-failed', icon: XCircle, label: 'Failed' };
      default:
        return { class: 'badge-pending', icon: AlertCircle, label: normStatus };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <span className={`badge ${config.class}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};
