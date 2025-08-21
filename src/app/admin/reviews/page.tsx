"use client";

import { ReviewModeration } from "../../../components/ui/review-moderation";
import { useReviews, useReviewModeration } from "../../../hooks/useReviews";
import { LoadingSpinner } from "../../../components/ui/loading-spinner";

export default function ReviewsModerationPage() {
  const { reviews, loading, error, refetch } = useReviews({
    status: 'pending',
    limit: 50,
    sortBy: 'newest'
  });

  const { approveReview, rejectReview, flagReview, loading: moderationLoading } = useReviewModeration();

  const handleApprove = async (reviewId: string, moderatorNote?: string) => {
    const result = await approveReview(reviewId, moderatorNote);
    if (result.success) {
      refetch();
    }
  };

  const handleReject = async (reviewId: string, reason: string, moderatorNote?: string) => {
    const result = await rejectReview(reviewId, reason, moderatorNote);
    if (result.success) {
      refetch();
    }
  };

  const handleFlag = async (reviewId: string, reason: string) => {
    const result = await flagReview(reviewId, reason);
    if (result.success) {
      refetch();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Загрузка отзывов для модерации..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ошибка загрузки</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReviewModeration
          reviews={reviews}
          onApprove={handleApprove}
          onReject={handleReject}
          onFlag={handleFlag}
          loading={moderationLoading}
        />
      </div>
    </div>
  );
}


