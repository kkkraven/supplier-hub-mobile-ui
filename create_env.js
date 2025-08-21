const fs = require('fs');
const path = require('path');

// Путь к файлу .env.local
const envPath = path.join(__dirname, '.env.local');

console.log('🔧 Создание правильного файла .env.local...');

// Содержимое файла .env.local
const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lhdjfkxrislqiivafsew.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZGpma3hyaXNscWlpdmFmc2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDYwOTUsImV4cCI6MjA3MTAyMjA5NX0.oIbxSVzvWBOL8Jri8JX76aKuR_sWGrqUSwqLbkAOtvQ

# ВАЖНО: Добавьте ваш SUPABASE_SERVICE_ROLE_KEY
# Получите его в панели Supabase: Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Instructions:
# 1. Замените 'your_service_role_key_here' на ваш реальный service_role key
# 2. Получите ключ в панели Supabase: Settings → API → service_role key
`;

try {
  // Записываем новый файл
  fs.writeFileSync(envPath, envContent, 'utf8');
  
  console.log('✅ Файл .env.local создан/обновлен');
  console.log('📝 Следующие шаги:');
  console.log('1. Откройте панель Supabase: https://supabase.com/dashboard');
  console.log('2. Выберите ваш проект');
  console.log('3. Перейдите в Settings → API');
  console.log('4. Скопируйте service_role key');
  console.log('5. Замените "your_service_role_key_here" в файле .env.local');
  
} catch (error) {
  console.error('❌ Ошибка при создании файла:', error.message);
}
