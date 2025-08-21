import { Factory } from '@/types/factory';

// Интерфейс для контактной информации
export interface ContactInfo {
  wechat_id: string;
  phone: string;
  email?: string;
  website?: string;
  address_cn: string;
}

// Интерфейс для сертификаций
export interface Certifications {
  bsci?: boolean;
  iso9001?: boolean;
  iso14001?: boolean;
  oeko_tex?: boolean;
  gots?: boolean;
  [key: string]: any;
}

// Функция для преобразования сертификаций в строку
export function formatCertifications(certifications: Certifications | null): string {
  if (!certifications) return '';
  
  const activeCerts = Object.entries(certifications)
    .filter(([_, value]) => value === true)
    .map(([key, _]) => key.toUpperCase())
    .join('; ');
  
  return activeCerts;
}

// Функция для преобразования координат в строку
export function formatCoordinates(latLng: { lat: number; lng: number } | null): string {
  if (!latLng) return '';
  return `${latLng.lat}, ${latLng.lng}`;
}

// Функция для форматирования даты
export function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ru-RU');
}

// Функция для экспорта фабрик в CSV
export function exportFactoriesToCSV(factories: Factory[], includeContactInfo: boolean = true): string {
  // Определяем заголовки CSV
  const baseHeaders = [
    'ID фабрики',
    'Название (CN)',
    'Название (EN)',
    'Город',
    'Провинция',
    'Сегмент',
    'MOQ (шт)',
    'Срок поставки (дни)',
    'Производственная мощность (шт/мес)',
    'Сертификации',
    'Уровень взаимодействия',
    'Дата последнего взаимодействия',
    'Дата верификации',
    'Дата создания',
    'Координаты'
  ];

  const contactHeaders = [
    'WeChat ID',
    'Телефон',
    'Email',
    'Веб-сайт',
    'Адрес (CN)'
  ];

  const headers = includeContactInfo ? [...baseHeaders, ...contactHeaders] : baseHeaders;
  
  // Создаем строки данных
  const rows = factories.map(factory => {
    const baseData = [
      factory.factory_id,
      factory.legal_name_cn,
      factory.legal_name_en || '',
      factory.city,
      factory.province || '',
      factory.segment,
      factory.moq_units || '',
      factory.lead_time_days || '',
      factory.capacity_month || '',
      formatCertifications(factory.certifications),
      factory.interaction_level,
      formatDate(factory.last_interaction_date),
      formatDate(factory.last_verified),
      formatDate(factory.created_at),
      formatCoordinates(factory.lat_lng)
    ];

    const contactData = includeContactInfo ? [
      factory.wechat_id,
      factory.phone,
      factory.email || '',
      factory.website || '',
      factory.address_cn
    ] : [];

    return [...baseData, ...contactData];
  });

  // Создаем CSV контент
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
}

// Функция для экспорта только контактной информации
export function exportContactInfoToCSV(factories: Factory[]): string {
  const headers = [
    'ID фабрики',
    'Название (CN)',
    'Название (EN)',
    'WeChat ID',
    'Телефон',
    'Email',
    'Веб-сайт',
    'Адрес (CN)',
    'Город',
    'Провинция'
  ];

  const rows = factories.map(factory => [
    factory.factory_id,
    factory.legal_name_cn,
    factory.legal_name_en || '',
    factory.wechat_id,
    factory.phone,
    factory.email || '',
    factory.website || '',
    factory.address_cn,
    factory.city,
    factory.province || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
}

// Функция для скачивания CSV файла
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Очистка URL объекта
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }
}

// Функция для сохранения файла в папку exports (для серверной части)
export function saveCSVToFile(csvContent: string, filename: string): string {
  // В клиентской версии просто возвращаем путь
  // Серверная логика должна быть в API роуте
  return `/exports/${filename}`;
}

// Функция для экспорта статистики фабрик
export function exportFactoryStatsToCSV(factories: Factory[]): string {
  const stats = {
    total: factories.length,
    bySegment: {} as Record<string, number>,
    byCity: {} as Record<string, number>,
    byProvince: {} as Record<string, number>,
    withEmail: 0,
    withWebsite: 0,
    withCoordinates: 0,
    avgMOQ: 0,
    avgLeadTime: 0,
    avgCapacity: 0
  };

  let totalMOQ = 0;
  let totalLeadTime = 0;
  let totalCapacity = 0;
  let countMOQ = 0;
  let countLeadTime = 0;
  let countCapacity = 0;

  factories.forEach(factory => {
    // Подсчет по сегментам
    stats.bySegment[factory.segment] = (stats.bySegment[factory.segment] || 0) + 1;
    
    // Подсчет по городам
    stats.byCity[factory.city] = (stats.byCity[factory.city] || 0) + 1;
    
    // Подсчет по провинциям
    if (factory.province) {
      stats.byProvince[factory.province] = (stats.byProvince[factory.province] || 0) + 1;
    }
    
    // Подсчет контактной информации
    if (factory.email) stats.withEmail++;
    if (factory.website) stats.withWebsite++;
    if (factory.lat_lng) stats.withCoordinates++;
    
    // Подсчет средних значений
    if (factory.moq_units) {
      totalMOQ += factory.moq_units;
      countMOQ++;
    }
    if (factory.lead_time_days) {
      totalLeadTime += factory.lead_time_days;
      countLeadTime++;
    }
    if (factory.capacity_month) {
      totalCapacity += factory.capacity_month;
      countCapacity++;
    }
  });

  stats.avgMOQ = countMOQ > 0 ? Math.round(totalMOQ / countMOQ) : 0;
  stats.avgLeadTime = countLeadTime > 0 ? Math.round(totalLeadTime / countLeadTime) : 0;
  stats.avgCapacity = countCapacity > 0 ? Math.round(totalCapacity / countCapacity) : 0;

  const headers = [
    'Метрика',
    'Значение'
  ];

  const rows = [
    ['Общее количество фабрик', stats.total],
    ['Фабрики с email', stats.withEmail],
    ['Фабрики с веб-сайтом', stats.withWebsite],
    ['Фабрики с координатами', stats.withCoordinates],
    ['Средний MOQ', stats.avgMOQ],
    ['Средний срок поставки (дни)', stats.avgLeadTime],
    ['Средняя мощность (шт/мес)', stats.avgCapacity],
    ['', ''],
    ['Распределение по сегментам:', ''],
    ...Object.entries(stats.bySegment).map(([segment, count]) => [segment, count]),
    ['', ''],
    ['Распределение по городам:', ''],
    ...Object.entries(stats.byCity).map(([city, count]) => [city, count]),
    ['', ''],
    ['Распределение по провинциям:', ''],
    ...Object.entries(stats.byProvince).map(([province, count]) => [province, count])
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell)}"`).join(','))
  ].join('\n');

  return csvContent;
}
