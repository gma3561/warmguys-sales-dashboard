const { createClient } = require('@supabase/supabase-js');

// HTML에서 가져온 실제 Supabase 설정
const supabaseUrl = 'https://ooqexropurnslqmcbjqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNianFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NzQyMDUsImV4cCI6MjA2MzA1MDIwNX0.yXVabtxZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbuA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllTables() {
    console.log('🔍 Apps Script에서 사용하는 테이블 확인 중...\n');
    
    // Apps Script에서 사용하는 테이블들
    const appsScriptTables = [
        'apgujeong_apgujung_sales',  // 압구정곱창 압구정점
        'apgujeong_garosu_sales',    // 압구정곱창 가로수점
        'mrs_sales',                  // 엠알에스
        'apgujeong_sales',           // 기존 테이블
        'warmguys_sales'             // 기존 테이블
    ];
    
    for (const tableName of appsScriptTables) {
        console.log(`\n📊 ${tableName} 테이블 확인:`);
        
        try {
            // 테이블 존재 확인 및 데이터 조회
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .order('date', { ascending: false })
                .limit(5);
                
            if (error) {
                console.log(`❌ 테이블 없음 또는 오류: ${error.message}`);
                continue;
            }
            
            console.log(`✅ 테이블 존재 - ${data.length}개 레코드 조회됨`);
            
            if (data.length > 0) {
                // 컬럼 확인
                console.log(`   컬럼: ${Object.keys(data[0]).join(', ')}`);
                
                // 최신 데이터 확인
                console.log(`   최신 데이터:`);
                data.forEach(row => {
                    if (tableName.includes('apgujeong')) {
                        console.log(`     ${row.date}: 총매출 ${row.total_sales?.toLocaleString()}원, 고객수 ${row.customer_count}명`);
                    } else if (tableName === 'mrs_sales') {
                        console.log(`     ${row.date}: 총매출 ${row.total_sales?.toLocaleString()}원`);
                    } else {
                        console.log(`     ${row.date}: ${JSON.stringify(row).substring(0, 100)}...`);
                    }
                });
                
                // 전체 데이터 수 확인
                const { count } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact', head: true });
                    
                console.log(`   전체 레코드 수: ${count}개`);
                
                // 날짜 범위 확인
                const { data: dateRange } = await supabase
                    .from(tableName)
                    .select('date')
                    .order('date', { ascending: true })
                    .limit(1);
                    
                const { data: latestDate } = await supabase
                    .from(tableName)
                    .select('date')
                    .order('date', { ascending: false })
                    .limit(1);
                    
                if (dateRange && dateRange[0] && latestDate && latestDate[0]) {
                    console.log(`   날짜 범위: ${dateRange[0].date} ~ ${latestDate[0].date}`);
                }
            }
            
        } catch (err) {
            console.log(`❌ 예외 발생: ${err.message}`);
        }
    }
    
    // 압구정점 6월 데이터 특별 확인
    console.log('\n\n🔍 압구정점 2025년 6월 데이터 확인:');
    
    for (const tableName of ['apgujeong_apgujung_sales', 'apgujeong_garosu_sales']) {
        console.log(`\n${tableName}:`);
        
        try {
            const { data: juneData, error } = await supabase
                .from(tableName)
                .select('*')
                .gte('date', '2025-06-01')
                .lte('date', '2025-06-30')
                .order('date', { ascending: true });
                
            if (!error && juneData) {
                console.log(`  6월 데이터: ${juneData.length}개`);
                if (juneData.length > 0) {
                    console.log(`  첫 3개 데이터:`);
                    juneData.slice(0, 3).forEach(row => {
                        console.log(`    ${row.date}: ${row.total_sales?.toLocaleString()}원`);
                    });
                }
            }
        } catch (err) {
            console.log(`  오류: ${err.message}`);
        }
    }
}

checkAllTables(); 