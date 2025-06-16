import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 어제 날짜 계산
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // 지난주 동일 요일 계산
    const lastWeek = new Date(yesterday)
    lastWeek.setDate(lastWeek.getDate() - 7)
    const lastWeekStr = lastWeek.toISOString().split('T')[0]

    // 어제 매출 데이터 조회
    const { data: salesData, error: salesError } = await supabase
      .from('mrs_sales')
      .select('*')
      .eq('date', yesterdayStr)
      .single()

    if (salesError && salesError.code !== 'PGRST116') {
      throw salesError
    }

    // 지난주 동일 요일 매출 데이터 조회
    const { data: lastWeekData, error: lastWeekError } = await supabase
      .from('mrs_sales')
      .select('*')
      .eq('date', lastWeekStr)
      .single()

    if (lastWeekError && lastWeekError.code !== 'PGRST116') {
      throw lastWeekError
    }

    // 데이터가 없으면 오류 반환
    if (!salesData) {
      return new Response(
        JSON.stringify({ error: '어제 매출 데이터가 없습니다.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 전주 대비 성장률 계산
    let growthRate = null
    if (lastWeekData) {
      growthRate = ((salesData.total_sales - lastWeekData.total_sales) / lastWeekData.total_sales) * 100
    }

    // 채널별 비중 계산
    const channels = {
      coupang_rocket: {
        amount: salesData.coupang_rocket,
        percentage: (salesData.coupang_rocket / salesData.total_sales) * 100
      },
      smart_store: {
        amount: salesData.smart_store,
        percentage: (salesData.smart_store / salesData.total_sales) * 100
      },
      coupang_wing: {
        amount: salesData.coupang_wing,
        percentage: (salesData.coupang_wing / salesData.total_sales) * 100
      },
      other_online: {
        amount: salesData.other_online,
        percentage: (salesData.other_online / salesData.total_sales) * 100
      },
      wholesale: {
        amount: salesData.wholesale,
        percentage: (salesData.wholesale / salesData.total_sales) * 100
      },
      export: {
        amount: salesData.export,
        percentage: (salesData.export / salesData.total_sales) * 100
      }
    }

    // 보고서 생성
    const report = {
      date: yesterdayStr,
      total_sales: salesData.total_sales,
      week_over_week_growth: growthRate,
      channels,
      refund: {
        amount: salesData.refund_amount,
        details: salesData.refund_details
      },
      notes: salesData.notes
    }

    return new Response(
      JSON.stringify({ success: true, report }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 