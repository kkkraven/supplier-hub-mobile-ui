'use client';

import React, { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { Button } from './button';
import { Textarea } from './textarea';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { RatingStars } from './rating-stars';
import { Badge } from './badge';

export interface ReviewFormData {
  rating: number;
  title: string;
  content: string;
  pros: string;
  cons: string;
  experience: 'positive' | 'neutral' | 'negative';
}

interface ReviewFormProps {
  factoryId: string;
  factoryName: string;
  onSubmit: (data: ReviewFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}

const EXPERIENCE_OPTIONS = [
  { value: 'positive', label: 'Положительный', color: 'bg-green-100 text-green-800' },
  { value: 'neutral', label: 'Нейтральный', color: 'bg-gray-100 text-gray-800' },
  { value: 'negative', label: 'Отрицательный', color: 'bg-red-100 text-red-800' }
];

export function ReviewForm({
  factoryId,
  factoryName,
  onSubmit,
  onCancel,
  loading = false,
  className = ''
}: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    content: '',
    pros: '',
    cons: '',
    experience: 'positive'
  });

  const [errors, setErrors] = useState<Partial<ReviewFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ReviewFormData> = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Пожалуйста, поставьте оценку';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Заголовок обязателен';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Заголовок должен содержать минимум 5 символов';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Отзыв обязателен';
    } else if (formData.content.length < 20) {
      newErrors.content = 'Отзыв должен содержать минимум 20 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: undefined }));
    }
  };

  const handleInputChange = (field: keyof ReviewFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleExperienceChange = (experience: ReviewFormData['experience']) => {
    setFormData(prev => ({ ...prev, experience }));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Написать отзыв</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Оставьте отзыв о фабрике "{factoryName}"
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Ваша оценка *</Label>
            <RatingStars
              rating={formData.rating}
              interactive={true}
              onRatingChange={handleRatingChange}
              size="lg"
              showValue={true}
            />
            {errors.rating && (
              <p className="text-sm text-red-600">{errors.rating}</p>
            )}
          </div>

          {/* Experience Type */}
          <div className="space-y-2">
            <Label>Тип опыта</Label>
            <div className="flex gap-2">
              {EXPERIENCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleExperienceChange(option.value as ReviewFormData['experience'])}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    formData.experience === option.value
                      ? option.color
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок отзыва *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Кратко опишите ваш опыт"
              maxLength={100}
              disabled={loading}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
            <p className="text-xs text-gray-500">
              {formData.title.length}/100 символов
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Подробный отзыв *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Расскажите подробно о вашем опыте работы с фабрикой..."
              rows={4}
              maxLength={1000}
              disabled={loading}
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content}</p>
            )}
            <p className="text-xs text-gray-500">
              {formData.content.length}/1000 символов
            </p>
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pros">Достоинства</Label>
              <Textarea
                id="pros"
                value={formData.pros}
                onChange={(e) => handleInputChange('pros', e.target.value)}
                placeholder="Что понравилось..."
                rows={3}
                maxLength={300}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                {formData.pros.length}/300 символов
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cons">Недостатки</Label>
              <Textarea
                id="cons"
                value={formData.cons}
                onChange={(e) => handleInputChange('cons', e.target.value)}
                placeholder="Что можно улучшить..."
                rows={3}
                maxLength={300}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                {formData.cons.length}/300 символов
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || formData.rating === 0}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Отправить отзыв
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


