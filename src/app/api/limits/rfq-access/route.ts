// ============================================================================
// RFQ ACCESS LIMITS API ROUTE
// ============================================================================
// API для проверки и увеличения лимитов создания RFQ запросов
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// ============================================================================
// 1. POST HANDLER - ПРОВЕРКА И СОЗДАНИЕ RFQ
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
    const { rfq_data } = await request.json();

    if (!rfq_data) {
      return NextResponse.json(
        { success: false, error: 'Missing rfq_data' },
        { status: 400 }
      );
    }

    // Получаем текущие лимиты пользователя
    const { data: limits, error: limitsError } = await supabase
      .rpc('get_user_limits', { user_id: user.id });

    if (limitsError) {
      console.error('Error getting user limits:', limitsError);
      return NextResponse.json(
        { success: false, error: 'Failed to check limits' },
        { status: 500 }
      );
    }

    if (!limits) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 403 }
      );
    }

    // Проверяем, не превышен ли лимит RFQ
    if (limits.rfq_limit !== null && limits.rfq_remaining <= 0) {
      return NextResponse.json({
        success: false,
        error: 'RFQ creation limit exceeded',
        data: {
          limit_exceeded: true,
          current_plan: limits.plan_name,
          rfq_used: limits.rfq_used,
          rfq_limit: limits.rfq_limit,
          suggested_plan: getSuggestedUpgradePlan(limits.plan_name)
        }
      }, { status: 403 });
    }

    // Создаем RFQ запрос
    const { data: rfq, error: rfqError } = await supabase
      .from('rfq_requests')
      .insert({
        user_id: user.id,
        title: rfq_data.title,
        description: rfq_data.description,
        category: rfq_data.category,
        quantity: rfq_data.quantity,
        budget_min: rfq_data.budget_min,
        budget_max: rfq_data.budget_max,
        deadline: rfq_data.deadline,
        requirements: rfq_data.requirements,
        attachments: rfq_data.attachments,
        target_countries: rfq_data.target_countries,
        status: 'draft'
      })
      .select()
      .single();

    if (rfqError) {
      console.error('Error creating RFQ:', rfqError);
      return NextResponse.json(
        { success: false, error: 'Failed to create RFQ' },
        { status: 500 }
      );
    }

    // Увеличиваем счетчик RFQ (только если есть лимит)
    if (limits.rfq_limit !== null) {
      const { error: incrementError } = await supabase
        .rpc('increment_rfq_usage', {
          user_id: user.id,
          rfq_id: rfq.id
        });

      if (incrementError) {
        console.error('Error incrementing RFQ usage:', incrementError);
        // Не возвращаем ошибку, так как RFQ уже создан
      }
    }

    // Получаем обновленные лимиты
    const { data: updatedLimits } = await supabase
      .rpc('get_user_limits', { user_id: user.id });

    // Логируем активность
    await supabase
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        action: 'rfq_created',
        resource_type: 'rfq',
        resource_id: rfq.id,
        metadata: {
          rfq_used: updatedLimits?.rfq_used || limits.rfq_used + 1,
          rfq_remaining: updatedLimits?.rfq_remaining || 
            (limits.rfq_limit !== null ? limits.rfq_remaining - 1 : null),
          plan_name: limits.plan_name,
          rfq_title: rfq_data.title
        }
      });

    return NextResponse.json({
      success: true,
      data: {
        rfq_id: rfq.id,
        rfq_used: updatedLimits?.rfq_used || limits.rfq_used + (limits.rfq_limit !== null ? 1 : 0),
        rfq_remaining: updatedLimits?.rfq_remaining || 
          (limits.rfq_limit !== null ? Math.max(0, limits.rfq_remaining - 1) : null),
        rfq_limit: limits.rfq_limit,
        is_unlimited: limits.rfq_limit === null
      }
    });

  } catch (error) {
    console.error('Error processing RFQ creation:', error);
    
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
// 2. GET HANDLER - ПОЛУЧЕНИЕ СТАТУСА ЛИМИТОВ RFQ
// ============================================================================

export async function GET(request: NextRequest) {
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

    // Получаем лимиты RFQ
    const { data: limits } = await supabase
      .rpc('get_user_limits', { user_id: user.id });

    if (!limits) {
      return NextResponse.json({
        success: true,
        data: {
          rfq_used: 0,
          rfq_remaining: 0,
          rfq_limit: null,
          plan_name: null,
          can_create_rfq: false
        }
      });
    }

    // Получаем список RFQ пользователя
    const { data: userRfqs, count: rfqCount } = await supabase
      .from('rfq_requests')
      .select('id, title, status, created_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        rfq_used: limits.rfq_used,
        rfq_remaining: limits.rfq_remaining,
        rfq_limit: limits.rfq_limit,
        plan_name: limits.plan_name,
        can_create_rfq: limits.rfq_limit === null || limits.rfq_remaining > 0,
        is_unlimited: limits.rfq_limit === null,
        recent_rfqs: userRfqs || [],
        total_rfqs: rfqCount || 0
      }
    });

  } catch (error) {
    console.error('Error getting RFQ limits:', error);
    
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
// 3. UTILITY FUNCTIONS
// ============================================================================

/**
 * Предлагает план для апгрейда на основе текущего плана
 */
function getSuggestedUpgradePlan(currentPlan: string): string {
  const upgradePath: Record<string, string> = {
    'starter': 'professional',
    'professional': 'enterprise',
    'enterprise': 'enterprise' // Уже максимальный план
  };

  return upgradePath[currentPlan] || 'professional';
}

// ============================================================================
// 4. EXPORT ROUTE HANDLERS
// ============================================================================

export { POST, GET };
