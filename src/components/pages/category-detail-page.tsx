import React, { useState, useMemo } from 'react';
import { ArrowLeft, Star, Users, Package, Award, CheckCircle, Clock, Shield, Zap, MapPin, Factory, Phone, MessageCircle, Filter, X, GitCompare, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

interface CategoryDetailPageProps {
  category: string;
  onNavigate?: (page: string, category?: string) => void;
}

interface Factory {
  id: string;
  name: string;
  city: string;
  specialization: string;
  moq: string;
  moqNumber: number;
  leadTime: string;
  leadTimeNumber: number;
  rating: number;
  deals: number;
  certifications: string[];
  image: string;
  description?: string;
  established?: number;
  employees?: string;
  capacity?: string;
}

export function CategoryDetailPage({ category, onNavigate }: CategoryDetailPageProps) {
  const [filters, setFilters] = useState({
    moqRange: 'all',
    leadTimeRange: 'all',
    certifications: [] as string[],
    rating: 'all',
  });
  
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompareSheet, setShowCompareSheet] = useState(false);

  const categoryData = {
    'knit': {
      name: 'Knit / Трикотаж',
      description: 'Специализированные фабрики по производству трикотажных изделий с современным оборудованием',
      hero: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200&h=400&fit=crop&auto=format&q=80',
      icon: '🧶',
      specifications: [
        'Кольцевая и карданная вязка',
        'Органические материалы GOTS',
        'MOQ от 300 штук',
        'Lead time 12-18 дней',
        'Печать и вышивка на производстве'
      ],
      examples: [
        {
          title: 'Базовые футболки',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop&auto=format&q=80',
          description: '100% органический хлопок, водные краски'
        },
        {
          title: 'Премиум худи',
          image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop&auto=format&q=80',
          description: 'French Terry, пуллеры YKK'
        },
        {
          title: 'Спортивные свитшоты',
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format&q=80',
          description: 'Moisture-wicking технологии'
        },
        {
          title: 'Детская одежда',
          image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&h=300&fit=crop&auto=format&q=80',
          description: 'Гипоаллергенные материалы'
        }
      ],
      factories: [
        {
          id: '1',
          name: 'MKIUJN Knitting Factory',
          city: '东莞 / Dongguan',
          specialization: 'Standard Knit',
          moq: '300 шт',
          moqNumber: 300,
          leadTime: '18 дней',
          leadTimeNumber: 18,
          rating: 4.7,
          deals: 35,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Средний/средний+ сегмент вязального трикотажа. Взаимодействовали много раз.',
          established: 2010,
          employees: '150-200',
          capacity: '40,000 шт/месяц'
        },
        {
          id: '2',
          name: 'DGCD Knitting Factory',
          city: '东莞 / Dongguan',
          specialization: 'Standard Knit',
          moq: '350 шт',
          moqNumber: 350,
          leadTime: '20 дней',
          leadTimeNumber: 20,
          rating: 4.6,
          deals: 28,
          certifications: ['BSCI', 'WRAP'],
          image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Средний/средний+ сегмент вязального трикотажа. Взаимодействовали много раз.',
          established: 2012,
          employees: '120-180',
          capacity: '35,000 шт/месяц'
        },
        {
          id: '3',
          name: 'GUOOU Knitting Factory',
          city: '东莞 / Dongguan',
          specialization: 'Premium Knit',
          moq: '250 шт',
          moqNumber: 250,
          leadTime: '22 дня',
          leadTimeNumber: 22,
          rating: 4.8,
          deals: 42,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1565096814242-6ac041c79620?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Средний+/премиум сегмент вязального трикотажа. Взаимодействовали один раз или более.',
          established: 2011,
          employees: '180-250',
          capacity: '45,000 шт/месяц'
        },
        {
          id: '4',
          name: '东莞市以利海通纺织有限公司 / Dongguan Yili Haitong Textile Co., Ltd.',
          city: '东莞 / Dongguan',
          specialization: 'Premium Knit',
          moq: '200 шт',
          moqNumber: 200,
          leadTime: '25 дней',
          leadTimeNumber: 25,
          rating: 4.9,
          deals: 55,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Средний+ сегмент вязального трикотажа. Взаимодействовали один раз или более.',
          established: 2009,
          employees: '200-300',
          capacity: '50,000 шт/месяц'
        },
        {
          id: '5',
          name: '诸暨袜业工厂 / Zhuji Socks Factory',
          city: '诸暨 / Zhuji',
          specialization: 'Socks & Hosiery',
          moq: '500 шт',
          moqNumber: 500,
          leadTime: '15 дней',
          leadTimeNumber: 15,
          rating: 4.7,
          deals: 38,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Средний+/премиум сегмент носков. Взаимодействовали два раза.',
          established: 2012,
          employees: '120-180',
          capacity: '25,000 шт/месяц'
        },
        {
          id: '6',
          name: '恒悦服饰有限公司 / Hengyue Garment Co., Ltd.',
          city: '东莞 / Dongguan',
          specialization: 'Premium Knit',
          moq: '200 шт',
          moqNumber: 200,
          leadTime: '22 дня',
          leadTimeNumber: 22,
          rating: 4.8,
          deals: 65,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Средний/средний+ сегмент трикотажа. Взаимодействовали много раз.',
          established: 2010,
          employees: '150-200',
          capacity: '40,000 шт/месяц'
        },
        {
          id: '7',
          name: '广东中山拓威服饰有限公司 / Guangdong Zhongshan Tuowei Garment Co., Ltd.',
          city: '中山 / Zhongshan',
          specialization: 'Standard Knit',
          moq: '120 шт',
          moqNumber: 120,
          leadTime: '18 дней',
          leadTimeNumber: 18,
          rating: 4.6,
          deals: 45,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1565096814242-6ac041c79620?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Средний сегмент трикотажа. От 120 шт один цвет.',
          established: 2012,
          employees: '100-150',
          capacity: '30,000 шт/месяц'
        }
      ]
        {
          id: '4',
          name: 'TechKnit Innovation',
          city: '深圳 / Shenzhen',
          specialization: 'Technical Knit',
          moq: '200 шт',
          moqNumber: 200,
          leadTime: '20 дней',
          leadTimeNumber: 20,
          rating: 4.6,
          deals: 28,
          certifications: ['OEKO-TEX', 'STANDARD 100'],
          image: 'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Инновационные технические ткани и материалы',
          established: 2018,
          employees: '80-120',
          capacity: '25,000 шт/месяц'
        },
        {
          id: '5',
          name: 'Classic Cotton Works',
          city: '青岛 / Qingdao',
          specialization: 'Cotton Knit',
          moq: '800 шт',
          moqNumber: 800,
          leadTime: '25 дней',
          leadTimeNumber: 25,
          rating: 4.5,
          deals: 52,
          certifications: ['BCI', 'GOTS'],
          image: 'https://images.unsplash.com/photo-1558618187-fcd80c1cd201?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Традиционное качество хлопкового трикотажа',
          established: 2005,
          employees: '300-400',
          capacity: '100,000 шт/месяц'
        }
      ]
    },
    'woven': {
      name: 'Woven / Ткань',
      description: 'Профессиональные производители тканой одежды с современными ткацкими станками',
      hero: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=1200&h=400&fit=crop&auto=format&q=80',
      icon: '🧵',
      specifications: [
        'Жаккардовое и саржевое плетение',
        'Eco-friendly красители',
        'MOQ от 200 штук',
        'Lead time 18-25 дней',
        'Сложная печать и отделка'
      ],
      examples: [
        {
          title: 'Классические рубашки',
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=300&fit=crop&auto=format&q=80',
          description: 'Премиум хлопок, точная посадка'
        },
        {
          title: 'Женские блузки',
          image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=300&fit=crop&auto=format&q=80',
          description: 'Шелковые и шифоновые ткани'
        }
      ],
      factories: [
        {
          id: '6',
          name: 'Imperial Weaving Co.',
          city: '苏州 / Suzhou',
          specialization: 'Luxury Woven',
          moq: '200 шт',
          moqNumber: 200,
          leadTime: '22 дня',
          leadTimeNumber: 22,
          rating: 4.9,
          deals: 89,
          certifications: ['OEKO-TEX', 'SEDEX'],
          image: 'https://images.unsplash.com/photo-1558618187-fcd80c1cd201?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Люксовые ткани с изысканной отделкой',
          established: 2010,
          employees: '250-350',
          capacity: '40,000 шт/месяц'
        },
        {
          id: '7',
          name: '丝路凤凰 / Silk Road Phoenix',
          city: '杭州 / Hangzhou (Linping)',
          specialization: 'Home Textile',
          moq: '250 шт',
          moqNumber: 250,
          leadTime: '25 дней',
          leadTimeNumber: 25,
          rating: 4.6,
          deals: 18,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Пижамы среднего качества. Домашний текстиль.',
          established: 2012,
          employees: '100-150',
          capacity: '20,000 шт/месяц'
        },
        {
          id: '8',
          name: '宁波市海曙成诺服饰有限公司 / Ningbo Haishu Chengnuo Garment Co., Ltd.',
          city: '宁波 / Ningbo',
          specialization: 'Fashion Garment',
          moq: '300 шт',
          moqNumber: 300,
          leadTime: '22 дня',
          leadTimeNumber: 22,
          rating: 4.7,
          deals: 25,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Средний сегмент женской/мужской одежды. Взаимодействуем.',
          established: 2011,
          employees: '150-200',
          capacity: '35,000 шт/месяц'
        },
        {
          id: '9',
          name: '郑州奥特制衣有限公司 / Zhengzhou Aote Garment Co., Ltd.',
          city: '郑州 / Zhengzhou',
          specialization: 'Premium Garment',
          moq: '200 шт',
          moqNumber: 200,
          leadTime: '28 дней',
          leadTimeNumber: 28,
          rating: 4.8,
          deals: 32,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Выше среднего сегмента женской/мужской одежды. Взаимодействуем.',
          established: 2010,
          employees: '200-250',
          capacity: '40,000 шт/месяц'
        }
      ]
    },
    'outerwear': {
      name: 'Outerwear / Верхняя одежда', 
      description: 'Технологичное производство верхней одежды с мембранами и современными утеплителями',
      hero: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1200&h=400&fit=crop&auto=format&q=80',
      icon: '🧥',
      specifications: [
        'Водонепроницаемые мембраны',
        'RDS сертификация пуха',
        'MOQ от 100 штук',
        'Lead time 25-35 дней',
        'Технические молнии и фурнитура'
      ],
      examples: [],
      factories: []
    },
    'denim': {
      name: 'Denim / Джинсовая одежда',
      description: 'Специализированные производители джинсовой одежды с eco-обработкой и vintage эффектами',
      hero: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200&h=400&fit=crop&auto=format&q=80',
      icon: '👖',
      specifications: [
        {
          name: 'MOQ',
          value: '200-400 шт',
          description: 'Минимальный заказ'
        },
        {
          name: 'Сроки',
          value: '18-25 дней',
          description: 'Время производства'
        },
        {
          name: 'Сертификации',
          value: 'BSCI, WRAP, OEKO-TEX',
          description: 'Международные стандарты'
        }
      ],
      examples: [
        {
          name: 'Джинсы',
          image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=200&fit=crop&auto=format&q=80'
        },
        {
          name: 'Джинсовые куртки',
          image: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=300&h=200&fit=crop&auto=format&q=80'
        },
        {
          name: 'Джинсовые юбки',
          image: 'https://images.unsplash.com/photo-1558618187-fcd80c1cd201?w=300&h=200&fit=crop&auto=format&q=80'
        }
      ],
      factories: [
        {
          id: '1',
          name: 'Vivian Chen Denim Factory',
          city: '新塘 / Xintang',
          specialization: 'Premium Denim',
          moq: '300 шт',
          moqNumber: 300,
          leadTime: '20 дней',
          leadTimeNumber: 20,
          rating: 4.7,
          deals: 25,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Средний+ сегмент джинсовой одежды. Взаимодействовали несколько раз.',
          established: 2010,
          employees: '150-200',
          capacity: '30,000 шт/месяц'
        },
        {
          id: '2',
          name: 'Kujie Lan Niu Denim',
          city: '新塘 / Xintang',
          specialization: 'Standard Denim',
          moq: '250 шт',
          moqNumber: 250,
          leadTime: '18 дней',
          leadTimeNumber: 18,
          rating: 4.6,
          deals: 18,
          certifications: ['BSCI', 'WRAP'],
          image: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Средний сегмент джинсовой одежды. Взаимодействовали несколько раз.',
          established: 2012,
          employees: '120-180',
          capacity: '25,000 шт/месяц'
        },
        {
          id: '3',
          name: 'Tan W Denim Factory',
          city: '中山 / Zhongshan',
          specialization: 'Premium Denim',
          moq: '200 шт',
          moqNumber: 200,
          leadTime: '22 дня',
          leadTimeNumber: 22,
          rating: 4.8,
          deals: 12,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1558618187-fcd80c1cd201?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Выше среднего сегмента джинсовой одежды. Взаимодействовали 1 раз.',
          established: 2011,
          employees: '180-250',
          capacity: '35,000 шт/месяц'
        },
        {
          id: '4',
          name: '尚帛服装 / Shangbo Garment',
          city: '佛山 / Foshan',
          specialization: 'Standard Denim',
          moq: '400 шт',
          moqNumber: 400,
          leadTime: '25 дней',
          leadTimeNumber: 25,
          rating: 4.5,
          deals: 8,
          certifications: ['BSCI', 'WRAP'],
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Средний сегмент джинсовой одежды. Не взаимодействовали.',
          established: 2009,
          employees: '200-300',
          capacity: '40,000 шт/месяц'
        },
        {
          id: '5',
          name: '栩驰制衣有限公司 / Xuchi Garment Co.',
          city: '佛山 / Foshan',
          specialization: 'Standard Denim',
          moq: '350 шт',
          moqNumber: 350,
          leadTime: '20 дней',
          leadTimeNumber: 20,
          rating: 4.7,
          deals: 15,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Средний сегмент джинсовой одежды. Взаимодействуем.',
          established: 2013,
          employees: '150-220',
          capacity: '30,000 шт/месяц'
        }
      ]
    },
    'activewear': {
      name: 'Activewear / Спортивная одежда',
      description: 'Высокотехнологичное производство спортивной одежды с функциональными тканями',
      hero: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=400&fit=crop&auto=format&q=80',
      icon: '🏃‍♀️',
      specifications: [
        {
          name: 'MOQ',
          value: '200-300 шт',
          description: 'Минимальный заказ'
        },
        {
          name: 'Сроки',
          value: '18-25 дней',
          description: 'Время производства'
        },
        {
          name: 'Сертификации',
          value: 'BSCI, WRAP, OEKO-TEX',
          description: 'Международные стандарты'
        }
      ],
      examples: [
        {
          name: 'Спортивные костюмы',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&auto=format&q=80'
        },
        {
          name: 'Фитнес одежда',
          image: 'https://images.unsplash.com/photo-1506629905565-4c2f0cab1d6e?w=300&h=200&fit=crop&auto=format&q=80'
        },
        {
          name: 'Техническая одежда',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&auto=format&q=80'
        }
      ],
      factories: [
        {
          id: '1',
          name: '金华市弗斯卡日用品有限公司 / Jinhua Fuskari Daily Products Co., Ltd.',
          city: '金华 / Jinhua',
          specialization: 'Sports Wear',
          moq: '300 шт',
          moqNumber: 300,
          leadTime: '20 дней',
          leadTimeNumber: 20,
          rating: 4.6,
          deals: 28,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Средний сегмент спортивной одежды. Взаимодействуем.',
          established: 2011,
          employees: '120-180',
          capacity: '35,000 шт/месяц'
        },
        {
          id: '2',
          name: '泉州体育服装工厂 / Quanzhou Sports Garment Factory',
          city: '泉州 / Quanzhou',
          specialization: 'Sports Wear',
          moq: '250 шт',
          moqNumber: 250,
          leadTime: '18 дней',
          leadTimeNumber: 18,
          rating: 4.7,
          deals: 35,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1506629905565-4c2f0cab1d6e?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Средний сегмент спортивной одежды. Взаимодействуем.',
          established: 2012,
          employees: '100-150',
          capacity: '30,000 шт/месяц'
        },
        {
          id: '3',
          name: 'AGLORY Sports Factory',
          city: '南京 / Nanjing',
          specialization: 'Premium Sports Wear',
          moq: '200 шт',
          moqNumber: 200,
          leadTime: '25 дней',
          leadTimeNumber: 25,
          rating: 4.8,
          deals: 42,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Средний+ сегмент спортивной одежды. Взаимодействуем (пока только образцы).',
          established: 2010,
          employees: '150-200',
          capacity: '40,000 шт/месяц'
        },
        {
          id: '4',
          name: 'HONGKONG QUFENG Sports Factory',
          city: '泉州 / Quanzhou',
          specialization: 'Sports Wear',
          moq: '300 шт',
          moqNumber: 300,
          leadTime: '22 дня',
          leadTimeNumber: 22,
          rating: 4.6,
          deals: 25,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1506629905565-4c2f0cab1d6e?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Средний+ сегмент спортивной одежды. Взаимодействуем (пока только образцы).',
          established: 2013,
          employees: '120-180',
          capacity: '35,000 шт/месяц'
        }
      ]
    },
    'accessories': {
      name: 'Accessories / Аксессуары',
      description: 'Производство премиум аксессуаров из кожи, канваса и технических материалов',
      hero: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&h=400&fit=crop&auto=format&q=80',
      icon: '👜',
      specifications: [
        {
          name: 'MOQ',
          value: '100-200 шт',
          description: 'Минимальный заказ'
        },
        {
          name: 'Сроки',
          value: '12-20 дней',
          description: 'Время производства'
        },
        {
          name: 'Сертификации',
          value: 'BSCI, WRAP, OEKO-TEX',
          description: 'Международные стандарты'
        }
      ],
      examples: [
        {
          name: 'Кожаные сумки',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop&auto=format&q=80'
        },
        {
          name: 'Кепки и шляпы',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop&auto=format&q=80'
        },
        {
          name: 'Канвасовые сумки',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop&auto=format&q=80'
        }
      ],
      factories: [
        {
          id: '1',
          name: '帽子定制工厂 / Hat Custom Factory',
          city: '广州 / Guangzhou',
          specialization: 'Hats & Caps',
          moq: '150 шт',
          moqNumber: 150,
          leadTime: '12 дней',
          leadTimeNumber: 12,
          rating: 4.6,
          deals: 45,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Производство кепок и головных уборов. Кастомизация и брендинг.',
          established: 2013,
          employees: '50-80',
          capacity: '8,000 шт/месяц'
        },
        {
          id: '2',
          name: '包装材料工厂 / Packaging Materials Factory',
          city: '深圳 / Shenzhen',
          specialization: 'Packaging & Hardware',
          moq: '100 шт',
          moqNumber: 100,
          leadTime: '10 дней',
          leadTimeNumber: 10,
          rating: 4.5,
          deals: 32,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Производство упаковочных материалов и фурнитуры.',
          established: 2014,
          employees: '30-50',
          capacity: '5,000 шт/месяц'
        },
        {
          id: '3',
          name: '埃里克包装工厂 / Eric Packaging Factory',
          city: '东莞 / Dongguan',
          specialization: 'Packaging & Hardware',
          moq: '80 шт',
          moqNumber: 80,
          leadTime: '8 дней',
          leadTimeNumber: 8,
          rating: 4.7,
          deals: 28,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Специализация на упаковке и фурнитуре для одежды.',
          established: 2012,
          employees: '25-40',
          capacity: '4,000 шт/месяц'
        },
        {
          id: '4',
          name: '安信包装工厂 / Anxin Packaging Factory',
          city: '广州 / Guangzhou',
          specialization: 'Packaging & Hardware',
          moq: '120 шт',
          moqNumber: 120,
          leadTime: '12 дней',
          leadTimeNumber: 12,
          rating: 4.6,
          deals: 35,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Производство качественной упаковки и фурнитуры.',
          established: 2011,
          employees: '40-60',
          capacity: '6,000 шт/месяц'
        },
        {
          id: '5',
          name: 'ES包装工厂 / ES Packaging Factory',
          city: '深圳 / Shenzhen',
          specialization: 'Packaging & Hardware',
          moq: '100 шт',
          moqNumber: 100,
          leadTime: '10 дней',
          leadTimeNumber: 10,
          rating: 4.8,
          deals: 55,
          certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=200&fit=crop&auto=format&q=80',
          description: 'Различные пакеты и бирки. Проверенный поставщик.',
          established: 2010,
          employees: '50-80',
          capacity: '8,000 шт/месяц'
        }
      ]
    }
  };

  const data = categoryData[category as keyof typeof categoryData];
  
  // Get all unique certifications for filter options
  const allCertifications = useMemo(() => {
    const certs = new Set<string>();
    data?.factories.forEach(factory => {
      factory.certifications.forEach(cert => certs.add(cert));
    });
    return Array.from(certs).sort();
  }, [data?.factories]);

  // Filter factories based on current filters
  const filteredFactories = useMemo(() => {
    if (!data?.factories) return [];

    return data.factories.filter(factory => {
      // MOQ filter
      if (filters.moqRange !== 'all') {
        const [min, max] = filters.moqRange.split('-').map(Number);
        if (max && (factory.moqNumber < min || factory.moqNumber > max)) return false;
        if (!max && factory.moqNumber < min) return false;
      }

      // Lead time filter
      if (filters.leadTimeRange !== 'all') {
        const [min, max] = filters.leadTimeRange.split('-').map(Number);
        if (max && (factory.leadTimeNumber < min || factory.leadTimeNumber > max)) return false;
        if (!max && factory.leadTimeNumber < min) return false;
      }

      // Certification filter
      if (filters.certifications.length > 0) {
        const hasRequiredCerts = filters.certifications.some(cert => 
          factory.certifications.includes(cert)
        );
        if (!hasRequiredCerts) return false;
      }

      // Rating filter
      if (filters.rating !== 'all') {
        const minRating = parseFloat(filters.rating);
        if (factory.rating < minRating) return false;
      }

      return true;
    });
  }, [data?.factories, filters]);

  const handleFilterChange = (key: string, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      moqRange: 'all',
      leadTimeRange: 'all',
      certifications: [],
      rating: 'all',
    });
  };

  const toggleCompare = (factoryId: string) => {
    setCompareList(prev => {
      if (prev.includes(factoryId)) {
        return prev.filter(id => id !== factoryId);
      } else if (prev.length < 3) { // Limit to 3 factories for comparison
        return [...prev, factoryId];
      }
      return prev;
    });
  };

  const getComparedFactories = () => {
    return data?.factories.filter(factory => compareList.includes(factory.id)) || [];
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Категория не найдена</h1>
          <Button onClick={() => onNavigate?.('landing')}>
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <ImageWithFallback
          src={data.hero}
          alt={data.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 mb-6"
              onClick={() => onNavigate?.('landing')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к категориям
            </Button>
            <div className="text-white">
              <div className="text-6xl mb-4">{data.icon}</div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{data.name}</h1>
              <p className="text-xl md:text-2xl opacity-90 max-w-3xl">
                {data.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="factories" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="specs">Технические характеристики</TabsTrigger>
              <TabsTrigger value="examples">Примеры работ</TabsTrigger>
              <TabsTrigger value="factories">Фабрики ({filteredFactories.length})</TabsTrigger>
              <TabsTrigger value="process">Процесс производства</TabsTrigger>
            </TabsList>

            {/* Specifications Tab */}
            <TabsContent value="specs" className="space-y-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Технические возможности и стандарты
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Основные характеристики:
                      </h4>
                      <ul className="space-y-3">
                        {data.specifications.map((spec, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Преимущества работы с нами:
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-primary" />
                          <span className="text-gray-700">100% проверенные фабрики</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-success" />
                          <span className="text-gray-700">Быстрые сроки производства</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-accent-purple" />
                          <span className="text-gray-700">Международные сертификации</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-warning" />
                          <span className="text-gray-700">Технологии нового поколения</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Примеры нашей продукции
                </h3>
                <p className="text-lg text-gray-600">
                  Реальные работы наших фабрик-партнеров
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.examples.map((example, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-48">
                      <ImageWithFallback
                        src={example.image}
                        alt={example.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/90 text-primary">
                          <Award className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {example.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {example.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Factories Tab with Filters */}
            <TabsContent value="factories" className="space-y-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Filter Sidebar */}
                <div className="lg:w-80 space-y-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Фильтры</h3>
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="w-4 h-4 mr-2" />
                        Очистить
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* MOQ Filter */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Минимальный заказ (MOQ)
                        </label>
                        <Select value={filters.moqRange} onValueChange={(value) => handleFilterChange('moqRange', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите диапазон" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Любой</SelectItem>
                            <SelectItem value="0-300">До 300 шт</SelectItem>
                            <SelectItem value="300-500">300-500 шт</SelectItem>
                            <SelectItem value="500-800">500-800 шт</SelectItem>
                            <SelectItem value="800">800+ шт</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Lead Time Filter */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Срок производства
                        </label>
                        <Select value={filters.leadTimeRange} onValueChange={(value) => handleFilterChange('leadTimeRange', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите срок" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Любой</SelectItem>
                            <SelectItem value="0-15">До 15 дней</SelectItem>
                            <SelectItem value="15-20">15-20 дней</SelectItem>
                            <SelectItem value="20-25">20-25 дней</SelectItem>
                            <SelectItem value="25">25+ дней</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Rating Filter */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Минимальный рейтинг
                        </label>
                        <Select value={filters.rating} onValueChange={(value) => handleFilterChange('rating', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите рейтинг" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Любой</SelectItem>
                            <SelectItem value="4.5">4.5+ звезд</SelectItem>
                            <SelectItem value="4.7">4.7+ звезд</SelectItem>
                            <SelectItem value="4.8">4.8+ звезд</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Certifications Filter */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Сертификации
                        </label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {allCertifications.map(cert => (
                            <div key={cert} className="flex items-center space-x-2">
                              <Checkbox
                                id={cert}
                                checked={filters.certifications.includes(cert)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleFilterChange('certifications', [...filters.certifications, cert]);
                                  } else {
                                    handleFilterChange('certifications', filters.certifications.filter(c => c !== cert));
                                  }
                                }}
                              />
                              <label htmlFor={cert} className="text-sm text-gray-700">
                                {cert}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Compare Panel */}
                  {compareList.length > 0 && (
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">
                          Сравнение ({compareList.length}/3)
                        </h3>
                        <Button 
                          size="sm"
                          onClick={() => setShowCompareSheet(true)}
                          disabled={compareList.length < 2}
                        >
                          <GitCompare className="w-4 h-4 mr-2" />
                          Сравнить
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {compareList.map(factoryId => {
                          const factory = data.factories.find(f => f.id === factoryId);
                          return factory ? (
                            <div key={factoryId} className="flex items-center justify-between text-sm">
                              <span className="truncate">{factory.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCompare(factoryId)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </Card>
                  )}
                </div>

                {/* Factory List */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Фабрики категории {data.name}
                    </h3>
                    <Badge variant="secondary" className="text-sm">
                      {filteredFactories.length} из {data.factories.length} фабрик
                    </Badge>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {filteredFactories.map((factory) => (
                      <Card key={factory.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="relative h-32">
                          <ImageWithFallback
                            src={factory.image}
                            alt={factory.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-success text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          </div>
                          <div className="absolute top-4 left-4">
                            <Button
                              variant={compareList.includes(factory.id) ? "default" : "secondary"}
                              size="sm"
                              onClick={() => toggleCompare(factory.id)}
                              disabled={!compareList.includes(factory.id) && compareList.length >= 3}
                            >
                              {compareList.includes(factory.id) ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <GitCompare className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <CardContent className="p-6">
                          <div className="mb-4">
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">
                              {factory.name}
                            </h4>
                            <p className="text-gray-600 flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4" />
                              {factory.city}
                            </p>
                            <p className="text-sm text-gray-600">{factory.description}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <span className="text-sm text-gray-500">Специализация:</span>
                              <p className="font-medium">{factory.specialization}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">MOQ:</span>
                              <p className="font-medium">{factory.moq}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Lead time:</span>
                              <p className="font-medium">{factory.leadTime}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Рейтинг:</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-warning text-warning" />
                                <span className="font-medium">{factory.rating}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <span className="text-sm text-gray-500 block mb-2">Сертификации:</span>
                            <div className="flex flex-wrap gap-2">
                              {factory.certifications.map((cert, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{factory.deals} сделок</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Phone className="w-4 h-4 mr-1" />
                                Связаться
                              </Button>
                              <Button size="sm" className="bg-primary hover:bg-primary-light">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                RFQ
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredFactories.length === 0 && (
                    <div className="text-center py-12">
                      <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Не найдено фабрик по выбранным фильтрам
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Попробуйте изменить параметры поиска
                      </p>
                      <Button onClick={clearFilters}>
                        Очистить фильтры
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Process Tab */}
            <TabsContent value="process" className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Процесс производства
                </h3>
                <p className="text-lg text-gray-600">
                  От концепции до готового изделия
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                {[
                  {
                    step: 1,
                    title: 'Техническое задание',
                    description: 'Детальное ТЗ с материалами, размерами и требованиями',
                    icon: Package
                  },
                  {
                    step: 2,
                    title: 'Подбор фабрики',
                    description: 'Выбор оптимального производителя под ваши требования',
                    icon: Factory
                  },
                  {
                    step: 3,
                    title: 'Образец и согласование',
                    description: 'Изготовление образца, тестирование, внесение правок',
                    icon: CheckCircle
                  },
                  {
                    step: 4,
                    title: 'Массовое производство',
                    description: 'Запуск заказа, контроль качества, доставка',
                    icon: Zap
                  }
                ].map((step) => {
                  const Icon = step.icon;
                  return (
                    <Card key={step.step} className="text-center p-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-sm text-primary font-medium mb-2">
                        Шаг {step.step}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {step.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {step.description}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Factory Comparison Sheet */}
      <Sheet open={showCompareSheet} onOpenChange={setShowCompareSheet}>
        <SheetContent className="w-full sm:max-w-4xl">
          <SheetHeader>
            <SheetTitle>Сравнение фабрик</SheetTitle>
            <SheetDescription>
              Сравните характеристики выбранных фабрик
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-900">Параметр</th>
                  {getComparedFactories().map(factory => (
                    <th key={factory.id} className="text-left p-4 font-medium text-gray-900 min-w-48">
                      {factory.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium text-gray-600">Город</td>
                  {getComparedFactories().map(factory => (
                    <td key={factory.id} className="p-4">{factory.city}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium text-gray-600">Специализация</td>
                  {getComparedFactories().map(factory => (
                    <td key={factory.id} className="p-4">{factory.specialization}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium text-gray-600">MOQ</td>
                  {getComparedFactories().map(factory => (
                    <td key={factory.id} className="p-4">{factory.moq}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium text-gray-600">Lead Time</td>
                  {getComparedFactories().map(factory => (
                    <td key={factory.id} className="p-4">{factory.leadTime}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium text-gray-600">Рейтинг</td>
                  {getComparedFactories().map(factory => (
                    <td key={factory.id} className="p-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span>{factory.rating}</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium text-gray-600">Количество сделок</td>
                  {getComparedFactories().map(factory => (
                    <td key={factory.id} className="p-4">{factory.deals}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium text-gray-600">Год основания</td>
                  {getComparedFactories().map(factory => (
                    <td key={factory.id} className="p-4">{factory.established}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium text-gray-600">Сотрудники</td>
                  {getComparedFactories().map(factory => (
                    <td key={factory.id} className="p-4">{factory.employees}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium text-gray-600">Мощность</td>
                  {getComparedFactories().map(factory => (
                    <td key={factory.id} className="p-4">{factory.capacity}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium text-gray-600">Сертификации</td>
                  {getComparedFactories().map(factory => (
                    <td key={factory.id} className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {factory.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-gray-600">Действия</td>
                  {getComparedFactories().map(factory => (
                    <td key={factory.id} className="p-4">
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline" className="w-full">
                          <Phone className="w-4 h-4 mr-1" />
                          Связаться
                        </Button>
                        <Button size="sm" className="bg-primary hover:bg-primary-light w-full">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          RFQ
                        </Button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}