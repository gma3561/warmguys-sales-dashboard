import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Slack 알림 전송 함수
async function sendSlackAlert(webhookUrl: string, message: string, data: any) {
  try {
    const payload = {
      text: message,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${message}*`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "```" + JSON.stringify(data, null, 2) + "```"
          }
        }
      ]
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error("Slack 알림 전송 실패:", error)
    return false
  }
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

    const { type, threshold = 0.3, affiliate_key = 'MRS' } = await req.json()

    if (type === 'anomaly_detection') {
      // 이상치 감지 함수 호출
      const { data: anomalies, error } = await supabase.rpc(
        'detect_anomalies',
        { p_affiliate_key: affiliate_key, p_threshold: threshold }
      )

      if (error) throw error

      if (anomalies && anomalies.length > 0) {
        // 환경 변수에서 Slack Webhook URL 가져오기
        const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL')
        
        if (slackWebhookUrl) {
          const message = `🚨 매출 이상치 감지: ${anomalies.length}개의 이상 데이터가 발견되었습니다.`
          await sendSlackAlert(slackWebhookUrl, message, anomalies)
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            anomalies,
            message: `${anomalies.length}개의 이상 데이터가 감지되었습니다.`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        return new Response(
          JSON.stringify({ success: true, message: "이상 데이터가 감지되지 않았습니다." }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else if (type === 'sync_failure') {
      // 최근 동기화 실패 확인
      const { data: failedSyncs, error } = await supabase
        .from('data_sync_log')
        .select('*')
        .eq('affiliate_key', affiliate_key)
        .eq('status', 'error')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      if (failedSyncs && failedSyncs.length > 0) {
        // 환경 변수에서 Slack Webhook URL 가져오기
        const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL')
        
        if (slackWebhookUrl) {
          const message = `⚠️ 데이터 동기화 실패: ${affiliate_key} 계열사의 최근 동기화 실패가 감지되었습니다.`
          await sendSlackAlert(slackWebhookUrl, message, failedSyncs[0])
        }

        return new Response(
          JSON.stringify({ success: true, failed_syncs: failedSyncs }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        return new Response(
          JSON.stringify({ success: true, message: "최근 실패한 동기화가 없습니다." }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      return new Response(
        JSON.stringify({ error: "지원되지 않는 알림 유형입니다." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 