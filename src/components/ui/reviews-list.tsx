'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Calendar, User, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { RatingStars } from './rating-stars';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from './pagination';

export interface Review {
  id: string;
  factoryId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  pros?: string;
  cons?: string;
  experience: 'positive' | 'neutral' | 'negative';
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt?: string;
}

interface ReviewsListProps {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  onLoadMore?: () => void;
  onFilterChange?: (filter: string) => void;
  onSortChange?: (sort: string) => void;
  onHelpfulClick?: (reviewId: string, helpful: boolean) => void;
  loading?: boolean;
  className?: string;
}

const EXPERIENCE_COLORS = {
  positive: 'bg-green-100 text-green-800',
  neutral: 'bg-gray-100 text-gray-800',
  negative: 'bg-red-100 text-red-800'
};

const EXPERIENCE_LABELS = {
  positive: 'Положительный',
  neutral: 'Нейтральный',
  negative: 'Отрицательный'
};

export function ReviewsList({
  reviews,
  totalReviews,
  averageRating,
  ratingDistribution,
  onLoadMore,
  onFilterChange,
  onSortChange,
  onHelpfulClick,
  loading = false,
  className = ''
}: ReviewsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const itemsPerPage = 5;

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setCurrentPage(1);
    onFilterChange?.(value);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setCurrentPage(1);
    onSortChange?.(value);
  };

  const handleHelpfulClick = (reviewId: string, helpful: boolean) => {
    onHelpfulClick?.(reviewId, helpful);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingPercentage = (rating: number) => {
    const count = ratingDistribution[rating] || 0;
    return totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
  };

  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Отзывы ({totalReviews})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <RatingStars rating={averageRating} size="lg" showValue={false} />
              <p className="text-sm text-gray-600 mt-2">
                На основе {totalReviews} отзывов
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${getRatingPercentage(rating)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">
                    {ratingDistribution[rating] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все отзывы</SelectItem>
              <SelectItem value="positive">Положительные</SelectItem>
              <SelectItem value="neutral">Нейтральные</SelectItem>
              <SelectItem value="negative">Отрицательные</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <SortAsc className="w-4 h-4 text-gray-500" />
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Сначала новые</SelectItem>
              <SelectItem value="oldest">Сначала старые</SelectItem>
              <SelectItem value="highest">Высокий рейтинг</SelectItem>
              <SelectItem value="lowest">Низкий рейтинг</SelectItem>
              <SelectItem value="helpful">Полезные</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {currentReviews.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {review.userAvatar ? (
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>
                <Badge className={EXPERIENCE_COLORS[review.experience]}>
                  {EXPERIENCE_LABELS[review.experience]}
                </Badge>
              </div>

              {/* Rating and Title */}
              <div className="mb-3">
                <RatingStars rating={review.rating} size="sm" showValue={true} />
                <h3 className="font-semibold text-lg mt-2">{review.title}</h3>
              </div>

              {/* Review Content */}
              <p className="text-gray-700 leading-relaxed mb-4">{review.content}</p>

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

              {/* Helpful Buttons */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleHelpfulClick(review.id, true)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Полезно ({review.helpful})
                </button>
                <button
                  onClick={() => handleHelpfulClick(review.id, false)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Не полезно ({review.notHelpful})
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Load More Button */}
      {onLoadMore && reviews.length < totalReviews && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Загрузить еще отзывы'}
          </Button>
        </div>
      )}
    </div>
  );
}


