const { chromium } = require('playwright');
const { uploadScreenshotToSlack } = require('./send-screenshot-with-bot');
const fs = require('fs');
const path = require('path');

// 대시보드 설정
const DASHBOARDS = [
    {
        name: '압구정점',
        title: '압구정곱창 압구정점',
        url: 'https://gma3561.github.io/warmguys_sales/dashboard/apgujeong/',
        selectBranch: 'apgujung'
    },
    {
        name: '가로수점',
        title: '압구정곱창 가로수점', 
        url: 'https://gma3561.github.io/warmguys_sales/dashboard/apgujeong/',
        selectBranch: 'garosu'
    },
    {
        name: '엠알에스',
        title: '엠알에스',
        url: 'https://gma3561.github.io/warmguys_sales/dashboard/mrs/',
        selectBranch: null
    }
];

async function captureAndSendAllDashboards() {
    let browser = null;
    
    try {
        console.log('🚀 모든 대시보드 캡처 시작...\n');
        browser = await chromium.launch({
            headless: true
        });

        const context = await browser.newContext({
            viewport: { width: 1400, height: 1000 }
        });
        
        const page = await context.newPage();
        
        // 먼저 메인 페이지로 이동해서 로그인
        console.log('🔐 로그인 중...');
        await page.goto('https://gma3561.github.io/warmguys_sales/', {
            waitUntil: 'networkidle',
            timeout: 60000
        });
        
        // 로그인 처리
        try {
            await page.waitForSelector('#username', { timeout: 5000 });
            await page.fill('#username', 'Warmguys');
            await page.fill('#password', 'Eksha12!@');
            await page.click('button.btn');
            console.log('✅ 로그인 완료');
            await page.waitForTimeout(2000);
        } catch (e) {
            console.log('🔓 이미 로그인됨');
        }
        
        // 각 대시보드 캡처
        for (let i = 0; i < DASHBOARDS.length; i++) {
            const dashboard = DASHBOARDS[i];
            console.log(`\n📸 ${dashboard.title} 대시보드 캡처 중...`);
            
            try {
                // 대시보드로 이동
                await page.goto(dashboard.url, { 
                    waitUntil: 'networkidle',
                    timeout: 60000 
                });
                
                // 현재 페이지 내용 기록 (디버깅용)
                console.log('📝 현재 페이지 HTML 구조 분석 중...');
                
                // 페이지에서 사용 가능한 요소 파악
                try {
                    const hasSelectElement = await page.evaluate(() => !!document.querySelector('#branch-select'));
                    console.log(`🔍 #branch-select 요소 존재 여부: ${hasSelectElement}`);
                
                    const branchButtons = await page.evaluate(() => {
                        const buttons = Array.from(document.querySelectorAll('button')).filter(
                            b => b.textContent.includes('압구정점') || b.textContent.includes('가로수점')
                        );
                        return buttons.map(b => b.textContent.trim());
                    });
                    console.log(`🔍 지점 관련 버튼: ${branchButtons.join(', ')}`);
                } catch (evalErr) {
                    console.error('❌ 페이지 평가 오류:', evalErr.message);
                }
                
                // 지점 선택 시도
                if (dashboard.selectBranch) {
                    // 1. 먼저 드롭다운 선택 방식 시도
                    try {
                        await page.waitForSelector('#branch-select', { timeout: 3000 });
                        await page.selectOption('#branch-select', dashboard.selectBranch);
                        console.log(`🏢 ${dashboard.name} 선택 완료 (드롭다운 사용)`);
                        await page.waitForTimeout(3000); // 데이터 로드 대기
                    } catch (selectErr) {
                        console.log(`ℹ️ 드롭다운 선택 방식 실패: ${selectErr.message}`);
                        
                        // 2. 버튼 텍스트로 검색 시도
                        try {
                            const branchText = dashboard.selectBranch === 'apgujung' ? '압구정점' : '가로수점';
                            
                            // 정확한 텍스트가 있는 버튼 찾기 (evaluate로 더 정확하게)
                            const buttonExists = await page.evaluate((text) => {
                                const buttons = Array.from(document.querySelectorAll('button'));
                                const targetButton = buttons.find(b => b.textContent.trim() === text);
                                if (targetButton) {
                                    targetButton.click(); // 클라이언트 측에서 클릭
                                    return true;
                                }
                                return false;
                            }, branchText);
                            
                            if (buttonExists) {
                                console.log(`🏢 ${dashboard.name} 선택 완료 (버튼 텍스트 정확히 일치)`);
                                await page.waitForTimeout(3000); // 데이터 로드 대기
                            } else {
                                // 3. 부분 텍스트 검색
                                console.log(`ℹ️ 정확한 텍스트 버튼 찾기 실패, 부분 일치 시도...`);
                                try {
                                    await page.click(`button:has-text("${branchText}")`, { timeout: 3000 });
                                    console.log(`🏢 ${dashboard.name} 선택 완료 (버튼 부분 텍스트 일치)`);
                                    await page.waitForTimeout(3000); // 데이터 로드 대기
                                } catch (partialTextErr) {
                                    console.error(`❌ 모든 지점 선택 방법 실패: ${partialTextErr.message}`);
                                }
                            }
                        } catch (buttonErr) {
                            console.error(`❌ 버튼 검색 오류: ${buttonErr.message}`);
                        }
                    }
                }
                
                // 페이지 로드 대기
                await page.waitForTimeout(5000);
                
                // 스크린샷 촬영
                const now = new Date();
                const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
                const filename = `${dashboard.name.replace(/\s/g, '_')}_dashboard_${timestamp}.png`;
                
                const screenshotsPath = path.join(__dirname, '../screenshots', filename);
                const screenshotsDir = path.dirname(screenshotsPath);
                
                if (!fs.existsSync(screenshotsDir)) {
                    fs.mkdirSync(screenshotsDir, { recursive: true });
                }
                
                await page.screenshot({
                    path: screenshotsPath,
                    fullPage: true
                });
                
                console.log(`💾 스크린샷 저장: ${filename}`);
                
                // Slack으로 전송 (제목 전달)
                console.log(`📤 Slack으로 전송 중...`);
                await uploadScreenshotToSlack(dashboard.title);
                console.log(`✅ ${dashboard.title} 완료`);
                
                // 마지막이 아니면 15초 대기
                if (i < DASHBOARDS.length - 1) {
                    console.log(`⏳ 15초 대기 중...`);
                    await page.waitForTimeout(15000);
                }
                
            } catch (error) {
                console.error(`❌ ${dashboard.title} 오류:`, error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ 전체 프로세스 오류:', error);
    } finally {
        if (browser) {
            await browser.close();
            console.log('\n🔚 브라우저 종료');
        }
    }
}

// 스크립트 실행
if (require.main === module) {
    captureAndSendAllDashboards().then(() => {
        console.log('\n🎉 모든 대시보드 캡처 완료!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ 스크립트 실행 오류:', error);
        process.exit(1);
    });
}

module.exports = { captureAndSendAllDashboards }; 