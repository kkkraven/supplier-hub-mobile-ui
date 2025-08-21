const fs = require('fs');
const path = require('path');

// Путь к файлу .env.local
const envPath = path.join(__dirname, '.env.local');

console.log('🔧 Исправление файла .env.local...');

try {
  // Читаем текущий файл
  let content = fs.readFileSync(envPath, 'utf8');
  
  console.log('📄 Текущее содержимое файла:');
  console.log(content);
  
  // Проверяем, есть ли нужные переменные
  const hasSupabaseUrl = content.includes('NEXT_PUBLIC_SUPABASE_URL');
  const hasServiceKey = content.includes('SUPABASE_SERVICE_ROLE_KEY');
  
  console.log('🔍 Проверка переменных:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', hasSupabaseUrl ? '✅ Найдена' : '❌ Отсутствует');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', hasServiceKey ? '✅ Найдена' : '❌ Отсутствует');
  
  if (!hasSupabaseUrl || !hasServiceKey) {
    console.log('⚠️  Внимание: Не все необходимые переменные найдены в .env.local');
    console.log('📝 Убедитесь, что файл содержит:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
    console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  }
  
} catch (error) {
  console.error('❌ Ошибка при чтении файла .env.local:', error.message);
  console.log('📝 Создайте файл .env.local с содержимым:');
  console.log(`
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
  `);
}
