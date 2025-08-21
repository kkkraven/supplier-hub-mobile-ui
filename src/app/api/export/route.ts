import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  exportFactoriesToCSV, 
  exportContactInfoToCSV, 
  exportFactoryStatsToCSV,
  saveCSVToFile 
} from '@/lib/export-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { type, includeContactInfo = true, filename } = await request.json();

    // Получаем данные фабрик из базы данных
    const { data: factories, error } = await supabase
      .from('factories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Ошибка при получении данных фабрик' },
        { status: 500 }
      );
    }

    let csvContent = '';
    let exportFilename = filename || `factories_export_${new Date().toISOString().split('T')[0]}`;

    switch (type) {
      case 'all':
        csvContent = exportFactoriesToCSV(factories, includeContactInfo);
        exportFilename = `${exportFilename}_complete.csv`;
        break;
      case 'contact':
        csvContent = exportContactInfoToCSV(factories);
        exportFilename = `${exportFilename}_contacts.csv`;
        break;
      case 'stats':
        csvContent = exportFactoryStatsToCSV(factories);
        exportFilename = `${exportFilename}_statistics.csv`;
        break;
      default:
        return NextResponse.json(
          { error: 'Неверный тип экспорта' },
          { status: 400 }
        );
    }

    // Сохраняем файл в папку exports
    const filePath = saveCSVToFile(csvContent, exportFilename);

    return NextResponse.json({
      success: true,
      filename: exportFilename,
      filePath,
      recordCount: factories.length,
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка при экспорте данных:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API экспорта данных фабрик',
    endpoints: {
      POST: 'Экспорт данных в CSV формате',
      parameters: {
        type: 'all | contact | stats',
        includeContactInfo: 'boolean (для type=all)',
        filename: 'string (опционально)'
      }
    }
  });
}
