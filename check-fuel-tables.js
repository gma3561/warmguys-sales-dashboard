const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = 'https://ooqexropurnslqmcbjqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNianFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NzQyMDUsImV4cCI6MjA2MzA1MDIwNX0.yXVabtxZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbuA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFuelTables() {
  console.log('🔍 극진이앤지 연료 관련 테이블 확인 중...');
  
  const tables = [
    'geukjin_sales',
    'fuel_transactions',
    'fuel_sales'
  ];
  
  for (const table of tables) {
    try {
      console.log(`\n📊 ${table} 테이블 확인 중...`);
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(5);
        
      if (error) {
        console.log(`❌ 테이블 없음 또는 오류: ${error.message}`);
        continue;
      }
      
      console.log(`✅ 테이블 존재함! ${data.length}개 레코드 확인`);
      
      if (data.length > 0) {
        console.log('컬럼 목록:', Object.keys(data[0]).join(', '));
        console.log('샘플 데이터:');
        data.forEach(row => {
          const date = row.date || row.transaction_date || '날짜 없음';
          const sales = row.total_sales || row.amount || row.total_amount || 0;
          console.log(`  ${date}: ${sales.toLocaleString()}원`);
        });
        
        // 전체 건수 확인
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        console.log(`전체 레코드 수: ${count}개`);
        
        // 날짜 범위 확인
        const dateField = data[0].date ? 'date' : (data[0].transaction_date ? 'transaction_date' : null);
        
        if (dateField) {
          const { data: firstDate } = await supabase
            .from(table)
            .select(dateField)
            .order(dateField, { ascending: true })
            .limit(1);
            
          const { data: lastDate } = await supabase
            .from(table)
            .select(dateField)
            .order(dateField, { ascending: false })
            .limit(1);
            
          if (firstDate && firstDate.length > 0 && lastDate && lastDate.length > 0) {
            const first = firstDate[0][dateField];
            const last = lastDate[0][dateField];
            console.log(`날짜 범위: ${first} ~ ${last}`);
          }
        }
      }
    } catch (err) {
      console.log(`테이블 ${table} 확인 중 오류 발생: ${err.message}`);
    }
  }
}

checkFuelTables();