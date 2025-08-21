export type FactorySegment = 'low' | 'mid' | 'mid+' | 'high';
export type InteractionLevel = 0 | 1 | 2 | 3;

export interface Factory {
  factory_id: string;
  legal_name_cn: string;
  legal_name_en?: string;
  city: string;
  province?: string;
  segment: FactorySegment;
  address_cn: string;
  lat_lng?: {
    lat: number;
    lng: number;
  };
  wechat_id: string;
  phone: string;
  email?: string;
  website?: string;
  moq_units?: number;
  lead_time_days?: number;
  capacity_month?: number;
  certifications?: {
    bsci?: boolean;
    iso9001?: boolean;
    iso14001?: boolean;
    oeko_tex?: boolean;
    gots?: boolean;
    [key: string]: any;
  };
  interaction_level: InteractionLevel;
  last_interaction_date?: string;
  avatar_url?: string;
  last_verified?: string;
  created_at: string;
  
  // Вычисляемые поля для UI
  rating?: number;
  reviewCount?: number;
  specialization?: string[];
  verified?: boolean;
}

export const SEGMENT_LABELS: Record<FactorySegment, string> = {
  low: 'Базовый',
  mid: 'Средний',
  'mid+': 'Средний+',
  high: 'Премиум'
};

export const INTERACTION_LEVEL_LABELS: Record<InteractionLevel, string> = {
  0: 'Нет взаимодействия',
  1: 'Одно взаимодействие',
  2: 'Несколько раз',
  3: 'Активное сотрудничество'
};

export const SEGMENT_COLORS: Record<FactorySegment, string> = {
  low: 'bg-gray-100 text-gray-700',
  mid: 'bg-blue-100 text-blue-700',
  'mid+': 'bg-purple-100 text-purple-700',
  high: 'bg-yellow-100 text-yellow-700'
};