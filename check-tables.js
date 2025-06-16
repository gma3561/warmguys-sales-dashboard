const { createClient } = require('@supabase/supabase-js');

// HTML에서 가져온 실제 Supabase 설정
const supabaseUrl = 'https://ooqexropurnslqmcbjqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNianFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NzQyMDUsImV4cCI6MjA2MzA1MDIwNX0.yXVabtxZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbuA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('🔍 Supabase 테이블 목록 확인 중...\n');
    
    try {
        // 테이블 목록 조회
        const { data, error } = await supabase
            .rpc('get_tables_list');
            
        if (error) {
            console.log('RPC 함수가 없을 수 있습니다. 다른 방법으로 시도...\n');
            
            // 알려진 테이블들 확인
            const tables = [
                'sales_data',
                'apgujeong_sales', 
                'apgujeong',
                'sales',
                'daily_sales',
                'restaurant_sales',
                'warmguys_sales'
            ];
            
            for (const table of tables) {
                try {
                    const { data, error } = await supabase
                        .from(table)
                        .select('*')
                        .limit(1);
                        
                    if (!error) {
                        console.log(`✅ 테이블 발견: ${table}`);
                        
                        // 테이블 구조 확인
                        if (data && data.length > 0) {
                            console.log(`   컬럼: ${Object.keys(data[0]).join(', ')}`);
                        }
                    }
                } catch (e) {
                    // 테이블이 없음
                }
            }
        }
        
        // sales_data 테이블 확인
        console.log('\n📊 sales_data 테이블 데이터 확인:');
        const { data: salesData, error: salesError } = await supabase
            .from('sales_data')
            .select('*')
            .order('date', { ascending: false })
            .limit(10);
            
        if (!salesError && salesData) {
            console.log(`총 ${salesData.length}개 레코드 조회됨`);
            if (salesData.length > 0) {
                console.log('\n최근 데이터 샘플:');
                salesData.forEach(row => {
                    console.log(`날짜: ${row.date}, 지점: ${row.branch || 'N/A'}, 매출: ${row.total_sales?.toLocaleString()}원`);
                });
            }
        }
        
    } catch (err) {
        console.error('❌ 예외 발생:', err);
    }
}

checkTables(); 