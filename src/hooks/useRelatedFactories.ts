'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Factory } from '../types/factory';

interface UseRelatedFactoriesOptions {
  currentFactoryId: string;
  category: string;
  city?: string;
  segment?: string;
  limit?: number;
}

interface UseRelatedFactoriesReturn {
  factories: Factory[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRelatedFactories(options: UseRelatedFactoriesOptions): UseRelatedFactoriesReturn {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    currentFactoryId,
    category,
    city,
    segment,
    limit = 6
  } = options;

  const fetchRelatedFactories = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('factories')
        .select('*')
        .neq('factory_id', currentFactoryId) // Исключаем текущую фабрику
        .contains('specialization', [category]) // Фильтруем по категории
        .limit(limit);

      // Добавляем дополнительные фильтры для лучшего соответствия
      if (city) {
        query = query.eq('city', city);
      }

      if (segment) {
        query = query.eq('segment', segment);
      }

      // Сортируем по рейтингу (лучшие сначала)
      query = query.order('rating', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Преобразуем данные в нужный формат
      const formattedFactories: Factory[] = (data || []).map((factory: any) => ({
        factory_id: factory.factory_id,
        legal_name_cn: factory.legal_name_cn,
        legal_name_en: factory.legal_name_en,
        city: factory.city,
        province: factory.province,
        segment: factory.segment,
        address_cn: factory.address_cn,
        lat_lng: factory.lat_lng,
        wechat_id: factory.wechat_id,
        phone: factory.phone,
        email: factory.email,
        moq_units: factory.moq_units,
        lead_time_days: factory.lead_time_days,
        capacity_month: factory.capacity_month,
        certifications: factory.certifications,
        interaction_level: factory.interaction_level,
        last_interaction_date: factory.last_interaction_date,
        avatar_url: factory.avatar_url,
        last_verified: factory.last_verified,
        created_at: factory.created_at,
        specialization: factory.specialization || [],
        rating: factory.rating,
        reviewCount: factory.review_count,
        verified: factory.verified
      }));

      setFactories(formattedFactories);

    } catch (err) {
      console.error('Ошибка при загрузке связанных фабрик:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке связанных фабрик');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentFactoryId && category) {
      fetchRelatedFactories();
    }
  }, [currentFactoryId, category, city, segment, limit]);

  const refetch = () => {
    fetchRelatedFactories();
  };

  return {
    factories,
    loading,
    error,
    refetch
  };
}
