import React from 'react';
import { Card, CardContent, CardFooter } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Factory, SEGMENT_LABELS, SEGMENT_COLORS } from '../../types/factory';
import { InteractionStatusBadge } from './interaction-status-badge';
import { ContactInfo } from './contact-info';
import { FactoryStats } from './factory-stats';
import { 
  MapPin, 
  Star, 
  Shield, 
  Award, 
  Lock, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  Users,
  Package,
  Clock
} from 'lucide-react';

interface EnhancedFactoryCardProps {
  factory: Factory;
  onClick?: (factoryId: string) => void;
  onChat?: (factoryId: string) => void;
  className?: string;
  isPaywallActive?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export function EnhancedFactoryCard({
  factory,
  onClick,
  onChat,
  className,
  isPaywallActive = true,
  variant = 'default'
}: EnhancedFactoryCardProps) {
  const displayName = factory.legal_name_en || factory.legal_name_cn;
  const isVerified = factory.last_verified && 
    new Date(factory.last_verified) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

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

  // Фиктивные данные для демонстрации
  const facturaRating = 4.2 + Math.random() * 0.8; // 4.2-5.0
  const completedDeals = Math.floor(Math.random() * 25) + 5; // 5-30
  const reviewCount = Math.floor(Math.random() * 50) + 10; // 10-60

  const renderCompactCard = () => (
    <Card
      className={`w-full cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}
      onClick={() => onClick?.(factory.factory_id)}
    >
      {/* Header Image */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
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
        
        {/* Interaction level */}
        <div className="absolute top-2 right-2">
          <InteractionStatusBadge 
            level={factory.interaction_level}
            lastInteractionDate={factory.last_interaction_date}
            className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-md"
          />
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Factory Name */}
          <div className="relative">
            {isPaywallActive ? (
              <div className="relative">
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <Lock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500 font-medium">Название скрыто</p>
                  </div>
                </div>
                <div className="blur-sm">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    ████████████
                  </h3>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1" title={displayName}>
                  {displayName}
                </h3>
                {factory.legal_name_en && factory.legal_name_cn !== factory.legal_name_en && (
                  <p className="text-xs text-gray-500" title={factory.legal_name_cn}>
                    {factory.legal_name_cn}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-3 h-3 text-primary" />
            <span>
              {factory.city}{factory.province ? `, ${factory.province}` : ''}
            </span>
          </div>

          {/* Contact Information - Compact */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MessageSquare className="w-3 h-3 text-green-500" />
              <span className="font-mono text-primary">{factory.wechat_id}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Package className="w-3 h-3 text-blue-500" />
              <span>MOQ: {factory.moq_units ? `${factory.moq_units} шт` : 'По запросу'}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span>{facturaRating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{completedDeals} сделок</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs hover:bg-gray-50 border-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(factory.factory_id);
            }}
          >
            Подробнее
          </Button>
          <Button
            size="sm"
            className="flex-1 text-xs bg-primary hover:bg-primary/90"
            onClick={(e) => {
              e.stopPropagation();
              onChat?.(factory.factory_id);
            }}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            RFQ
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  const renderDetailedCard = () => (
    <Card
      className={`w-full cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}
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
          <InteractionStatusBadge 
            level={factory.interaction_level}
            lastInteractionDate={factory.last_interaction_date}
            className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md"
          />
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
          {/* Factory Name */}
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
          <ContactInfo
            wechatId={factory.wechat_id}
            phone={factory.phone}
            email={factory.email}
            website={factory.website}
            address={factory.address_cn}
            compact={true}
            showCopyButtons={false}
          />

          {/* Factory Stats */}
          <FactoryStats
            rating={facturaRating}
            reviewCount={reviewCount}
            deals={completedDeals}
            moq={factory.moq_units}
            leadTime={factory.lead_time_days}
            capacity={factory.capacity_month}
            certifications={getCertificationBadges()}
            verified={isVerified}
            compact={true}
          />

          {/* Specializations */}
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

  // Выбираем вариант отображения
  if (variant === 'compact') {
    return renderCompactCard();
  }

  if (variant === 'detailed') {
    return renderDetailedCard();
  }

  // По умолчанию возвращаем детальную карточку
  return renderDetailedCard();
}
