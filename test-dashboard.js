const { chromium } = require('playwright');

async function testDashboard() {
    const browser = await chromium.launch({ 
        headless: false,  // 브라우저 창 표시
        devtools: true    // 개발자 도구 열기
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 콘솔 메시지 캡처
    page.on('console', msg => {
        console.log(`[브라우저 콘솔] ${msg.type()}: ${msg.text()}`);
    });
    
    // 에러 캡처
    page.on('pageerror', error => {
        console.log(`[페이지 에러]`, error.message);
    });
    
    try {
        // 메인 페이지로 이동해서 로그인
        console.log('🔐 로그인 중...');
        await page.goto('https://gma3561.github.io/warmguys_sales/', {
            waitUntil: 'networkidle'
        });
        
        // 로그인
        await page.fill('#username', 'Warmguys');
        await page.fill('#password', 'Eksha12!@');
        await page.click('button.btn');
        await page.waitForTimeout(2000);
        
        // 대시보드로 이동
        console.log('📊 대시보드로 이동...');
        await page.goto('https://gma3561.github.io/warmguys_sales/dashboard/apgujeong/', {
            waitUntil: 'networkidle'
        });
        
        // 데이터 로드 대기
        await page.waitForTimeout(5000);
        
        // 네트워크 요청 확인
        console.log('\n🔍 Supabase API 호출 확인...');
        
        // KPI 카드 확인
        const kpiCards = await page.$$('.kpi-card');
        console.log(`\nKPI 카드 수: ${kpiCards.length}`);
        
        // 테이블 데이터 확인
        const tableRows = await page.$$('#daily-sales-table tbody tr');
        console.log(`테이블 행 수: ${tableRows.length}`);
        
        // 브라우저 콘솔에서 직접 데이터 확인
        const result = await page.evaluate(async () => {
            // Supabase 직접 호출 테스트
            try {
                const { data, error } = await window.supabase
                    .from('apgujeong_apgujung_sales')
                    .select('*')
                    .limit(5)
                    .order('date', { ascending: false });
                    
                return {
                    success: !error,
                    error: error?.message,
                    dataCount: data?.length || 0,
                    sampleData: data?.[0]
                };
            } catch (e) {
                return { success: false, error: e.message };
            }
        });
        
        console.log('\n📊 Supabase 직접 호출 결과:', JSON.stringify(result, null, 2));
        
        // 30초 대기 (수동 확인용)
        console.log('\n⏳ 30초 대기 중... 브라우저에서 직접 확인하세요.');
        await page.waitForTimeout(30000);
        
    } catch (error) {
        console.error('테스트 오류:', error);
    } finally {
        await browser.close();
    }
}

testDashboard(); 