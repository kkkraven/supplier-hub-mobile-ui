'use client'

import React from 'react';
import { MapPin, Star, Clock, Users, Package, MessageSquare, Shield, Calendar, Award, Lock, TrendingUp, Phone, Mail, Globe, MessageCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { TouchButton } from './touch-button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Factory, SEGMENT_LABELS, SEGMENT_COLORS, INTERACTION_LEVEL_LABELS } from '../../types/factory';
import { InteractionStatusBadge } from './interaction-status-badge';
import { ContactInfo } from './contact-info';
import { FactoryStats } from './factory-stats';
import { useIsMobile } from './use-mobile';

interface MobileFactoryCardProps {
  factory: Factory;
  onClick?: (factoryId: string) => void;
  onChat?: (factoryId: string) => void;
  className?: string;
  isPaywallActive?: boolean;
}

export function MobileFactoryCard({
  factory,
  onClick,
  onChat,
  className,
  isPaywallActive = true
}: MobileFactoryCardProps) {
  const isMobile = useIsMobile();
  const displayName = factory.legal_name_en || factory.legal_name_cn;
  const isVerified = factory.last_verified && 
    new Date(factory.last_verified) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  
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

  const getCertificationBadges = () => {
    if (!factory.certifications) return [];
    const badges = [];
    
    if (factory.certifications.bsci) badges.push('BSCI');
    if (factory.certifications.iso9001) badges.push('ISO9001');
    if (factory.certifications.gots) badges.push('GOTS');
    if (factory.certifications.oeko_tex) badges.push('Oeko-Tex');
    
    return badges.slice(0, 2); // Показываем только 2 на мобильных
  };

  const getFactoryIllustration = () => {
    const category = factory.specialization?.[0] || 'Текстиль';
    
    if (category.includes('хлопок') || category.includes('Knit')) {
      return 'https://images.unsplash.com/photo-1559947049-c5c0afc2319e?w=400&h=200&fit=crop&auto=format';
    } else if (category.includes('ткани') || category.includes('Woven')) {
      return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop&auto=format';
    } else if (category.includes('одежда') || category.includes('Outerwear')) {
      return 'https://images.unsplash.com/photo-1558947049-c5c0afc2319e?w=400&h=200&fit=crop&auto=format';
    } else if (category.includes('Спортивный')) {
      return 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=400&h=200&fit=crop&auto=format';
    } else {
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&auto=format';
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs font-medium text-gray-700 ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  // Фиктивные данные для демонстрации
  const facturaRating = 4.2 + Math.random() * 0.8; // 4.2-5.0
  const completedDeals = Math.floor(Math.random() * 25) + 5; // 5-30
  const reviewCount = Math.floor(Math.random() * 50) + 10; // 10-60

  return (
    <Card
      className={`w-full cursor-pointer transform transition-all duration-200 active:scale-[0.98] bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}
      onClick={() => onClick?.(factory.factory_id)}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Left side - Image */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
              <ImageWithFallback
                src={getFactoryIllustration()}
                alt="Factory production"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Verified badge overlay */}
            {isVerified && (
              <div className="absolute -top-1 -right-1">
                <Badge className="bg-success text-white text-xs px-1 py-0.5 shadow-sm">
                  <Shield className="w-2 h-2" />
                </Badge>
              </div>
            )}
          </div>

          {/* Right side - Content */}
          <div className="flex-1 min-w-0">
            {/* Header with badges */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                {/* Factory Name */}
                <div className="relative mb-1">
                  {isPaywallActive ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded flex items-center justify-center z-10">
                        <Lock className="w-3 h-3 text-gray-400" />
                      </div>
                      <div className="blur-sm">
                        <h3 className="text-sm font-semibold text-gray-900">
                          ████████████
                        </h3>
                      </div>
                    </div>
                  ) : (
                    <h3 className="text-sm font-semibold text-gray-900 truncate" title={displayName}>
                      {displayName}
                    </h3>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="truncate">
                    {factory.city}{factory.province ? `, ${factory.province}` : ''}
                  </span>
                </div>
              </div>

              {/* Segment badge */}
              <Badge className={`text-xs px-2 py-1 ml-2 flex-shrink-0 ${SEGMENT_COLORS[factory.segment]}`}>
                {SEGMENT_LABELS[factory.segment]}
              </Badge>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="text-xs">
                <div className="text-gray-500">MOQ</div>
                <div className="font-medium">{formatMOQ(factory.moq_units)}</div>
              </div>
              <div className="text-xs">
                <div className="text-gray-500">Срок</div>
                <div className="font-medium">{formatLeadTime(factory.lead_time_days)}</div>
              </div>
            </div>

            {/* Rating and interaction */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {renderStarRating(facturaRating)}
                <span className="text-xs text-gray-500">({reviewCount})</span>
              </div>
              
              <InteractionStatusBadge 
                level={factory.interaction_level}
                lastInteractionDate={factory.last_interaction_date}
                className="text-xs"
              />
            </div>

            {/* Certifications */}
            {getCertificationBadges().length > 0 && (
              <div className="flex gap-1 mt-2">
                {getCertificationBadges().map((cert, index) => (
                  <Badge
                    key={`cert-${index}`}
                    variant="secondary"
                    className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700"
                  >
                    {cert}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Arrow indicator */}
          <div className="flex items-center justify-center w-6 h-6 text-gray-400 flex-shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Action buttons - Full width below content */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <TouchButton
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(factory.factory_id);
            }}
            className="flex-1 text-xs"
            touchTarget="default"
          >
            Подробнее
          </TouchButton>
          <TouchButton
            variant="primary"
            size="sm"
            icon={<MessageSquare className="w-3 h-3" />}
            onClick={(e) => {
              e.stopPropagation();
              onChat?.(factory.factory_id);
            }}
            className="flex-1 text-xs"
            touchTarget="default"
          >
            RFQ
          </TouchButton>
        </div>
      </CardContent>
    </Card>
  );
}

// Компактная версия для списков
export function MobileFactoryCardCompact({
  factory,
  onClick,
  onChat,
  className,
  isPaywallActive = true
}: MobileFactoryCardProps) {
  const displayName = factory.legal_name_en || factory.legal_name_cn;
  const isVerified = factory.last_verified && 
    new Date(factory.last_verified) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  const formatMOQ = (moq?: number) => {
    if (!moq) return 'По запросу';
    if (moq >= 1000) return `${Math.floor(moq / 1000)}k`;
    return `${moq}`;
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 active:scale-[0.98] ${className}`}
      onClick={() => onClick?.(factory.factory_id)}
    >
      {/* Image */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop&auto=format"
            alt="Factory"
            className="w-full h-full object-cover"
          />
        </div>
        {isVerified && (
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-success rounded-full border-2 border-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {isPaywallActive ? '██████████' : displayName}
          </h3>
          <Badge className={`text-xs px-1.5 py-0.5 ${SEGMENT_COLORS[factory.segment]}`}>
            {SEGMENT_LABELS[factory.segment]}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {factory.city}
          </span>
          <span>MOQ: {formatMOQ(factory.moq_units)}</span>
        </div>
      </div>

      {/* Action */}
      <TouchButton
        variant="ghost"
        size="sm"
        icon={<ChevronRight className="w-4 h-4" />}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(factory.factory_id);
        }}
        className="flex-shrink-0"
        touchTarget="default"
      />
    </div>
  );
}
