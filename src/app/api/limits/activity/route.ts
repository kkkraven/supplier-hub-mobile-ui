// ============================================================================
// USER ACTIVITY API ROUTE
// ============================================================================
// API для получения активности пользователя по лимитам
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// ============================================================================
// 1. GET HANDLER - ПОЛУЧЕНИЕ АКТИВНОСТИ ПОЛЬЗОВАТЕЛЯ
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    // Параметры запроса
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const action = searchParams.get('action'); // 'factory_access', 'rfq_created', etc.
    const days = parseInt(searchParams.get('days') || '30'); // За последние N дней
    
    // Проверяем аутентификацию
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Вычисляем дату начала периода
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Базовый запрос активности
    let query = supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Фильтр по типу действия
    if (action) {
      query = query.eq('action', action);
    }

    const { data: activities, error: activitiesError, count } = await query;

    if (activitiesError) {
      console.error('Error fetching user activities:', activitiesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch activities' },
        { status: 500 }
      );
    }

    // Получаем статистику активности
    const { data: stats } = await supabase
      .from('user_activity_log')
      .select('action')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    // Группируем статистику по типам действий
    const activityStats = stats?.reduce((acc: Record<string, number>, item) => {
      acc[item.action] = (acc[item.action] || 0) + 1;
      return acc;
    }, {}) || {};

    // Получаем ежедневную статистику
    const { data: dailyStats } = await supabase
      .from('user_activity_log')
      .select('created_at, action')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Группируем по дням
    const dailyActivity = dailyStats?.reduce((acc: Record<string, number>, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}) || {};

    return NextResponse.json({
      success: true,
      data: {
        activities: activities || [],
        total_count: count || 0,
        stats: {
          total_activities: stats?.length || 0,
          by_action: activityStats,
          daily_activity: dailyActivity,
          period_days: days
        },
        pagination: {
          limit,
          offset,
          has_more: (count || 0) > offset + limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user activity:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// 2. POST HANDLER - ЛОГИРОВАНИЕ АКТИВНОСТИ
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Проверяем аутентификацию
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Парсим данные запроса
    const { 
      action, 
      resource_type, 
      resource_id, 
      metadata 
    } = await request.json();

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    // Создаем запись активности
    const { data: activity, error: insertError } = await supabase
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        action,
        resource_type,
        resource_id,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error logging user activity:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to log activity' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        activity_id: activity.id,
        logged_at: activity.created_at
      }
    });

  } catch (error) {
    console.error('Error logging user activity:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// 3. EXPORT ROUTE HANDLERS
// ============================================================================

export { GET, POST };
