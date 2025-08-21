import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Factory } from '../types/factory';

interface UseFactoriesOptions {
  searchTerm?: string;
  segment?: string;
  city?: string;
  specialization?: string;
  sortBy?: 'name' | 'rating' | 'date' | 'interaction';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface UseFactoriesReturn {
  factories: Factory[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => void;
}

export function useFactories(options: UseFactoriesOptions = {}): UseFactoriesReturn {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const {
    searchTerm = '',
    segment = '',
    city = '',
    specialization = '',
    sortBy = 'date',
    sortOrder = 'desc',
    limit = 10,
    offset = 0
  } = options;

  const fetchFactories = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('factories')
        .select('*', { count: 'exact' });

      // Применяем фильтры
      if (searchTerm) {
        query = query.or(`legal_name_cn.ilike.%${searchTerm}%,legal_name_en.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }

      if (segment && segment !== 'all') {
        query = query.eq('segment', segment);
      }

      if (city && city !== 'all') {
        query = query.eq('city', city);
      }

      if (specialization && specialization !== 'all') {
        // Поиск по специализации в JSON поле
        query = query.contains('specialization', [specialization]);
      }

      // Добавляем пагинацию
      query = query.range(offset, offset + limit - 1);

             // Применяем сортировку
       switch (sortBy) {
         case 'name':
           query = query.order('legal_name_en', { ascending: sortOrder === 'asc' });
           break;
         case 'rating':
           query = query.order('rating', { ascending: sortOrder === 'asc' });
           break;
         case 'interaction':
           query = query.order('interaction_level', { ascending: sortOrder === 'asc' });
           break;
         case 'date':
         default:
           query = query.order('created_at', { ascending: sortOrder === 'asc' });
           break;
       }

      const { data, error: fetchError, count } = await query;

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
      setTotalCount(count || 0);

    } catch (err) {
      console.error('Ошибка при загрузке фабрик:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке фабрик');
    } finally {
      setLoading(false);
    }
  };

     useEffect(() => {
     fetchFactories();
   }, [searchTerm, segment, city, specialization, sortBy, sortOrder, limit, offset]);

  const refetch = () => {
    fetchFactories();
  };

  return {
    factories,
    loading,
    error,
    totalCount,
    refetch
  };
}

// Хук для получения одной фабрики по ID
export function useFactory(factoryId: string) {
  const [factory, setFactory] = useState<Factory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFactory = async () => {
      if (!factoryId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('factories')
          .select('*')
          .eq('factory_id', factoryId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          const formattedFactory: Factory = {
            factory_id: data.factory_id,
            legal_name_cn: data.legal_name_cn,
            legal_name_en: data.legal_name_en,
            city: data.city,
            province: data.province,
            segment: data.segment,
            address_cn: data.address_cn,
            lat_lng: data.lat_lng,
            wechat_id: data.wechat_id,
            phone: data.phone,
            email: data.email,
            moq_units: data.moq_units,
            lead_time_days: data.lead_time_days,
            capacity_month: data.capacity_month,
            certifications: data.certifications,
            interaction_level: data.interaction_level,
            last_interaction_date: data.last_interaction_date,
            avatar_url: data.avatar_url,
            last_verified: data.last_verified,
            created_at: data.created_at,
            specialization: data.specialization || [],
            rating: data.rating,
            reviewCount: data.review_count,
            verified: data.verified
          };

          setFactory(formattedFactory);
        }

      } catch (err) {
        console.error('Ошибка при загрузке фабрики:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке фабрики');
      } finally {
        setLoading(false);
      }
    };

    fetchFactory();
  }, [factoryId]);

  return {
    factory,
    loading,
    error
  };
}
