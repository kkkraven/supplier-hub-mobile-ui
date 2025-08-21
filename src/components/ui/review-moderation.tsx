'use client';

import React, { useState } from 'react';
import { Check, X, AlertTriangle, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Textarea } from './textarea';
import { Label } from './label';
import { RatingStars } from './rating-stars';
import { Review } from './reviews-list';

interface ReviewModerationProps {
  reviews: Review[];
  onApprove: (reviewId: string, moderatorNote?: string) => void;
  onReject: (reviewId: string, reason: string, moderatorNote?: string) => void;
  onFlag: (reviewId: string, reason: string) => void;
  loading?: boolean;
  className?: string;
}

const REJECTION_REASONS = [
  'Спам или реклама',
  'Оскорбления или нецензурная лексика',
  'Ложная информация',
  'Дублирование отзыва',
  'Не соответствует теме',
  'Другое'
];

const FLAG_REASONS = [
  'Подозрительный отзыв',
  'Возможный спам',
  'Неточная информация',
  'Нарушение правил',
  'Другое'
];

export function ReviewModeration({
  reviews,
  onApprove,
  onReject,
  onFlag,
  loading = false,
  className = ''
}: ReviewModerationProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [moderatorNote, setModeratorNote] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);

  const pendingReviews = reviews.filter(review => review.status === 'pending');

  const handleApprove = (reviewId: string) => {
    onApprove(reviewId, moderatorNote);
    setSelectedReview(null);
    setModeratorNote('');
  };

  const handleReject = (reviewId: string) => {
    if (rejectionReason) {
      onReject(reviewId, rejectionReason, moderatorNote);
      setShowRejectDialog(false);
      setRejectionReason('');
      setModeratorNote('');
    }
  };

  const handleFlag = (reviewId: string) => {
    if (flagReason) {
      onFlag(reviewId, flagReason);
      setShowFlagDialog(false);
      setFlagReason('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">На модерации</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Одобрен</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Отклонен</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Модерация отзывов</h2>
        </div>
        <Badge variant="outline">
          {pendingReviews.length} на модерации
        </Badge>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {pendingReviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Все отзывы обработаны</h3>
              <p className="text-gray-600">Нет отзывов, ожидающих модерации</p>
            </CardContent>
          </Card>
        ) : (
          pendingReviews.map((review) => (
            <Card key={review.id} className="border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{review.title}</h3>
                    <p className="text-sm text-gray-600">
                      {review.userName} • {formatDate(review.createdAt)}
                    </p>
                  </div>
                  {getStatusBadge(review.status)}
                </div>

                {/* Rating */}
                <div className="mb-4">
                  <RatingStars rating={review.rating} size="sm" showValue={true} />
                </div>

                {/* Review Content */}
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">{review.content}</p>
                </div>

                {/* Pros and Cons */}
                {(review.pros || review.cons) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {review.pros && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h5 className="font-medium text-green-800 mb-1">Достоинства</h5>
                        <p className="text-sm text-green-700">{review.pros}</p>
                      </div>
                    )}
                    {review.cons && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <h5 className="font-medium text-red-800 mb-1">Недостатки</h5>
                        <p className="text-sm text-red-700">{review.cons}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Moderation Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => handleApprove(review.id)}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Одобрить
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedReview(review);
                      setShowRejectDialog(true);
                    }}
                    disabled={loading}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Отклонить
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedReview(review);
                      setShowFlagDialog(true);
                    }}
                    disabled={loading}
                    className="flex-1"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Флаг
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Отклонить отзыв</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Причина отклонения *</Label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md mt-1"
                >
                  <option value="">Выберите причину</option>
                  {REJECTION_REASONS.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label>Примечание модератора</Label>
                <Textarea
                  value={moderatorNote}
                  onChange={(e) => setModeratorNote(e.target.value)}
                  placeholder="Дополнительные комментарии..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => handleReject(selectedReview.id)}
                  disabled={!rejectionReason || loading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Отклонить
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Flag Dialog */}
      {showFlagDialog && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Пометить отзыв</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Причина пометки *</Label>
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md mt-1"
                >
                  <option value="">Выберите причину</option>
                  {FLAG_REASONS.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => handleFlag(selectedReview.id)}
                  disabled={!flagReason || loading}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                >
                  Пометить
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFlagDialog(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


