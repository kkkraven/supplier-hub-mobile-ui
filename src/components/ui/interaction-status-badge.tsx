import React from 'react';
import { Badge } from './badge';
import { Clock, MessageSquare, Handshake, Star } from 'lucide-react';
import { InteractionLevel, INTERACTION_LEVEL_LABELS } from '../../types/factory';

interface InteractionStatusBadgeProps {
  level: InteractionLevel;
  lastInteractionDate?: string;
  className?: string;
}

export function InteractionStatusBadge({ 
  level, 
  lastInteractionDate, 
  className = "" 
}: InteractionStatusBadgeProps) {
  const getBadgeConfig = (level: InteractionLevel) => {
    switch (level) {
      case 0:
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: Clock,
          color: 'text-gray-500'
        };
      case 1:
        return {
          variant: 'secondary' as const,
          className: 'bg-blue-50 text-blue-600 border-blue-200',
          icon: MessageSquare,
          color: 'text-blue-500'
        };
      case 2:
        return {
          variant: 'secondary' as const,
          className: 'bg-purple-50 text-purple-600 border-purple-200',
          icon: Handshake,
          color: 'text-purple-500'
        };
      case 3:
        return {
          variant: 'secondary' as const,
          className: 'bg-green-50 text-green-600 border-green-200',
          icon: Star,
          color: 'text-green-500'
        };
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: Clock,
          color: 'text-gray-500'
        };
    }
  };

  const config = getBadgeConfig(level);
  const IconComponent = config.icon;

  const formatLastInteraction = (dateString?: string) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} мес. назад`;
    return `${Math.floor(diffDays / 365)} г. назад`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={config.variant} 
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${config.className}`}
      >
        <IconComponent className={`w-3 h-3 ${config.color}`} />
        {INTERACTION_LEVEL_LABELS[level]}
      </Badge>
      
      {lastInteractionDate && level > 0 && (
        <span className="text-xs text-gray-500">
          {formatLastInteraction(lastInteractionDate)}
        </span>
      )}
    </div>
  );
}
