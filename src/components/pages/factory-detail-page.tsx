'use client';

import React, { useState } from 'react';
import { ArrowLeft, MapPin, Phone, Mail, MessageSquare, Star, Clock, Users, Package, Shield, Award, Calendar, Globe, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { LoadingSpinner } from '../ui/loading-spinner';
import { FactoryMap } from '../ui/factory-map';
import { FactoryGallery } from '../ui/factory-gallery';
import { RelatedFactories } from '../ui/related-factories';
import { ReviewsList } from '../ui/reviews-list';
import { ReviewForm } from '../ui/review-form';
import { useFactory } from '../../hooks/useFactories';
import { useRelatedFactories } from '../../hooks/useRelatedFactories';
import { useReviews, useSubmitReview, useHelpfulVote } from '../../hooks/useReviews';
import { SEGMENT_LABELS, SEGMENT_COLORS, INTERACTION_LEVEL_LABELS } from '../../types/factory';
import { useRouter } from 'next/navigation';
import { InteractionStatusBadge } from '../ui/interaction-status-badge';
import { ContactInfo } from '../ui/contact-info';
import { FactoryStats } from '../ui/factory-stats';

interface FactoryDetailPageProps {
  factoryId: string;
}

export function FactoryDetailPage({ factoryId }: FactoryDetailPageProps) {
  const router = useRouter();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { factory, loading, error } = useFactory(factoryId);

  // Получаем связанные фабрики
  const { factories: relatedFactories, loading: relatedLoading } = useRelatedFactories({
    currentFactoryId: factoryId,
    category: factory?.specialization?.[0] || 'knit', // Используем первую специализацию
    city: factory?.city,
    segment: factory?.segment,
    limit: 3
  });

  // Получаем отзывы
  const { 
    reviews, 
    totalReviews, 
    averageRating, 
    ratingDistribution, 
    loading: reviewsLoading,
    refetch: refetchReviews 
  } = useReviews({
    factoryId,
    status: 'approved',
    limit: 10,
    sortBy: 'newest'
  });

  // Хуки для работы с отзывами
  const { submitReview, loading: submitLoading } = useSubmitReview();
  const { voteHelpful, loading: voteLoading } = useHelpfulVote();

  // Галерея фотографий (моковые данные)
  const galleryImages = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1558618187-fcd80c1cd201?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&h=600&fit=crop&auto=format'
  ];

  const handleNavigate = () => {
    router.push('/factories');
  };

  const handleFactoryChat = () => {
    console.log('Start chat with factory:', factoryId);
  };

  const handleSubmitReview = async (reviewData: any) => {
    const result = await submitReview(factoryId, reviewData);
    if (result.success) {
      setShowReviewForm(false);
      refetchReviews();
    }
  };

  const handleHelpfulClick = async (reviewId: string, helpful: boolean) => {
    await voteHelpful(reviewId, helpful);
    refetchReviews();
  };

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
    if (!factory?.certifications) return [];
    const badges = [];
    
    if (factory.certifications.bsci) badges.push('BSCI');
    if (factory.certifications.iso9001) badges.push('ISO9001');
    if (factory.certifications.iso14001) badges.push('ISO14001');
    if (factory.certifications.gots) badges.push('GOTS');
    if (factory.certifications.oeko_tex) badges.push('Oeko-Tex');
    
    return badges;
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-lg font-medium text-gray-700 ml-2">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Загрузка информации о фабрике..." />
      </div>
    );
  }

  if (error || !factory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <Shield className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Ошибка загрузки
          </h3>
          <p className="text-red-600 mb-4">
            {error || 'Фабрика не найдена'}
          </p>
          <Button onClick={handleNavigate}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  const displayName = factory.legal_name_en || factory.legal_name_cn;
  const isVerified = factory.last_verified && 
    new Date(factory.last_verified) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={handleNavigate}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {isVerified && (
                  <Badge className="bg-success text-white">
                    <Shield className="w-4 h-4 mr-1" />
                    Verified by Factura
                  </Badge>
                )}
                <Badge className={SEGMENT_COLORS[factory.segment]}>
                  {SEGMENT_LABELS[factory.segment]}
                </Badge>
                <InteractionStatusBadge 
                  level={factory.interaction_level}
                  lastInteractionDate={factory.last_interaction_date}
                />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {displayName}
              </h1>
              
              {factory.legal_name_en && factory.legal_name_cn !== factory.legal_name_en && (
                <p className="text-lg text-gray-600 mb-4">
                  {factory.legal_name_cn}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-lg">
                  {factory.city}{factory.province ? `, ${factory.province}` : ''}
                </span>
              </div>
              
              <div className="flex items-center gap-6 mb-6">
                {renderStarRating(averageRating || factory.rating || 4.5)}
                <div className="text-gray-600">
                  <span className="font-medium">{totalReviews || factory.reviewCount || 25}</span> отзывов
                </div>
              </div>
            </div>
            
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleFactoryChat}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Начать чат
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowReviewForm(true)}
                >
                  <Star className="w-5 h-5 mr-2" />
                  Написать отзыв
                </Button>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 gradient-factura"
                  onClick={handleFactoryChat}
                >
                  Отправить RFQ
                </Button>
              </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Gallery and Info */}
            <div className="lg:col-span-2 space-y-8">
               {/* Gallery */}
               <Card>
                 <CardContent className="p-6">
                   <FactoryGallery images={galleryImages} />
                 </CardContent>
               </Card>

              {/* Tabs */}
              <Card>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Обзор</TabsTrigger>
                    <TabsTrigger value="production">Производство</TabsTrigger>
                    <TabsTrigger value="certifications">Сертификации</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">О фабрике</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {factory.specialization?.join(', ') || 'Текстильное производство'} - 
                        профессиональная фабрика с многолетним опытом в производстве качественной продукции. 
                        Мы специализируемся на создании инновационных решений для наших клиентов, 
                        обеспечивая высокое качество и своевременную доставку.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Специализация</h3>
                      <div className="flex flex-wrap gap-2">
                        {factory.specialization?.map((spec, index) => (
                          <Badge key={index} variant="secondary">
                            {spec}
                          </Badge>
                        )) || (
                          <Badge variant="secondary">Текстильное производство</Badge>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="production" className="space-y-6">
                    <FactoryStats
                      rating={averageRating || factory.rating || 4.5}
                      reviewCount={totalReviews || factory.reviewCount || 25}
                      deals={Math.floor(Math.random() * 25) + 5} // Фиктивные данные
                      moq={factory.moq_units}
                      leadTime={factory.lead_time_days}
                      capacity={factory.capacity_month}
                      certifications={getCertificationBadges()}
                      verified={factory.last_verified && new Date(factory.last_verified) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)}
                      compact={false}
                    />
                  </TabsContent>
                  
                  <TabsContent value="certifications" className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Сертификации и стандарты</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getCertificationBadges().map((cert, index) => (
                          <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <Award className="w-6 h-6 text-primary" />
                            <div>
                              <h4 className="font-semibold">{cert}</h4>
                              <p className="text-sm text-gray-600">Сертифицировано</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>

            {/* Right Column - Contact Info and Map */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Контактная информация</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContactInfo
                    wechatId={factory.wechat_id}
                    phone={factory.phone}
                    email={factory.email}
                    website={factory.website}
                    address={factory.address_cn}
                    showCopyButtons={true}
                    compact={false}
                  />
                  
                  <div className="pt-4 border-t">
                    <Button className="w-full" onClick={handleFactoryChat}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Начать чат
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Местоположение</CardTitle>
                </CardHeader>
                <CardContent>
                  <FactoryMap
                    lat={factory.lat_lng?.lat}
                    lng={factory.lat_lng?.lng}
                    city={factory.city}
                    province={factory.province}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {factory.city}{factory.province ? `, ${factory.province}` : ''}, Китай
                  </p>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Дополнительная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Дата верификации:</span>
                    <span className="font-medium">
                      {factory.last_verified ? new Date(factory.last_verified).toLocaleDateString('ru-RU') : 'Не верифицирована'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">В базе с:</span>
                    <span className="font-medium">
                      {new Date(factory.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  
                  {factory.last_interaction_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Последнее взаимодействие:</span>
                      <span className="font-medium">
                        {new Date(factory.last_interaction_date).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

        {/* Reviews Section */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ReviewsList
              reviews={reviews}
              totalReviews={totalReviews}
              averageRating={averageRating}
              ratingDistribution={ratingDistribution}
              onHelpfulClick={handleHelpfulClick}
              loading={reviewsLoading || voteLoading}
            />
          </div>
        </section>

        {/* Related Factories Section */}
        {relatedFactories.length > 0 && (
          <section className="py-8 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <RelatedFactories
                factories={relatedFactories}
                currentFactoryId={factoryId}
                category={factory?.specialization?.[0] || 'knit'}
                maxDisplay={3}
              />
            </div>
          </section>
        )}

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <ReviewForm
                factoryId={factoryId}
                factoryName={factory?.legal_name_en || factory?.legal_name_cn || 'Фабрика'}
                onSubmit={handleSubmitReview}
                onCancel={() => setShowReviewForm(false)}
                loading={submitLoading}
              />
            </div>
          </div>
        )}


    </div>
  );
}
