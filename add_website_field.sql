-- ============================================================================
-- ДОБАВЛЕНИЕ ПОЛЯ WEBSITE В ТАБЛИЦУ FACTORIES
-- ============================================================================
-- Добавление нового поля website для хранения веб-сайтов фабрик
-- ============================================================================

-- Добавление поля website в таблицу factories
ALTER TABLE factories 
ADD COLUMN IF NOT EXISTS website TEXT;

-- Добавление комментария к полю
COMMENT ON COLUMN factories.website IS 'Веб-сайт фабрики (опционально)';

-- Обновление существующих записей с примерами веб-сайтов
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

-- Проверка структуры таблицы
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'factories' 
AND column_name IN ('wechat_id', 'phone', 'email', 'website', 'address_cn')
ORDER BY ordinal_position;

-- Проверка данных
SELECT 
    legal_name_en,
    wechat_id,
    phone,
    email,
    website,
    address_cn
FROM factories 
LIMIT 5;

-- ============================================================================
-- РЕЗУЛЬТАТ:
-- ============================================================================
-- ✅ Добавлено поле website в таблицу factories
-- ✅ Обновлены примеры данных с веб-сайтами
-- ✅ Поле является опциональным (NULL)
-- ============================================================================
