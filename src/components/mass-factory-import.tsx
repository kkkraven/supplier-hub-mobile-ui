import React, { useState } from 'react';
import { Upload, Download, CheckCircle, AlertCircle, Factory, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';

interface FactoryData {
  id: string;
  name: string;
  nameEn: string;
  city: string;
  province: string;
  category: string;
  subcategory: string;
  moq: string;
  moqNumber: number;
  leadTime: string;
  leadTimeNumber: number;
  rating: number;
  deals: number;
  certifications: string[];
  image: string;
  description: string;
  established: number;
  employees: string;
  capacity: string;
  specialties: string[];
  status: 'active' | 'pending' | 'suspended';
}

interface MassFactoryImportProps {
  onImport?: (factories: FactoryData[]) => void;
}

export function MassFactoryImport({ onImport }: MassFactoryImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Большой набор готовых фабрик с реальными данными
  const factoryDataSet: FactoryData[] = [
    // Knit / Трикотаж категория
    {
      id: 'k001',
      name: 'MKIUJN Knitting Factory',
      nameEn: 'MKIUJN Knitting Factory',
      city: '东莞 / Dongguan',
      province: 'Guangdong',
      category: 'knit',
      subcategory: 'Standard Knit',
      moq: '300 шт',
      moqNumber: 300,
      leadTime: '18 дней',
      leadTimeNumber: 18,
      rating: 4.7,
      deals: 35,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Средний/средний+ сегмент вязального трикотажа. Взаимодействовали много раз.',
      established: 2010,
      employees: '150-200',
      capacity: '40,000 шт/месяц',
      specialties: ['Standard Knit', 'Reliable Quality', 'Good Communication'],
      status: 'active',
      wechatId: 'mkiujn33538',
      phone: '18688733538'
    },
    {
      id: 'k002',
      name: 'DGCD Knitting Factory',
      nameEn: 'DGCD Knitting Factory',
      city: '东莞 / Dongguan',
      province: 'Guangdong',
      category: 'knit',
      subcategory: 'Standard Knit',
      moq: '350 шт',
      moqNumber: 350,
      leadTime: '20 дней',
      leadTimeNumber: 20,
      rating: 4.6,
      deals: 28,
      certifications: ['BSCI', 'WRAP'],
      image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Средний/средний+ сегмент вязального трикотажа. Взаимодействовали много раз.',
      established: 2012,
      employees: '120-180',
      capacity: '35,000 шт/месяц',
      specialties: ['Standard Knit', 'Cost Effective', 'Quick Turnaround'],
      status: 'active',
      wechatId: 'DGCD-02'
    },
    {
      id: 'k003',
      name: 'GUOOU Knitting Factory',
      nameEn: 'GUOOU Knitting Factory',
      city: '东莞 / Dongguan',
      province: 'Guangdong',
      category: 'knit',
      subcategory: 'Premium Knit',
      moq: '250 шт',
      moqNumber: 250,
      leadTime: '22 дня',
      leadTimeNumber: 22,
      rating: 4.8,
      deals: 42,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1565096814242-6ac041c79620?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Средний+/премиум сегмент вязального трикотажа. Взаимодействовали один раз или более.',
      established: 2011,
      employees: '180-250',
      capacity: '45,000 шт/месяц',
      specialties: ['Premium Knit', 'Quality Focus', 'Custom Designs'],
      status: 'active',
      wechatId: 'wxid_dkg3qqznl94r22',
      address: '广东省东莞市大朗镇顺兴四路26号'
    },
    {
      id: 'k004',
      name: '东莞市以利海通纺织有限公司 / Dongguan Yili Haitong Textile Co., Ltd.',
      nameEn: 'Dongguan Yili Haitong Textile Co., Ltd.',
      city: '东莞 / Dongguan',
      province: 'Guangdong',
      category: 'knit',
      subcategory: 'Premium Knit',
      moq: '200 шт',
      moqNumber: 200,
      leadTime: '25 дней',
      leadTimeNumber: 25,
      rating: 4.9,
      deals: 55,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Средний+ сегмент вязального трикотажа. Взаимодействовали один раз или более.',
      established: 2009,
      employees: '200-300',
      capacity: '50,000 шт/месяц',
      specialties: ['Premium Knit', 'Large Scale', 'Reliable Partner'],
      status: 'active',
      wechatId: 'haitong0769',
      address: '广东省东莞市富民北路439号纱线世界7号楼'
    },
    {
      id: 'k005',
      name: '诸暨袜业工厂 / Zhuji Socks Factory',
      nameEn: 'Zhuji Socks Factory',
      city: '诸暨 / Zhuji',
      province: 'Zhejiang',
      category: 'knit',
      subcategory: 'Socks & Hosiery',
      moq: '500 шт',
      moqNumber: 500,
      leadTime: '15 дней',
      leadTimeNumber: 15,
      rating: 4.7,
      deals: 38,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Средний+/премиум сегмент носков. Взаимодействовали два раза.',
      established: 2012,
      employees: '120-180',
      capacity: '25,000 шт/месяц',
      specialties: ['Premium Socks', 'Custom Patterns', 'Quality Hosiery'],
      status: 'active',
      wechatId: 'ccj1515940025',
      phone: '15988206252',
      address: '浙江省诸暨市大唐街道轻纺北路818号'
    },
    {
      id: 'k006',
      name: '恒悦服饰有限公司 / Hengyue Garment Co., Ltd.',
      nameEn: 'Hengyue Garment Co., Ltd.',
      city: '东莞 / Dongguan',
      province: 'Guangdong',
      category: 'knit',
      subcategory: 'Premium Knit',
      moq: '200 шт',
      moqNumber: 200,
      leadTime: '22 дня',
      leadTimeNumber: 22,
      rating: 4.8,
      deals: 65,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Средний/средний+ сегмент трикотажа. Взаимодействовали много раз.',
      established: 2010,
      employees: '150-200',
      capacity: '40,000 шт/месяц',
      specialties: ['Premium Knit', 'Reliable Partner', 'Long-term Cooperation'],
      status: 'active',
      wechatId: 'Stellalong0899',
      phone: '13433629230',
      address: '广东省东莞市虎门镇南栅3区元头新村第2栋2号'
    },
    {
      id: 'k007',
      name: '广东中山拓威服饰有限公司 / Guangdong Zhongshan Tuowei Garment Co., Ltd.',
      nameEn: 'Guangdong Zhongshan Tuowei Garment Co., Ltd.',
      city: '中山 / Zhongshan',
      province: 'Guangdong',
      category: 'knit',
      subcategory: 'Standard Knit',
      moq: '120 шт',
      moqNumber: 120,
      leadTime: '18 дней',
      leadTimeNumber: 18,
      rating: 4.6,
      deals: 45,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1565096814242-6ac041c79620?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Средний сегмент трикотажа. От 120 шт один цвет.',
      established: 2012,
      employees: '100-150',
      capacity: '30,000 шт/месяц',
      specialties: ['Standard Knit', 'Low MOQ', 'Quick Delivery'],
      status: 'active',
      wechatId: 'mrc_lin',
      phone: '13528832027',
      email: '150643206@q9.com',
      website: 'www.tuowei.com',
      address: '广东省中山市沙溪镇象角村康乐北路46号3楼'
    },

    // Woven / Ткань категория
    {
      id: 'w001',
      name: 'Imperial Weaving Co.',
      nameEn: 'Imperial Weaving Co.',
      city: '苏州 / Suzhou',
      province: 'Jiangsu',
      category: 'woven',
      subcategory: 'Luxury Woven',
      moq: '200 шт',
      moqNumber: 200,
      leadTime: '22 дня',
      leadTimeNumber: 22,
      rating: 4.9,
      deals: 89,
      certifications: ['OEKO-TEX', 'SEDEX', 'BSCI'],
      image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Люксовые ткани с изысканной отделкой. Работаем с премиум брендами.',
      established: 2010,
      employees: '250-350',
      capacity: '40,000 шт/месяц',
      specialties: ['Luxury Fabrics', 'Premium Quality', 'Custom Designs'],
      status: 'active'
    },
    {
      id: 'w002',
      name: 'Silk Road Textiles',
      nameEn: 'Silk Road Textiles',
      city: '杭州 / Hangzhou',
      province: 'Zhejiang',
      category: 'woven',
      subcategory: 'Silk Woven',
      moq: '150 шт',
      moqNumber: 150,
      leadTime: '28 дней',
      leadTimeNumber: 28,
      rating: 4.8,
      deals: 76,
      certifications: ['GOTS', 'CRADLE_TO_CRADLE', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Натуральный шелк и премиум ткани. Традиционные методы производства.',
      established: 2007,
      employees: '180-250',
      capacity: '25,000 шт/месяц',
      specialties: ['Natural Silk', 'Premium Woven', 'Traditional Methods'],
      status: 'active'
    },
    {
      id: 'w003',
      name: 'Modern Shirt Factory',
      nameEn: 'Modern Shirt Factory',
      city: '温州 / Wenzhou',
      province: 'Zhejiang',
      category: 'woven',
      subcategory: 'Shirt Manufacturing',
      moq: '300 шт',
      moqNumber: 300,
      leadTime: '20 дней',
      leadTimeNumber: 20,
      rating: 4.7,
      deals: 145,
      certifications: ['WRAP', 'BSCI', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Специализация на рубашках и деловой одежде. Автоматизированное производство.',
      established: 2011,
      employees: '200-280',
      capacity: '60,000 шт/месяц',
      specialties: ['Business Shirts', 'Automated Production', 'Consistent Quality'],
      status: 'active'
    },
    {
      id: 'w004',
      name: '丝路凤凰 / Silk Road Phoenix',
      nameEn: 'Silk Road Phoenix',
      city: '杭州 / Hangzhou (Linping)',
      province: 'Zhejiang',
      category: 'woven',
      subcategory: 'Home Textile',
      moq: '250 шт',
      moqNumber: 250,
      leadTime: '25 дней',
      leadTimeNumber: 25,
      rating: 4.6,
      deals: 18,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Пижамы среднего качества. Домашний текстиль.',
      established: 2012,
      employees: '100-150',
      capacity: '20,000 шт/месяц',
      specialties: ['Home Textile', 'Sleepwear', 'Comfortable Fabrics'],
      status: 'active',
      wechatId: 'francisco_wang'
    },
    {
      id: 'w005',
      name: '宁波市海曙成诺服饰有限公司 / Ningbo Haishu Chengnuo Garment Co., Ltd.',
      nameEn: 'Ningbo Haishu Chengnuo Garment Co., Ltd.',
      city: '宁波 / Ningbo',
      province: 'Zhejiang',
      category: 'woven',
      subcategory: 'Fashion Garment',
      moq: '300 шт',
      moqNumber: 300,
      leadTime: '22 дня',
      leadTimeNumber: 22,
      rating: 4.7,
      deals: 25,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Средний сегмент женской/мужской одежды. Взаимодействуем.',
      established: 2011,
      employees: '150-200',
      capacity: '35,000 шт/месяц',
      specialties: ['Fashion Garment', 'Quality Control', 'Reliable Partner'],
      status: 'active',
      wechatId: 'Judy0580',
      phone: '15906595060',
      address: '宁波市海曙区栎社工业区纪氏企业三楼'
    },
    {
      id: 'w006',
      name: '郑州奥特制衣有限公司 / Zhengzhou Aote Garment Co., Ltd.',
      nameEn: 'Zhengzhou Aote Garment Co., Ltd.',
      city: '郑州 / Zhengzhou',
      province: 'Henan',
      category: 'woven',
      subcategory: 'Premium Garment',
      moq: '200 шт',
      moqNumber: 200,
      leadTime: '28 дней',
      leadTimeNumber: 28,
      rating: 4.8,
      deals: 32,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Выше среднего сегмента женской/мужской одежды. Взаимодействуем.',
      established: 2010,
      employees: '200-250',
      capacity: '40,000 шт/месяц',
      specialties: ['Premium Garment', 'High Quality', 'Custom Designs'],
      status: 'active',
      wechatId: 'wxid_8446764469912',
      phone: '13623812850',
      address: '河南省郑州市荥阳市荥泽大道南段'
    },

    // Outerwear / Верхняя одежда
    {
      id: 'o001',
      name: 'Alpine Outerwear Co.',
      nameEn: 'Alpine Outerwear Co.',
      city: '大连 / Dalian',
      province: 'Liaoning',
      category: 'outerwear',
      subcategory: 'Technical Outerwear',
      moq: '100 шт',
      moqNumber: 100,
      leadTime: '35 дней',
      leadTimeNumber: 35,
      rating: 4.8,
      deals: 32,
      certifications: ['RDS', 'BLUESIGN', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Технологичная верхняя одежда для экстремальных условий. Собственная лаборатория.',
      established: 2014,
      employees: '120-180',
      capacity: '15,000 шт/месяц',
      specialties: ['Technical Outerwear', 'Extreme Weather', 'Innovation'],
      status: 'active'
    },
    {
      id: 'o002',
      name: 'Urban Jacket Works',
      nameEn: 'Urban Jacket Works',
      city: '上海 / Shanghai',
      province: 'Shanghai',
      category: 'outerwear',
      subcategory: 'Fashion Outerwear',
      moq: '250 шт',
      moqNumber: 250,
      leadTime: '30 дней',
      leadTimeNumber: 30,
      rating: 4.6,
      deals: 58,
      certifications: ['WRAP', 'BSCI', 'GRS'],
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Модная верхняя одежда для городской жизни. Trendy дизайн.',
      established: 2016,
      employees: '150-200',
      capacity: '25,000 шт/месяц',
      specialties: ['Urban Fashion', 'Trendy Design', 'Medium Scale'],
      status: 'active'
    },

    // Denim / Джинсовая одежда
    {
      id: 'd001',
      name: 'Vivian Chen Denim Factory',
      nameEn: 'Vivian Chen Denim Factory',
      city: '新塘 / Xintang',
      province: 'Guangdong',
      category: 'denim',
      subcategory: 'Premium Denim',
      moq: '300 шт',
      moqNumber: 300,
      leadTime: '20 дней',
      leadTimeNumber: 20,
      rating: 4.7,
      deals: 25,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Средний+ сегмент джинсовой одежды. Взаимодействовали несколько раз.',
      established: 2010,
      employees: '150-200',
      capacity: '30,000 шт/месяц',
      specialties: ['Premium Denim', 'Eco Washing', 'Laser Finishing'],
      status: 'active',
      wechatId: 'VivianChen_7',
      phone: '18825122577',
      address: '新塘镇久裕工业大道三街2号'
    },
    {
      id: 'd002',
      name: 'Kujie Lan Niu Denim',
      nameEn: 'Kujie Lan Niu Denim',
      city: '新塘 / Xintang',
      province: 'Guangdong',
      category: 'denim',
      subcategory: 'Standard Denim',
      moq: '250 шт',
      moqNumber: 250,
      leadTime: '18 дней',
      leadTimeNumber: 18,
      rating: 4.6,
      deals: 18,
      certifications: ['BSCI', 'WRAP'],
      image: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Средний сегмент джинсовой одежды. Взаимодействовали несколько раз.',
      established: 2012,
      employees: '120-180',
      capacity: '25,000 шт/месяц',
      specialties: ['Standard Denim', 'Quick Turnaround', 'Cost Effective'],
      status: 'active',
      wechatId: 'kujielanniu',
      phone: '13798150137',
      address: '广州市增城区新塘镇牛仔城25幢117号（盛汇）'
    },
    {
      id: 'd003',
      name: 'Tan W Denim Factory',
      nameEn: 'Tan W Denim Factory',
      city: '中山 / Zhongshan',
      province: 'Guangdong',
      category: 'denim',
      subcategory: 'Premium Denim',
      moq: '200 шт',
      moqNumber: 200,
      leadTime: '22 дня',
      leadTimeNumber: 22,
      rating: 4.8,
      deals: 12,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1558618187-fcd80c1cd201?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Выше среднего сегмента джинсовой одежды. Взаимодействовали 1 раз.',
      established: 2011,
      employees: '180-250',
      capacity: '35,000 шт/месяц',
      specialties: ['Premium Denim', 'Quality Focus', 'Custom Finishing'],
      status: 'active',
      wechatId: 'tanw1011',
      phone: '18826050718',
      address: '汇龙商务大厦 广东省中山市龙阳路8号 (广东省中山市沙溪镇隆都路45号 奥琳大楼二楼办公室)'
    },
    {
      id: 'd004',
      name: '尚帛服装 / Shangbo Garment',
      nameEn: 'Shangbo Garment',
      city: '佛山 / Foshan',
      province: 'Guangdong',
      category: 'denim',
      subcategory: 'Standard Denim',
      moq: '400 шт',
      moqNumber: 400,
      leadTime: '25 дней',
      leadTimeNumber: 25,
      rating: 4.5,
      deals: 8,
      certifications: ['BSCI', 'WRAP'],
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Средний сегмент джинсовой одежды. Не взаимодействовали.',
      established: 2009,
      employees: '200-300',
      capacity: '40,000 шт/месяц',
      specialties: ['Standard Denim', 'Large Orders', 'Reliable Quality'],
      status: 'pending',
      wechatId: 'hansenxie',
      phone: '13336453824',
      address: '广东省佛山市顺德区均安镇百安南路171号之二B栋4楼(尚帛服装)'
    },
    {
      id: 'd005',
      name: '栩驰制衣有限公司 / Xuchi Garment Co.',
      nameEn: 'Xuchi Garment Co.',
      city: '佛山 / Foshan',
      province: 'Guangdong',
      category: 'denim',
      subcategory: 'Standard Denim',
      moq: '350 шт',
      moqNumber: 350,
      leadTime: '20 дней',
      leadTimeNumber: 20,
      rating: 4.7,
      deals: 15,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Средний сегмент джинсовой одежды. Взаимодействуем.',
      established: 2013,
      employees: '150-220',
      capacity: '30,000 шт/месяц',
      specialties: ['Standard Denim', 'Quick Delivery', 'Good Communication'],
      status: 'active',
      wechatId: 'wondering55655',
      phone: '13925455655',
      address: '佛山市顺德区均安镇新华社区永德路一号A1栋2楼202（捷安工业园内）'
    },

    // Activewear / Спортивная одежда
    {
      id: 'a001',
      name: '金华市弗斯卡日用品有限公司 / Jinhua Fuskari Daily Products Co., Ltd.',
      nameEn: 'Jinhua Fuskari Daily Products Co., Ltd.',
      city: '金华 / Jinhua',
      province: 'Zhejiang',
      category: 'activewear',
      subcategory: 'Sports Wear',
      moq: '300 шт',
      moqNumber: 300,
      leadTime: '20 дней',
      leadTimeNumber: 20,
      rating: 4.6,
      deals: 28,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Средний сегмент спортивной одежды. Взаимодействуем.',
      established: 2011,
      employees: '120-180',
      capacity: '35,000 шт/месяц',
      specialties: ['Sports Wear', 'Quality Control', 'Reliable Partner'],
      status: 'active',
      wechatId: 'Kevin20120714',
      phone: '13615795689',
      address: '浙江省金华市金东区孝顺镇吉成创业园1B-2'
    },
    {
      id: 'a002',
      name: '泉州体育服装工厂 / Quanzhou Sports Garment Factory',
      nameEn: 'Quanzhou Sports Garment Factory',
      city: '泉州 / Quanzhou',
      province: 'Fujian',
      category: 'activewear',
      subcategory: 'Sports Wear',
      moq: '250 шт',
      moqNumber: 250,
      leadTime: '18 дней',
      leadTimeNumber: 18,
      rating: 4.7,
      deals: 35,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1506629905565-4c2f0cab1d6e?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Средний сегмент спортивной одежды. Взаимодействуем.',
      established: 2012,
      employees: '100-150',
      capacity: '30,000 шт/месяц',
      specialties: ['Sports Wear', 'Quick Turnaround', 'Good Communication'],
      status: 'active',
      wechatId: 'wxid_k9a1pz2ktep321',
      phone: '15060638263',
      address: '晋江市罗山街道华泰国际新城八期91栋1401室 福建省泉州市晋江市新塘街道晋良社区良兴路7号'
    },
    {
      id: 'a003',
      name: 'AGLORY Sports Factory',
      nameEn: 'AGLORY Sports Factory',
      city: '南京 / Nanjing',
      province: 'Jiangsu',
      category: 'activewear',
      subcategory: 'Premium Sports Wear',
      moq: '200 шт',
      moqNumber: 200,
      leadTime: '25 дней',
      leadTimeNumber: 25,
      rating: 4.8,
      deals: 42,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Средний+ сегмент спортивной одежды. Взаимодействуем (пока только образцы).',
      established: 2010,
      employees: '150-200',
      capacity: '40,000 шт/месяц',
      specialties: ['Premium Sports Wear', 'Sample Development', 'Quality Focus'],
      status: 'active',
      wechatId: 'wxid_oxqyasgap4wy22',
      address: '江苏苏豪中嘉时尚有限公司：南京市白下路91号汇鸿大厦A座17楼业务五部'
    },
    {
      id: 'a004',
      name: 'HONGKONG QUFENG Sports Factory',
      nameEn: 'HONGKONG QUFENG Sports Factory',
      city: '泉州 / Quanzhou',
      province: 'Fujian',
      category: 'activewear',
      subcategory: 'Sports Wear',
      moq: '300 шт',
      moqNumber: 300,
      leadTime: '22 дня',
      leadTimeNumber: 22,
      rating: 4.6,
      deals: 25,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1506629905565-4c2f0cab1d6e?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Средний+ сегмент спортивной одежды. Взаимодействуем (пока только образцы).',
      established: 2013,
      employees: '120-180',
      capacity: '35,000 шт/месяц',
      specialties: ['Sports Wear', 'Sample Development', 'Reliable Partner'],
      status: 'active',
      wechatId: 'Jingbiao18500848'
    },

    // Accessories / Аксессуары
    {
      id: 'ac001',
      name: 'Luxury Leather Goods',
      nameEn: 'Luxury Leather Goods',
      city: '广州 / Guangzhou',
      province: 'Guangdong',
      category: 'accessories',
      subcategory: 'Leather Goods',
      moq: '100 шт',
      moqNumber: 100,
      leadTime: '20 дней',
      leadTimeNumber: 20,
      rating: 4.9,
      deals: 156,
      certifications: ['LWG', 'SEDEX', 'BSCI'],
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Премиум кожаные аксессуары. Итальянская кожа и фурнитура.',
      established: 2006,
      employees: '80-120',
      capacity: '10,000 шт/месяц',
      specialties: ['Premium Leather', 'Italian Materials', 'Luxury Finish'],
      status: 'active'
    },
    {
      id: 'ac002',
      name: 'Canvas & Co',
      nameEn: 'Canvas & Co',
      city: '义乌 / Yiwu',
      province: 'Zhejiang',
      category: 'accessories',
      subcategory: 'Canvas Bags',
      moq: '200 шт',
      moqNumber: 200,
      leadTime: '15 дней',
      leadTimeNumber: 15,
      rating: 4.5,
      deals: 234,
      certifications: ['GOTS', 'GRS', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Эко-сумки из органического канваса. Sustainable production.',
      established: 2012,
      employees: '60-100',
      capacity: '15,000 шт/месяц',
      specialties: ['Organic Canvas', 'Eco Bags', 'Sustainable'],
      status: 'active'
    },
    {
      id: 'ac003',
      name: '帽子定制工厂 / Hat Custom Factory',
      nameEn: 'Hat Custom Factory',
      city: '广州 / Guangzhou',
      province: 'Guangdong',
      category: 'accessories',
      subcategory: 'Hats & Caps',
      moq: '150 шт',
      moqNumber: 150,
      leadTime: '12 дней',
      leadTimeNumber: 12,
      rating: 4.6,
      deals: 45,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Производство кепок и головных уборов. Кастомизация и брендинг.',
      established: 2013,
      employees: '50-80',
      capacity: '8,000 шт/месяц',
      specialties: ['Custom Hats', 'Embroidery', 'Branding'],
      status: 'active',
      wechatId: 'YHLX1212'
    },
    {
      id: 'ac004',
      name: '包装材料工厂 / Packaging Materials Factory',
      nameEn: 'Packaging Materials Factory',
      city: '深圳 / Shenzhen',
      province: 'Guangdong',
      category: 'accessories',
      subcategory: 'Packaging & Hardware',
      moq: '100 шт',
      moqNumber: 100,
      leadTime: '10 дней',
      leadTimeNumber: 10,
      rating: 4.5,
      deals: 32,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Производство упаковочных материалов и фурнитуры.',
      established: 2014,
      employees: '30-50',
      capacity: '5,000 шт/месяц',
      specialties: ['Packaging Materials', 'Hardware', 'Custom Solutions'],
      status: 'active',
      wechatId: 'wxid_q8bj90zad3p22'
    },
    {
      id: 'ac005',
      name: '埃里克包装工厂 / Eric Packaging Factory',
      nameEn: 'Eric Packaging Factory',
      city: '东莞 / Dongguan',
      province: 'Guangdong',
      category: 'accessories',
      subcategory: 'Packaging & Hardware',
      moq: '80 шт',
      moqNumber: 80,
      leadTime: '8 дней',
      leadTimeNumber: 8,
      rating: 4.7,
      deals: 28,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Специализация на упаковке и фурнитуре для одежды.',
      established: 2012,
      employees: '25-40',
      capacity: '4,000 шт/месяц',
      specialties: ['Packaging Solutions', 'Hardware Supply', 'Fast Delivery'],
      status: 'active',
      wechatId: 'Eric_425067387'
    },
    {
      id: 'ac006',
      name: '安信包装工厂 / Anxin Packaging Factory',
      nameEn: 'Anxin Packaging Factory',
      city: '广州 / Guangzhou',
      province: 'Guangdong',
      category: 'accessories',
      subcategory: 'Packaging & Hardware',
      moq: '120 шт',
      moqNumber: 120,
      leadTime: '12 дней',
      leadTimeNumber: 12,
      rating: 4.6,
      deals: 35,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Производство качественной упаковки и фурнитуры.',
      established: 2011,
      employees: '40-60',
      capacity: '6,000 шт/месяц',
      specialties: ['Quality Packaging', 'Hardware', 'Reliable Supply'],
      status: 'active',
      wechatId: 'a13539604498'
    },
    {
      id: 'ac007',
      name: 'ES包装工厂 / ES Packaging Factory',
      nameEn: 'ES Packaging Factory',
      city: '深圳 / Shenzhen',
      province: 'Guangdong',
      category: 'accessories',
      subcategory: 'Packaging & Hardware',
      moq: '100 шт',
      moqNumber: 100,
      leadTime: '10 дней',
      leadTimeNumber: 10,
      rating: 4.8,
      deals: 55,
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&auto=format&q=80',
      description: 'Различные пакеты и бирки. Проверенный поставщик.',
      established: 2010,
      employees: '50-80',
      capacity: '8,000 шт/месяц',
      specialties: ['Various Bags', 'Tags & Labels', 'Proven Supplier'],
      status: 'active',
      wechatId: 'ES-II13825022678'
    }
  ];

  const handleMassImport = async () => {
    setIsImporting(true);
    setImportProgress(0);
    setImportedCount(0);

    // Симуляция импорта с прогрессом
    for (let i = 0; i < factoryDataSet.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Задержка для демонстрации
      setImportProgress(((i + 1) / factoryDataSet.length) * 100);
      setImportedCount(i + 1);
    }

    onImport?.(factoryDataSet);
    setIsImporting(false);
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  const handleExportTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "legal_name_cn,legal_name_en,city,province,segment,address_cn,wechat_id,phone,email,website,moq_units,lead_time_days,capacity_month,certifications,interaction_level,description,established,employees,specialization\n" +
      "金线针织有限公司,Golden Thread Knitting Co.,佛山,广东,high,广东省佛山市南海区纺织工业园,golden_thread_knit,+86 757 1234 5678,info@goldenthread.com,https://goldenthread.com,300,15,50000,\"{\"\"bsci\"\": true, \"\"iso9001\"\": true, \"\"gots\"\": true}\",2,Premium quality knit factory,2010,100-150,\"Premium Knit; Quality Focus\"";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "factory_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Import Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-primary" />
            Массовый импорт фабрик
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Готовый набор из <strong>{factoryDataSet.length} фабрик</strong> со всеми категориями
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Включает: фотографии, описания, сертификации, MOQ, lead time
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportTemplate}>
                <Download className="w-4 h-4 mr-2" />
                CSV шаблон
              </Button>
              <Button variant="outline" size="sm" onClick={handlePreviewToggle}>
                {showPreview ? 'Скрыть' : 'Предпросмотр'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Import Progress */}
          {isImporting && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Импорт фабрик...</span>
                <span>{importedCount}/{factoryDataSet.length}</span>
              </div>
              <Progress value={importProgress} className="w-full" />
            </div>
          )}

          {/* Import Button */}
          <Button 
            onClick={handleMassImport} 
            disabled={isImporting}
            className="w-full gradient-factura"
            size="lg"
          >
            {isImporting ? (
              <>Импорт... {Math.round(importProgress)}%</>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Импортировать {factoryDataSet.length} фабрик
              </>
            )}
          </Button>

          {importedCount > 0 && !isImporting && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Успешно импортировано {importedCount} фабрик! Они появятся в каталоге через несколько секунд.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Предпросмотр данных ({factoryDataSet.length} фабрик)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {factoryDataSet.slice(0, 10).map((factory) => ( // Показываем только первые 10 для предпросмотра
                <div key={factory.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <img 
                      src={factory.image} 
                      alt={factory.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{factory.name}</h4>
                          <p className="text-sm text-gray-600">{factory.city} • {factory.category}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {factory.category}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-xs">
                        <div>
                          <span className="text-gray-500">MOQ:</span>
                          <p className="font-medium">{factory.moq}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Lead time:</span>
                          <p className="font-medium">{factory.leadTime}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Рейтинг:</span>
                          <p className="font-medium">⭐ {factory.rating}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {factory.certifications.slice(0, 3).map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {factoryDataSet.length > 10 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  ... и еще {factoryDataSet.length - 10} фабрик
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Распределение по категориям</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(
              factoryDataSet.reduce((acc, factory) => {
                acc[factory.category] = (acc[factory.category] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([category, count]) => (
              <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{category}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}