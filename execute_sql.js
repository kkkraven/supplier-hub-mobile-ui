const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Загружаем переменные окружения
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: Не найдены переменные окружения для Supabase');
  console.error('Убедитесь, что файл .env.local содержит:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQL() {
  try {
    console.log('🚀 Начинаем выполнение SQL-скрипта...');
    
    // Читаем SQL-файл
    const sqlFile = path.join(__dirname, 'add_website_field.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 SQL-скрипт загружен');
    
    // Выполняем SQL через Supabase
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Ошибка при выполнении SQL:', error);
      
      // Попробуем выполнить запросы по отдельности
      console.log('🔄 Пробуем выполнить запросы по отдельности...');
      
      // 1. Добавляем поле website
      const { error: alterError } = await supabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE factories ADD COLUMN IF NOT EXISTS website TEXT;' 
      });
      
      if (alterError) {
        console.error('❌ Ошибка при добавлении поля website:', alterError);
      } else {
        console.log('✅ Поле website добавлено');
      }
      
      // 2. Добавляем комментарий
      const { error: commentError } = await supabase.rpc('exec_sql', { 
        sql: "COMMENT ON COLUMN factories.website IS 'Веб-сайт фабрики (опционально)';" 
      });
      
      if (commentError) {
        console.error('❌ Ошибка при добавлении комментария:', commentError);
      } else {
        console.log('✅ Комментарий добавлен');
      }
      
      // 3. Обновляем данные
      const { error: updateError } = await supabase.rpc('exec_sql', { 
        sql: `
          UPDATE factories 
          SET website = CASE 
              WHEN legal_name_en ILIKE '%Golden Thread%' THEN 'https://www.goldenthread.com'
              WHEN legal_name_en ILIKE '%Sunrise%' THEN 'https://www.sunrisetextile.com'
              WHEN legal_name_en ILIKE '%Imperial%' THEN 'https://www.imperialweaving.com'
              WHEN legal_name_en ILIKE '%Oriental%' THEN 'https://www.orientalsilk.com'
              WHEN legal_name_en ILIKE '%South China%' THEN 'https://www.southchina.com'
              ELSE NULL
          END
          WHERE website IS NULL;
        ` 
      });
      
      if (updateError) {
        console.error('❌ Ошибка при обновлении данных:', updateError);
      } else {
        console.log('✅ Данные обновлены');
      }
      
    } else {
      console.log('✅ SQL-скрипт выполнен успешно');
      console.log('📊 Результат:', data);
    }
    
    // Проверяем результат
    console.log('🔍 Проверяем результат...');
    
    const { data: checkData, error: checkError } = await supabase
      .from('factories')
      .select('legal_name_en, wechat_id, phone, email, website, address_cn')
      .limit(5);
    
    if (checkError) {
      console.error('❌ Ошибка при проверке данных:', checkError);
    } else {
      console.log('✅ Проверка данных:');
      console.table(checkData);
    }
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
}

executeSQL();
