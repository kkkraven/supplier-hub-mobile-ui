'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { RFQDetail } from '@/components/rfq/rfq-detail';
import { supabase } from '@/lib/supabase';
import { RFQ } from '@/types/rfq';

export default function RFQDetailPage() {
  const params = useParams();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRFQ = async () => {
      if (!params.id) return;

      try {
        const { data, error } = await supabase
          .from('rfqs')
          .select(`
            *,
            category:categories(id, name, slug)
          `)
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setRfq(data);
      } catch (err) {
        console.error('Ошибка при загрузке RFQ:', err);
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке RFQ');
      } finally {
        setLoading(false);
      }
    };

    fetchRFQ();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-24 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-64"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">RFQ не найден</h3>
          <p className="text-gray-500">{error || 'Запрашиваемый RFQ не существует'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RFQDetail rfq={rfq} />
    </div>
  );
}
