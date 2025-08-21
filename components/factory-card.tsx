import React from 'react';
import { MapPin, Star, Clock, Users, Package, MessageSquare, Shield, Calendar, Award, Lock, TrendingUp, Phone, Mail, Globe, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Factory, SEGMENT_LABELS, SEGMENT_COLORS, INTERACTION_LEVEL_LABELS } from '../types/factory';

interface FactoryCardProps {
  factory: Factory;
  onClick?: (factoryId: string) => void;
  onChat?: (factoryId: string) => void;
  className?: string;
  isPaywallActive?: boolean;
}

export function FactoryCard({
  factory,
  onClick,
  onChat,
  className,
  isPaywallActive = true
}: FactoryCardProps) {
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
      className={`w-full max-w-lg cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}
      onClick={() => onClick?.(factory.factory_id)}
    >
      {/* Header Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <ImageWithFallback
          src={getFactoryIllustration()}
          alt="Factory production"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {isVerified && (
            <Badge className="bg-success text-white text-xs px-2 py-1 shadow-md">
              <Shield className="w-3 h-3 mr-1" />
              Verified by Factura
            </Badge>
          )}
          <Badge className={`text-xs px-2 py-1 shadow-md ${SEGMENT_COLORS[factory.segment]}`}>
            {SEGMENT_LABELS[factory.segment]}
          </Badge>
        </div>
        
        {/* Interaction level */}
        <div className="absolute top-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-md">
            <div className={`w-2 h-2 rounded-full ${
              factory.interaction_level === 0 ? 'bg-gray-400' :
              factory.interaction_level === 1 ? 'bg-blue-500' :
              factory.interaction_level === 2 ? 'bg-green-500' : 'bg-purple-500'
            }`} />
            <span className="text-xs font-medium text-gray-700">
              {factory.interaction_level === 0 ? 'Новый' :
               factory.interaction_level === 1 ? '1 сделка' :
               factory.interaction_level === 2 ? 'Несколько' : 'Активный'}
            </span>
          </div>
        </div>

        {/* Category overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-sm font-medium text-gray-900">
              {factory.specialization?.[0] || 'Текстильное производство'}
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Factory Name - Blurred with paywall */}
          <div className="relative">
            {isPaywallActive ? (
              <div className="relative">
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <Lock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500 font-medium">Название скрыто</p>
                  </div>
                </div>
                <div className="blur-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    ████████████
                  </h3>
                  <p className="text-sm text-gray-500">
                    ████████████
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1" title={displayName}>
                  {displayName}
                </h3>
                {factory.legal_name_en && factory.legal_name_cn !== factory.legal_name_en && (
                  <p className="text-sm text-gray-500" title={factory.legal_name_cn}>
                    {factory.legal_name_cn}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-primary" />
            <span>
              {factory.city}{factory.province ? `, ${factory.province}` : ''}
            </span>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            {/* WeChat ID */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span className="font-medium">WeChat:</span>
              <span className="font-mono text-primary">{factory.wechat_id}</span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Телефон:</span>
              <span className="font-mono">{factory.phone}</span>
            </div>

            {/* Email - показываем только если есть */}
            {factory.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-red-500" />
                <span className="font-medium">Email:</span>
                <span className="font-mono text-primary">{factory.email}</span>
              </div>
            )}

            {/* Website - показываем только если есть */}
            {factory.website && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="w-4 h-4 text-purple-500" />
                <span className="font-medium">Сайт:</span>
                <span className="font-mono text-primary">{factory.website}</span>
              </div>
            )}

            {/* Address */}
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <span className="font-medium">Адрес:</span>
              <span className="text-gray-700">{factory.address_cn}</span>
            </div>
          </div>

          {/* Factura Rating */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Рейтинг Factura:</span>
              {renderStarRating(facturaRating)}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{completedDeals} сделок</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>{reviewCount} отзывов</span>
              </div>
            </div>
          </div>

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
            {factory.specialization && factory.specialization.slice(1, 2).map((spec, index) => (
              <Badge
                key={`spec-${index}`}
                variant="secondary"
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700"
              >
                {spec}
              </Badge>
            ))}
          </div>

          {/* Production Details */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-gray-50 rounded-lg py-3 px-2">
              <Package className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-gray-500 mb-1">MOQ</p>
              <p className="text-sm font-medium text-gray-900">{formatMOQ(factory.moq_units)}</p>
            </div>
            <div className="text-center bg-gray-50 rounded-lg py-3 px-2">
              <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-gray-500 mb-1">Срок</p>
              <p className="text-sm font-medium text-gray-900">{formatLeadTime(factory.lead_time_days)}</p>
            </div>
            <div className="text-center bg-gray-50 rounded-lg py-3 px-2">
              <Users className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-gray-500 mb-1">Мощность</p>
              <p className="text-sm font-medium text-gray-900">{formatCapacity(factory.capacity_month)}</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            className="flex-1 text-sm hover:bg-gray-50 border-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(factory.factory_id);
            }}
          >
            Подробнее
          </Button>
          <Button
            className="flex-1 text-sm bg-primary hover:bg-primary/90 gradient-factura"
            onClick={(e) => {
              e.stopPropagation();
              onChat?.(factory.factory_id);
            }}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            RFQ
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}