import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ooqexropurnslqmcbjqk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNianFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NzQyMDUsImV4cCI6MjA2MzA1MDIwNX0.yXVabtxZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbuA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 계열사별 테이블 매핑
const AFFILIATE_TABLES = {
  ALL: null, // 전체 뷰를 위한 특별한 키
  MRS: 'mrs_sales',
  WARMGUYS: 'warmguys_sales', 
  APGUJEONG: 'apgujeong_sales',
  GEUKJIN: 'geukjin_sales'
};

// 매출 데이터 가져오기 (계열사별)
export async function getSalesData(period = 30, affiliateKey = 'MRS') {
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - period);
  
  let query;
  
  if (affiliateKey === 'ALL') {
    // 전체 계열사 통합 데이터
    const { data, error } = await supabase
      .from('all_affiliates_view')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });
      
    if (error) {
      console.error('Error fetching all affiliates data:', error);
      return [];
    }
    
    return data;
  } else {
    // 특정 계열사 데이터
    const tableKey = AFFILIATE_TABLES[affiliateKey];
    if (!tableKey) {
      console.error('Invalid affiliate key:', affiliateKey);
      return [];
    }
    
    const { data, error } = await supabase
      .from(tableKey)
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });
      
    if (error) {
      console.error(`Error fetching ${tableKey} data:`, error);
      return [];
    }
    
    return data;
  }
}

// 계열사 설정 가져오기
export async function getAffiliateConfig() {
  const { data, error } = await supabase
    .from('affiliate_config')
    .select('*')
    .eq('is_active', true)
    .order('affiliate_name');
    
  if (error) {
    console.error('Error fetching affiliate config:', error);
    return [];
  }
  
  return data;
}

// 동기화 로그 가져오기
export async function getSyncLogs(limit = 10) {
  const { data, error } = await supabase
    .from('data_sync_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error('Error fetching sync logs:', error);
    return [];
  }
  
  return data;
}

// KPI 계산 함수들
export function calculateKPIs(salesData, affiliateKey = 'MRS') {
  if (!salesData || salesData.length === 0) {
    return {
      totalSales: 0,
      averageDailySales: 0,
      totalOrders: 0,
      refundRate: 0,
      growthRate: 0
    };
  }

  // 계열사별 총 매출 계산 방식
  const totalSales = salesData.reduce((sum, record) => {
    if (affiliateKey === 'APGUJEONG') {
      return sum + (parseFloat(record.total_sales) || 0);
    } else if (affiliateKey === 'GEUKJIN') {
      return sum + (parseFloat(record.total_sales) || 0);
    } else {
      // MRS, WARMGUYS 또는 전체
      return sum + (parseFloat(record.total_sales) || 0);
    }
  }, 0);

  const averageDailySales = totalSales / salesData.length;

  // 총 주문 수 (계열사별로 다른 필드)
  const totalOrders = salesData.reduce((sum, record) => {
    if (affiliateKey === 'APGUJEONG') {
      return sum + (parseInt(record.customer_count) || 0);
    } else {
      return sum + (parseInt(record.order_count) || 0);
    }
  }, 0);

  // 환불율 계산
  const totalRefunds = salesData.reduce((sum, record) => {
    if (affiliateKey === 'GEUKJIN') {
      // 극진이앤지는 환불 개념이 다름 (마진율로 대체)
      return 0;
    } else {
      return sum + (parseFloat(record.refund_amount) || 0);
    }
  }, 0);
  const refundRate = totalSales > 0 ? (totalRefunds / totalSales) * 100 : 0;

  // 성장률 계산 (전일 대비)
  let growthRate = 0;
  if (salesData.length >= 2) {
    const today = salesData[salesData.length - 1];
    const yesterday = salesData[salesData.length - 2];
    const todayTotal = parseFloat(today.total_sales) || 0;
    const yesterdayTotal = parseFloat(yesterday.total_sales) || 0;
    
    if (yesterdayTotal > 0) {
      growthRate = ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
    }
  }

  return {
    totalSales,
    averageDailySales,
    totalOrders,
    refundRate,
    growthRate
  };
}

// 채널별 매출 분석 (MRS, WARMGUYS용)
export function analyzeChannelSales(salesData) {
  if (!salesData || salesData.length === 0) return [];

  const channelTotals = salesData.reduce((acc, record) => {
    acc.coupang_rocket += parseFloat(record.coupang_rocket) || 0;
    acc.smart_store += parseFloat(record.smart_store) || 0;
    acc.coupang_wing += parseFloat(record.coupang_wing) || 0;
    acc.other_online += parseFloat(record.other_online) || 0;
    acc.wholesale += parseFloat(record.wholesale) || 0;
    acc.export += parseFloat(record.export) || 0;
    return acc;
  }, {
    coupang_rocket: 0,
    smart_store: 0, 
    coupang_wing: 0,
    other_online: 0,
    wholesale: 0,
    export: 0
  });

  return [
    { name: '쿠팡로켓', value: channelTotals.coupang_rocket },
    { name: '스마트스토어', value: channelTotals.smart_store },
    { name: '쿠팡윙', value: channelTotals.coupang_wing },
    { name: '기타온라인', value: channelTotals.other_online },
    { name: '도매', value: channelTotals.wholesale },
    { name: '수출', value: channelTotals.export }
  ].filter(channel => channel.value > 0);
}

// 오프라인 매출 분석 (압구정곱창용)
export function analyzeOfflineSales(salesData) {
  if (!salesData || salesData.length === 0) return [];

  const channelTotals = salesData.reduce((acc, record) => {
    acc.card_sales += parseFloat(record.card_sales) || 0;
    acc.cash_sales += parseFloat(record.cash_sales) || 0;
    acc.cash_receipt += parseFloat(record.cash_receipt) || 0;
    acc.delivery_sales += parseFloat(record.delivery_sales) || 0;
    acc.account_transfer += parseFloat(record.account_transfer) || 0;
    return acc;
  }, {
    card_sales: 0,
    cash_sales: 0,
    cash_receipt: 0,
    delivery_sales: 0,
    account_transfer: 0
  });

  return [
    { name: '카드결제', value: channelTotals.card_sales },
    { name: '현금결제', value: channelTotals.cash_sales },
    { name: '현금영수증', value: channelTotals.cash_receipt },
    { name: '배달매출', value: channelTotals.delivery_sales },
    { name: '계좌이체', value: channelTotals.account_transfer }
  ].filter(channel => channel.value > 0);
}

// 연료 매출 분석 (극진이앤지용)
export function analyzeFuelSales(salesData) {
  if (!salesData || salesData.length === 0) return [];

  const fuelTotals = salesData.reduce((acc, record) => {
    acc.gasoline_sales += parseFloat(record.gasoline_sales) || 0;
    acc.diesel_sales += parseFloat(record.diesel_sales) || 0;
    acc.kerosene_sales += parseFloat(record.kerosene_sales) || 0;
    acc.freight_sales += parseFloat(record.freight_sales) || 0;
    return acc;
  }, {
    gasoline_sales: 0,
    diesel_sales: 0,
    kerosene_sales: 0,
    freight_sales: 0
  });

  return [
    { name: '무연휘발유', value: fuelTotals.gasoline_sales },
    { name: '경유', value: fuelTotals.diesel_sales },
    { name: '등유', value: fuelTotals.kerosene_sales },
    { name: '운임', value: fuelTotals.freight_sales }
  ].filter(fuel => fuel.value > 0);
}