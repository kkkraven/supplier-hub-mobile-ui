// ============================================================================
// FACTORY ACCESS LIMITS API ROUTE
// ============================================================================
// API для проверки и увеличения лимитов доступа к фабрикам
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// ============================================================================
// 1. POST HANDLER - ПРОВЕРКА И УВЕЛИЧЕНИЕ ДОСТУПА К ФАБРИКЕ
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
    const { factory_id } = await request.json();

    if (!factory_id) {
      return NextResponse.json(
        { success: false, error: 'Missing factory_id' },
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

    // Проверяем, не превышен ли лимит
    if (limits.factories_remaining <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Factory access limit exceeded',
        data: {
          limit_exceeded: true,
          current_plan: limits.plan_name,
          factories_used: limits.factories_used,
          factories_limit: limits.factories_limit,
          suggested_plan: getSuggestedUpgradePlan(limits.plan_name)
        }
      }, { status: 403 });
    }

    // Проверяем, не был ли уже доступ к этой фабрике
    const { data: existingAccess } = await supabase
      .from('user_factory_access')
      .select('id')
      .eq('user_id', user.id)
      .eq('factory_id', factory_id)
      .single();

    if (existingAccess) {
      // Доступ уже был, просто возвращаем успех
      return NextResponse.json({
        success: true,
        data: {
          already_accessed: true,
          factories_remaining: limits.factories_remaining
        }
      });
    }

    // Увеличиваем счетчик доступа к фабрикам
    const { error: incrementError } = await supabase
      .rpc('increment_factory_access', {
        user_id: user.id,
        factory_id: factory_id
      });

    if (incrementError) {
      console.error('Error incrementing factory access:', incrementError);
      return NextResponse.json(
        { success: false, error: 'Failed to record factory access' },
        { status: 500 }
      );
    }

    // Получаем обновленные лимиты
    const { data: updatedLimits } = await supabase
      .rpc('get_user_limits', { user_id: user.id });

    // Логируем активность
    await supabase
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        action: 'factory_access',
        resource_type: 'factory',
        resource_id: factory_id,
        metadata: {
          factories_used: updatedLimits?.factories_used || limits.factories_used + 1,
          factories_remaining: (updatedLimits?.factories_remaining || limits.factories_remaining) - 1,
          plan_name: limits.plan_name
        }
      });

    return NextResponse.json({
      success: true,
      data: {
        access_granted: true,
        factories_used: updatedLimits?.factories_used || limits.factories_used + 1,
        factories_remaining: Math.max(0, (updatedLimits?.factories_remaining || limits.factories_remaining) - 1),
        factories_limit: limits.factories_limit
      }
    });

  } catch (error) {
    console.error('Error processing factory access:', error);
    
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
// 2. GET HANDLER - ПОЛУЧЕНИЕ СТАТУСА ДОСТУПА К ФАБРИКЕ
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const factoryId = searchParams.get('factory_id');
    
    // Проверяем аутентификацию
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!factoryId) {
      return NextResponse.json(
        { success: false, error: 'Missing factory_id parameter' },
        { status: 400 }
      );
    }

    // Проверяем доступ к конкретной фабрике
    const { data: access } = await supabase
      .from('user_factory_access')
      .select('*')
      .eq('user_id', user.id)
      .eq('factory_id', factoryId)
      .single();

    // Получаем общие лимиты
    const { data: limits } = await supabase
      .rpc('get_user_limits', { user_id: user.id });

    return NextResponse.json({
      success: true,
      data: {
        has_access: !!access,
        access_date: access?.created_at || null,
        factories_used: limits?.factories_used || 0,
        factories_remaining: limits?.factories_remaining || 0,
        factories_limit: limits?.factories_limit || null,
        plan_name: limits?.plan_name || null
      }
    });

  } catch (error) {
    console.error('Error checking factory access:', error);
    
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
