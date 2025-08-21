'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Review } from '../components/ui/reviews-list';
import { ReviewFormData } from '../components/ui/review-form';

interface UseReviewsOptions {
  factoryId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  limit?: number;
  offset?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}

interface UseReviewsReturn {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useReviews(options: UseReviewsOptions = {}): UseReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    factoryId,
    status = 'approved',
    limit = 10,
    offset = 0,
    sortBy = 'newest'
  } = options;

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('reviews')
        .select('*', { count: 'exact' });

      if (factoryId) {
        query = query.eq('factory_id', factoryId);
      }

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest':
          query = query.order('rating', { ascending: false });
          break;
        case 'lowest':
          query = query.order('rating', { ascending: true });
          break;
        case 'helpful':
          query = query.order('helpful', { ascending: false });
          break;
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Transform data to Review format
      const formattedReviews: Review[] = (data || []).map((review: any) => ({
        id: review.id,
        factoryId: review.factory_id,
        userId: review.user_id,
        userName: review.user_name,
        userAvatar: review.user_avatar,
        rating: review.rating,
        title: review.title,
        content: review.content,
        pros: review.pros,
        cons: review.cons,
        experience: review.experience,
        status: review.status,
        helpful: review.helpful || 0,
        notHelpful: review.not_helpful || 0,
        createdAt: review.created_at,
        updatedAt: review.updated_at
      }));

      setReviews(formattedReviews);
      setTotalReviews(count || 0);

      // Calculate average rating and distribution
      if (factoryId && status === 'approved') {
        await fetchRatingStats(factoryId);
      }

    } catch (err) {
      console.error('Ошибка при загрузке отзывов:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке отзывов');
    } finally {
      setLoading(false);
    }
  };

  const fetchRatingStats = async (factoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('factory_id', factoryId)
        .eq('status', 'approved');

      if (error) throw error;

      const ratings = data?.map(r => r.rating) || [];
      
      // Calculate average
      const avg = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;
      
      setAverageRating(avg);

      // Calculate distribution
      const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach(rating => {
        distribution[rating] = (distribution[rating] || 0) + 1;
      });
      
      setRatingDistribution(distribution);

    } catch (err) {
      console.error('Ошибка при загрузке статистики рейтингов:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [factoryId, status, limit, offset, sortBy]);

  const refetch = () => {
    fetchReviews();
  };

  return {
    reviews,
    totalReviews,
    averageRating,
    ratingDistribution,
    loading,
    error,
    refetch
  };
}

// Hook for submitting reviews
export function useSubmitReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReview = async (factoryId: string, reviewData: ReviewFormData) => {
    try {
      setLoading(true);
      setError(null);

      const { error: submitError } = await supabase
        .from('reviews')
        .insert({
          factory_id: factoryId,
          user_id: 'current-user-id', // TODO: Get from auth context
          user_name: 'Пользователь', // TODO: Get from auth context
          rating: reviewData.rating,
          title: reviewData.title,
          content: reviewData.content,
          pros: reviewData.pros || null,
          cons: reviewData.cons || null,
          experience: reviewData.experience,
          status: 'pending',
          helpful: 0,
          not_helpful: 0
        });

      if (submitError) {
        throw submitError;
      }

      return { success: true };

    } catch (err) {
      console.error('Ошибка при отправке отзыва:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при отправке отзыва');
      return { success: false, error: err instanceof Error ? err.message : 'Произошла ошибка' };
    } finally {
      setLoading(false);
    }
  };

  return {
    submitReview,
    loading,
    error
  };
}

// Hook for review moderation
export function useReviewModeration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveReview = async (reviewId: string, moderatorNote?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          status: 'approved',
          moderator_note: moderatorNote,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (updateError) {
        throw updateError;
      }

      return { success: true };

    } catch (err) {
      console.error('Ошибка при одобрении отзыва:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при одобрении отзыва');
      return { success: false, error: err instanceof Error ? err.message : 'Произошла ошибка' };
    } finally {
      setLoading(false);
    }
  };

  const rejectReview = async (reviewId: string, reason: string, moderatorNote?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          moderator_note: moderatorNote,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (updateError) {
        throw updateError;
      }

      return { success: true };

    } catch (err) {
      console.error('Ошибка при отклонении отзыва:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при отклонении отзыва');
      return { success: false, error: err instanceof Error ? err.message : 'Произошла ошибка' };
    } finally {
      setLoading(false);
    }
  };

  const flagReview = async (reviewId: string, reason: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          flagged: true,
          flag_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (updateError) {
        throw updateError;
      }

      return { success: true };

    } catch (err) {
      console.error('Ошибка при пометке отзыва:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при пометке отзыва');
      return { success: false, error: err instanceof Error ? err.message : 'Произошла ошибка' };
    } finally {
      setLoading(false);
    }
  };

  return {
    approveReview,
    rejectReview,
    flagReview,
    loading,
    error
  };
}

// Hook for helpful votes
export function useHelpfulVote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voteHelpful = async (reviewId: string, helpful: boolean) => {
    try {
      setLoading(true);
      setError(null);

      const field = helpful ? 'helpful' : 'not_helpful';
      
      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          [field]: supabase.rpc('increment', { row_id: reviewId, field_name: field })
        })
        .eq('id', reviewId);

      if (updateError) {
        throw updateError;
      }

      return { success: true };

    } catch (err) {
      console.error('Ошибка при голосовании:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при голосовании');
      return { success: false, error: err instanceof Error ? err.message : 'Произошла ошибка' };
    } finally {
      setLoading(false);
    }
  };

  return {
    voteHelpful,
    loading,
    error
  };
}


