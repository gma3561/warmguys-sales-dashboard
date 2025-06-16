const { createClient } = require('@supabase/supabase-js');

// HTML에서 가져온 실제 Supabase 설정
const supabaseUrl = 'https://ooqexropurnslqmcbjqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNianFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NzQyMDUsImV4cCI6MjA2MzA1MDIwNX0.yXVabtxZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbuA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkApgujeongData() {
    console.log('🔍 압구정곱창 실제 데이터 확인 중...\n');
    
    try {
        // 1. 테이블 존재 확인
        console.log('📊 apgujeong_sales 테이블 데이터 확인:');
        const { data, error } = await supabase
            .from('apgujeong_sales')
            .select('*')
            .order('date', { ascending: false })
            .limit(20);
            
        if (error) {
            console.error('❌ 오류:', error.message);
            return;
        }
        
        console.log(`✅ 총 ${data.length}개 레코드 조회됨\n`);
        
        if (data.length > 0) {
            console.log('📋 최근 데이터 샘플:');
            data.forEach(row => {
                console.log(`날짜: ${row.date}, 총매출: ${row.total_sales?.toLocaleString()}원, 카드매출: ${row.card_sales?.toLocaleString()}원, 테이블회전율: ${row.table_turnover || 'N/A'}`);
            });
            
            // 월별 데이터 집계
            console.log('\n📅 월별 데이터 현황:');
            const { data: monthlyData, error: monthlyError } = await supabase
                .from('apgujeong_sales')
                .select('date, total_sales')
                .order('date', { ascending: true });
                
            if (!monthlyError && monthlyData) {
                const monthStats = {};
                monthlyData.forEach(row => {
                    const month = row.date.substring(0, 7);
                    if (!monthStats[month]) {
                        monthStats[month] = { count: 0, total: 0 };
                    }
                    monthStats[month].count++;
                    monthStats[month].total += row.total_sales || 0;
                });
                
                Object.entries(monthStats).forEach(([month, stats]) => {
                    console.log(`${month}: ${stats.count}개 레코드, 총 매출: ${stats.total.toLocaleString()}원`);
                });
            }
            
            // 6월 데이터 특별 확인
            console.log('\n🔍 2025년 6월 데이터 확인:');
            const { data: juneData, error: juneError } = await supabase
                .from('apgujeong_sales')
                .select('*')
                .gte('date', '2025-06-01')
                .lte('date', '2025-06-30')
                .order('date', { ascending: true });
                
            if (!juneError && juneData) {
                console.log(`6월 데이터: ${juneData.length}개 레코드`);
                if (juneData.length > 0) {
                    juneData.slice(0, 5).forEach(row => {
                        console.log(`  ${row.date}: ${row.total_sales?.toLocaleString()}원`);
                    });
                }
            }
        } else {
            console.log('⚠️ 데이터가 없습니다.');
        }
        
    } catch (err) {
        console.error('❌ 예외 발생:', err);
    }
}

checkApgujeongData(); 