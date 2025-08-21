export type RFQStatus = 'draft' | 'sent' | 'quoted' | 'closed';
export type RFQPriority = 'low' | 'medium' | 'high';

export interface RFQ {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string;
  quantity: number;
  deadline: string;
  status: RFQStatus;
  priority: RFQPriority;
  created_at: string;
  updated_at: string;
  
  // Связанные данные
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  user?: {
    id: string;
    full_name: string;
    company_name: string;
  };
  attachments?: RFQAttachment[];
  quotes?: RFQQuote[];
  sent_factories?: RFQSentFactory[];
}

export interface RFQAttachment {
  id: string;
  rfq_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

export interface RFQQuote {
  id: string;
  rfq_id: string;
  factory_id: string;
  price: number;
  currency: string;
  lead_time_days: number;
  moq_units: number;
  description: string;
  terms_conditions?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;

  // Связанные данные
  factory?: {
    id: string;
    legal_name_cn: string;
    legal_name_en?: string;
    city: string;
    segment: string;
    email: string;
    contact_person: string;
  };
}

// Новые типы для отправки RFQ
export interface RFQSentFactory {
  id: string;
  rfq_id: string;
  factory_id: string;
  sent_at: string;
  status: 'sent' | 'delivered' | 'read' | 'error';
  email: string;
  error_message?: string;
  
  // Связанные данные
  factory?: {
    id: string;
    legal_name_cn: string;
    legal_name_en?: string;
    city: string;
    segment: string;
    email: string;
    contact_person: string;
  };
}

export interface RFQEmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface FactorySelection {
  factory_id: string;
  selected: boolean;
  factory: {
    id: string;
    legal_name_cn: string;
    legal_name_en?: string;
    city: string;
    segment: string;
    email: string;
    contact_person: string;
    categories: string[];
  };
}

export const RFQ_STATUS_LABELS: Record<RFQStatus, string> = {
  draft: 'Черновик',
  sent: 'Отправлено',
  quoted: 'Получены предложения',
  closed: 'Закрыто'
};

export const RFQ_PRIORITY_LABELS: Record<RFQPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий'
};

export const RFQ_PRIORITY_COLORS: Record<RFQPriority, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700'
};

export const RFQ_STATUS_COLORS: Record<RFQStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  quoted: 'bg-purple-100 text-purple-700',
  closed: 'bg-gray-100 text-gray-500'
};

export const SENT_STATUS_LABELS: Record<RFQSentFactory['status'], string> = {
  sent: 'Отправлено',
  delivered: 'Доставлено',
  read: 'Прочитано',
  error: 'Ошибка'
};

export const SENT_STATUS_COLORS: Record<RFQSentFactory['status'], string> = {
  sent: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  read: 'bg-purple-100 text-purple-700',
  error: 'bg-red-100 text-red-700'
};

export const QUOTE_STATUS_LABELS: Record<RFQQuote['status'], string> = {
  pending: 'Ожидает рассмотрения',
  accepted: 'Принято',
  rejected: 'Отклонено'
};

export const QUOTE_STATUS_COLORS: Record<RFQQuote['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700'
};
