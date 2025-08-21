import React from 'react';
import { Users, Package, Clock, Star, TrendingUp, Award, Shield } from 'lucide-react';
import { Badge } from './badge';

interface FactoryStatsProps {
  deals?: number;
  moq?: number;
  leadTime?: number;
  capacity?: number;
  rating?: number;
  reviewCount?: number;
  certifications?: string[];
  verified?: boolean;
  className?: string;
  compact?: boolean;
}

export function FactoryStats({
  deals,
  moq,
  leadTime,
  capacity,
  rating,
  reviewCount,
  certifications = [],
  verified = false,
  className = "",
  compact = false
}: FactoryStatsProps) {
  const formatMOQ = (moq?: number) => {
    if (!moq) return 'По запросу';
    if (moq >= 1000) return `${Math.floor(moq / 1000)}k шт`;
    return `${moq} шт`;
  };

  const formatLeadTime = (days?: number) => {
    if (!days) return 'По запросу';
    if (days <= 7) return `${days} дн`;
    if (days <= 30) return `${Math.ceil(days / 7)} нед`;
    return `${Math.ceil(days / 30)} мес`;
  };

  const formatCapacity = (capacity?: number) => {
    if (!capacity) return 'По запросу';
    if (capacity >= 1000000) return `${Math.floor(capacity / 1000000)}M/мес`;
    if (capacity >= 1000) return `${Math.floor(capacity / 1000)}K/мес`;
    return `${capacity}/мес`;
  };

  const StatItem = ({ 
    icon: Icon, 
    label, 
    value, 
    color = "text-gray-600",
    iconColor = "text-gray-400"
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | number;
    color?: string;
    iconColor?: string;
  }) => (
    <div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'text-base'}`}>
      <div className={`flex-shrink-0 w-4 h-4 ${iconColor}`}>
        <Icon className="w-full h-full" />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-medium ${color}`}>{value}</div>
        <div className="text-gray-500 text-xs">{label}</div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Rating and Reviews */}
      {rating !== undefined && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
          </div>
          {reviewCount && (
            <span className="text-sm text-gray-500">
              ({reviewCount} отзывов)
            </span>
          )}
          {verified && (
            <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-200">
              <Shield className="w-3 h-3 mr-1" />
              Проверена
            </Badge>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className={`grid ${compact ? 'grid-cols-2 gap-3' : 'grid-cols-1 gap-4'}`}>
        {deals !== undefined && (
          <StatItem
            icon={Users}
            label="Сделок"
            value={deals}
            color="text-blue-600"
            iconColor="text-blue-500"
          />
        )}
        
        {moq !== undefined && (
          <StatItem
            icon={Package}
            label="Мин. заказ"
            value={formatMOQ(moq)}
            color="text-purple-600"
            iconColor="text-purple-500"
          />
        )}
        
        {leadTime !== undefined && (
          <StatItem
            icon={Clock}
            label="Срок поставки"
            value={formatLeadTime(leadTime)}
            color="text-orange-600"
            iconColor="text-orange-500"
          />
        )}
        
        {capacity !== undefined && (
          <StatItem
            icon={TrendingUp}
            label="Мощность"
            value={formatCapacity(capacity)}
            color="text-green-600"
            iconColor="text-green-500"
          />
        )}
      </div>

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="w-4 h-4" />
            <span className="font-medium">Сертификации:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {certifications.slice(0, 4).map((cert, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs px-2 py-1 bg-blue-50 border-blue-200 text-blue-700"
              >
                {cert}
              </Badge>
            ))}
            {certifications.length > 4 && (
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-1 bg-gray-50 border-gray-200 text-gray-600"
              >
                +{certifications.length - 4}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
