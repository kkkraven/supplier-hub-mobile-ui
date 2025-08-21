import React from 'react';
import { MapPin, Star, Clock, Users, Package, MessageSquare, Shield, Award, TrendingUp, Phone, Mail, Globe, MessageCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Factory, SEGMENT_LABELS, SEGMENT_COLORS, INTERACTION_LEVEL_LABELS } from '../types/factory';
import { InteractionStatusBadge } from './ui/interaction-status-badge';
import { ContactInfo } from './ui/contact-info';
import { FactoryStats } from './ui/factory-stats';

interface FactoryListItemProps {
  factory: Factory;
  onClick?: (factoryId: string) => void;
  onChat?: (factoryId: string) => void;
  className?: string;
  isPaywallActive?: boolean;
}

export function FactoryListItem({
  factory,
  onClick,
  onChat,
  className,
  isPaywallActive = true
}: FactoryListItemProps) {
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
    
    return badges.slice(0, 3);
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
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm font-medium text-gray-700 ml-1">
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
      className={`w-full cursor-pointer transform transition-all duration-300 hover:shadow-lg group bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}
      onClick={() => onClick?.(factory.factory_id)}
    >
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Image */}
          <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
            <ImageWithFallback
              src={getFactoryIllustration()}
              alt="Factory production"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            
            {/* Top badges */}
            <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
              {isVerified && (
                <Badge className="bg-success text-white text-xs px-1.5 py-0.5 shadow-md">
                  <Shield className="w-2.5 h-2.5 mr-0.5" />
                  Verified
                </Badge>
              )}
              <Badge className={`text-xs px-1.5 py-0.5 shadow-md ${SEGMENT_COLORS[factory.segment]}`}>
                {SEGMENT_LABELS[factory.segment]}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                {/* Factory Name */}
                <div className="relative mb-2">
                  {isPaywallActive ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                        <div className="text-center">
                          <Shield className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500 font-medium">Название скрыто</p>
                        </div>
                      </div>
                      <div className="blur-sm">
                        <h3 className="text-lg font-semibold text-gray-900">
                          ████████████
                        </h3>
                      </div>
                    </div>
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900" title={displayName}>
                      {displayName}
                    </h3>
                  )}
                </div>
                
                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>
                    {factory.city}{factory.province ? `, ${factory.province}` : ''}
                  </span>
                </div>
              </div>

              {/* Interaction level */}
              <div className="flex-shrink-0 ml-4">
                <InteractionStatusBadge 
                  level={factory.interaction_level}
                  lastInteractionDate={factory.last_interaction_date}
                  className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md"
                />
              </div>
            </div>

            {/* Specializations */}
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">
                Специализация: {factory.specialization?.join(', ') || 'Текстильное производство'}
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-3">
              <ContactInfo
                wechatId={factory.wechat_id}
                phone={factory.phone}
                email={factory.email}
                website={factory.website}
                address={factory.address_cn}
                compact={true}
                showCopyButtons={false}
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center bg-gray-50 rounded-lg py-2 px-2">
                <Package className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-gray-500 mb-1">MOQ</p>
                <p className="text-sm font-medium text-gray-900">{formatMOQ(factory.moq_units)}</p>
              </div>
              <div className="text-center bg-gray-50 rounded-lg py-2 px-2">
                <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-gray-500 mb-1">Срок</p>
                <p className="text-sm font-medium text-gray-900">{formatLeadTime(factory.lead_time_days)}</p>
              </div>
              <div className="text-center bg-gray-50 rounded-lg py-2 px-2">
                <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-gray-500 mb-1">Мощность</p>
                <p className="text-sm font-medium text-gray-900">{formatCapacity(factory.capacity_month)}</p>
              </div>
              <div className="text-center bg-gray-50 rounded-lg py-2 px-2">
                <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-gray-500 mb-1">Рейтинг</p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium text-gray-900">{facturaRating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between">
              {/* Certifications */}
              <div className="flex flex-wrap gap-2">
                {getCertificationBadges().map((cert, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs px-2 py-1 bg-primary/10 text-primary border border-primary/20"
                  >
                    <Award className="w-3 h-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm hover:bg-gray-50 border-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick?.(factory.factory_id);
                  }}
                >
                  Подробнее
                </Button>
                <Button
                  size="sm"
                  className="text-sm bg-primary hover:bg-primary/90 gradient-factura"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChat?.(factory.factory_id);
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  RFQ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
