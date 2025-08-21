'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { RFQForm } from '@/components/rfq/rfq-form';
import { supabase } from '@/lib/supabase';
import { RFQ } from '@/types/rfq';

export default function EditRFQPage() {
  const params = useParams();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;

      try {
        // Загружаем RFQ
        const { data: rfqData, error: rfqError } = await supabase
          .from('rfqs')
          .select(`
            *,
            category:categories(id, name, slug)
          `)
          .eq('id', params.id)
          .single();

        if (rfqError) throw rfqError;

        // Проверяем, что RFQ в статусе черновика
        if (rfqData.status !== 'draft') {
          setError('Можно редактировать только черновики RFQ');
          setLoading(false);
          return;
        }

        setRfq(rfqData);

        // Загружаем категории
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка</h3>
          <p className="text-gray-500">{error || 'RFQ не найден'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RFQForm rfq={rfq} categories={categories} />
    </div>
  );
}
