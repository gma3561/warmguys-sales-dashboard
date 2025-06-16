// 따스한놈들 더미 데이터 직접 삽입 스크립트
const warmguysData = [
  {date: '2025-05-01', coupang_rocket: 1450000, smart_store: 950000, coupang_wing: 550000, other_online: 250000, wholesale: 2500000, export: 1200000, total_sales: 6900000, refund_amount: 120000, order_count: 138, notes: '월초 할인 이벤트'},
  {date: '2025-05-02', coupang_rocket: 1320000, smart_store: 1100000, coupang_wing: 480000, other_online: 310000, wholesale: 2100000, export: 1500000, total_sales: 6810000, refund_amount: 95000, order_count: 136, notes: ''},
  {date: '2025-05-03', coupang_rocket: 1550000, smart_store: 1020000, coupang_wing: 620000, other_online: 350000, wholesale: 1900000, export: 1700000, total_sales: 7140000, refund_amount: 110000, order_count: 143, notes: '주말 매출 증가'},
  {date: '2025-05-04', coupang_rocket: 1600000, smart_store: 1080000, coupang_wing: 580000, other_online: 390000, wholesale: 1800000, export: 1800000, total_sales: 7250000, refund_amount: 105000, order_count: 145, notes: '주말 매출 호조'},
  {date: '2025-05-05', coupang_rocket: 1300000, smart_store: 920000, coupang_wing: 470000, other_online: 280000, wholesale: 2300000, export: 1100000, total_sales: 6370000, refund_amount: 130000, order_count: 127, notes: '어린이날 특별 할인'},
  {date: '2025-05-06', coupang_rocket: 1480000, smart_store: 990000, coupang_wing: 510000, other_online: 320000, wholesale: 2000000, export: 1400000, total_sales: 6700000, refund_amount: 115000, order_count: 134, notes: ''},
  {date: '2025-05-07', coupang_rocket: 1530000, smart_store: 1010000, coupang_wing: 590000, other_online: 330000, wholesale: 2200000, export: 1600000, total_sales: 7260000, refund_amount: 100000, order_count: 145, notes: ''},
  {date: '2025-05-08', coupang_rocket: 1390000, smart_store: 970000, coupang_wing: 530000, other_online: 300000, wholesale: 2400000, export: 1300000, total_sales: 6890000, refund_amount: 125000, order_count: 138, notes: ''},
  {date: '2025-05-09', coupang_rocket: 1420000, smart_store: 1050000, coupang_wing: 560000, other_online: 340000, wholesale: 2150000, export: 1450000, total_sales: 6970000, refund_amount: 110000, order_count: 139, notes: ''},
  {date: '2025-05-10', coupang_rocket: 1580000, smart_store: 1120000, coupang_wing: 600000, other_online: 380000, wholesale: 1950000, export: 1650000, total_sales: 7280000, refund_amount: 105000, order_count: 146, notes: '주말 매출 증가'},
  {date: '2025-05-11', coupang_rocket: 1620000, smart_store: 1160000, coupang_wing: 620000, other_online: 400000, wholesale: 1850000, export: 1750000, total_sales: 7400000, refund_amount: 90000, order_count: 148, notes: '주말 매출 호조'},
  {date: '2025-05-12', coupang_rocket: 1350000, smart_store: 940000, coupang_wing: 490000, other_online: 290000, wholesale: 2250000, export: 1200000, total_sales: 6520000, refund_amount: 120000, order_count: 130, notes: ''},
  {date: '2025-05-13', coupang_rocket: 1460000, smart_store: 980000, coupang_wing: 520000, other_online: 310000, wholesale: 2050000, export: 1350000, total_sales: 6670000, refund_amount: 130000, order_count: 133, notes: ''},
  {date: '2025-05-14', coupang_rocket: 1510000, smart_store: 1030000, coupang_wing: 570000, other_online: 330000, wholesale: 2180000, export: 1550000, total_sales: 7170000, refund_amount: 115000, order_count: 143, notes: ''},
  {date: '2025-05-15', coupang_rocket: 1680000, smart_store: 1200000, coupang_wing: 640000, other_online: 420000, wholesale: 2300000, export: 1900000, total_sales: 8140000, refund_amount: 95000, order_count: 163, notes: '중순 급상승'},
  {date: '2025-05-16', coupang_rocket: 1700000, smart_store: 1250000, coupang_wing: 680000, other_online: 450000, wholesale: 2400000, export: 2000000, total_sales: 8480000, refund_amount: 85000, order_count: 170, notes: '프로모션 효과'},
  {date: '2025-05-17', coupang_rocket: 1750000, smart_store: 1300000, coupang_wing: 700000, other_online: 470000, wholesale: 2350000, export: 2100000, total_sales: 8670000, refund_amount: 80000, order_count: 173, notes: '주말 최고 매출'},
  {date: '2025-05-18', coupang_rocket: 1720000, smart_store: 1280000, coupang_wing: 690000, other_online: 460000, wholesale: 2250000, export: 2050000, total_sales: 8450000, refund_amount: 90000, order_count: 169, notes: '주말 호조세 지속'},
  {date: '2025-05-19', coupang_rocket: 1430000, smart_store: 1050000, coupang_wing: 550000, other_online: 320000, wholesale: 2100000, export: 1400000, total_sales: 6850000, refund_amount: 110000, order_count: 137, notes: '주초 안정화'},
  {date: '2025-05-20', coupang_rocket: 1490000, smart_store: 1100000, coupang_wing: 580000, other_online: 340000, wholesale: 2150000, export: 1500000, total_sales: 7160000, refund_amount: 100000, order_count: 143, notes: '오늘'}
];

// API 함수
async function insertWarmguysData() {
  const SUPABASE_URL = 'https://ooqexropurnslqmcbjqk.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNiamxxayIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ3NDc0MjA1LCJleHAiOjIwNjMwNTAyMDV9.yXVabxtZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbA';

  try {
    // 데이터 삭제
    console.log('기존 데이터 삭제 중...');
    const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/warmguys_sales?id=neq.0`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      }
    });
    
    if (!deleteResponse.ok) {
      throw new Error(`데이터 삭제 실패: ${deleteResponse.statusText}`);
    }
    
    // 데이터 삽입
    console.log('새 데이터 삽입 중...');
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/warmguys_sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(warmguysData)
    });
    
    if (!insertResponse.ok) {
      throw new Error(`데이터 삽입 실패: ${insertResponse.statusText}`);
    }
    
    console.log('따스한놈들 더미 데이터 삽입 완료!');
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

// 실행
document.addEventListener('DOMContentLoaded', function() {
  const insertButton = document.getElementById('insert-data');
  
  if (insertButton) {
    insertButton.addEventListener('click', async function() {
      this.disabled = true;
      this.textContent = '데이터 삽입 중...';
      
      try {
        await insertWarmguysData();
        this.textContent = '데이터 삽입 완료!';
        setTimeout(() => {
          this.textContent = '더미 데이터 다시 삽입';
          this.disabled = false;
        }, 3000);
      } catch (error) {
        console.error('Error:', error);
        this.textContent = '오류 발생';
        this.disabled = false;
      }
    });
  }
});