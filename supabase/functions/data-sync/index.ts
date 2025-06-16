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

    const { affiliate_key } = await req.json()

    // 동기화 로그 시작
    const { data: logEntry, error: logError } = await supabase
      .from('data_sync_log')
      .insert({
        affiliate_key,
        status: 'pending'
      })
      .select()
      .single()
    
    if (logError) throw logError

    // 계열사 설정 정보 가져오기
    const { data: config, error: configError } = await supabase
      .from('affiliate_config')
      .select('*')
      .eq('affiliate_key', affiliate_key)
      .single()
    
    if (configError) throw configError

    // 여기에 실제 동기화 로직 구현
    // 예: Google Sheets API를 통해 데이터 가져오기

    const startTime = Date.now()
    let rowsProcessed = 0
    // 동기화 성공 가정 - 실제로는 동기화 로직 구현 필요

    // 성공 시 로그 업데이트
    const { error: updateError } = await supabase
      .from('data_sync_log')
      .update({
        status: 'success',
        sync_completed_at: new Date().toISOString(),
        rows_processed: rowsProcessed,
        rows_successful: rowsProcessed,
        execution_time_ms: Date.now() - startTime
      })
      .eq('id', logEntry.id)
    
    if (updateError) throw updateError

    // 계열사 설정 업데이트
    await supabase
      .from('affiliate_config')
      .update({
        last_successful_sync: new Date().toISOString()
      })
      .eq('affiliate_key', affiliate_key)

    return new Response(
      JSON.stringify({ 
        success: true, 
        log_id: logEntry.id,
        rows_processed: rowsProcessed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 