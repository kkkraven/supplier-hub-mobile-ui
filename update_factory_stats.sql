-- ============================================================================
-- ОБНОВЛЕНИЕ СТАТИСТИКИ И СЧЕТЧИКОВ ФАБРИК
-- ============================================================================
-- Обновление общего количества фабрик с демо-цифр на 30
-- Обновление счетчиков по категориям: Деним (5), Трикотаж (7), Ткань (6), Спортивная одежда (4), Аксессуары (8)
-- ============================================================================

-- Обновление счетчиков фабрик по категориям
UPDATE categories 
SET factory_count = CASE 
    WHEN slug = 'denim' THEN 5
    WHEN slug = 'knit' THEN 7
    WHEN slug = 'woven' THEN 6
    WHEN slug = 'activewear' THEN 4
    WHEN slug = 'accessories' THEN 8
    WHEN slug = 'outerwear' THEN 0  -- Оставляем 0 для outerwear, так как не указано в требованиях
    ELSE factory_count
END
WHERE slug IN ('denim', 'knit', 'woven', 'activewear', 'accessories', 'outerwear');

-- Проверка обновления
SELECT 
    slug,
    name,
    factory_count,
    avg_moq,
    avg_lead_time
FROM categories 
ORDER BY factory_count DESC;

-- Обновление общей статистики (если есть отдельная таблица статистики)
-- Если нет отдельной таблицы, статистика будет вычисляться из суммы factory_count

-- Проверка общей суммы фабрик
SELECT 
    'Общее количество фабрик' as metric,
    SUM(factory_count) as total_count
FROM categories;

-- Детальная статистика по категориям
SELECT 
    'Статистика по категориям' as section,
    '' as metric,
    '' as value;

SELECT 
    name as category,
    factory_count as factories,
    avg_moq as avg_moq,
    avg_lead_time as avg_lead_time
FROM categories 
ORDER BY factory_count DESC;

-- ============================================================================
-- РЕЗУЛЬТАТ ОБНОВЛЕНИЯ:
-- ============================================================================
-- Деним: 5 фабрик
-- Трикотаж: 7 фабрик  
-- Ткань: 6 фабрик
-- Спортивная одежда: 4 фабрики
-- Аксессуары: 8 фабрик
-- Общее количество: 30 фабрик
-- ============================================================================
