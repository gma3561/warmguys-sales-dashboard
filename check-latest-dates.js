const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = 'https://ooqexropurnslqmcbjqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNianFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NzQyMDUsImV4cCI6MjA2MzA1MDIwNX0.yXVabtxZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbuA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestDates() {
  console.log('📅 각 테이블 최신 데이터 날짜 확인 중...\n');
  
  const tables = [
    { name: 'apgujeong_apgujung_sales', dateField: 'date', description: '압구정점 매출' },
    { name: 'garosu_sales', dateField: 'date', description: '가로수점 매출' },
    { name: 'mrs_sales', dateField: 'date', description: '엠알에스 매출' },
    { name: 'geukjin_sales', dateField: 'date', description: '극진이앤지 매출' },
    { name: 'fuel_transactions', dateField: 'transaction_date', description: '연료 거래 내역' }
  ];
  
  for (const table of tables) {
    try {
      console.log(`📊 ${table.description} (${table.name}):`);
      
      // 최신 데이터 날짜 확인
      const { data: latestData, error: latestError } = await supabase
        .from(table.name)
        .select(table.dateField)
        .order(table.dateField, { ascending: false })
        .limit(1);
        
      if (latestError) {
        console.log(`   ❌ 오류: ${latestError.message}`);
        continue;
      }
      
      if (latestData && latestData.length > 0) {
        const latestDate = latestData[0][table.dateField];
        console.log(`   📅 최신 데이터 날짜: ${latestDate}`);
        
        // 6월 데이터 개수 확인
        const { count: juneCount, error: juneError } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true })
          .gte(table.dateField, '2025-06-01')
          .lte(table.dateField, '2025-06-30');
          
        if (!juneError) {
          console.log(`   🗓️ 6월 데이터: ${juneCount}개`);
        }
        
        // 최근 7일 데이터 확인
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
        
        const { count: recentCount, error: recentError } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true })
          .gte(table.dateField, sevenDaysAgoStr);
          
        if (!recentError) {
          console.log(`   📊 최근 7일 데이터: ${recentCount}개`);
        }
      } else {
        console.log(`   ❌ 데이터 없음`);
      }
      
      console.log('');
    } catch (err) {
      console.log(`   ❌ 예외 발생: ${err.message}\n`);
    }
  }
}

checkLatestDates();