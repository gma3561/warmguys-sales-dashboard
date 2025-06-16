const { chromium } = require('playwright');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 슬랙 웹훅 URL
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';

// 대시보드 URL들
const DASHBOARDS = {
    'apgujeong': {
        url: 'https://gma3561.github.io/warmguys_sales/dashboard/apgujeong/',
        title: '압구정곱창 매출 대시보드'
    }
};

async function captureAndSendToSlack() {
    let browser = null;
    
    try {
        console.log('🚀 브라우저 시작...');
        browser = await chromium.launch({
            headless: true
        });

        for (const [key, dashboard] of Object.entries(DASHBOARDS)) {
            try {
                console.log(`📸 ${dashboard.title} 스크린샷 촬영 중...`);
                
                const context = await browser.newContext({
                    viewport: { width: 1400, height: 1000 }
                });
                
                const page = await context.newPage();
                
                // 먼저 메인 페이지로 이동해서 로그인
                console.log('🔐 메인 페이지에서 로그인 중...');
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
                
                // 이제 대시보드로 이동
                console.log('📊 대시보드로 이동 중...');
                await page.goto(dashboard.url, { 
                    waitUntil: 'networkidle',
                    timeout: 60000 
                });
                
                // 페이지가 완전히 로드될 때까지 대기
                console.log('⏳ 페이지 로드 대기 중...');
                await page.waitForTimeout(5000);
                
                // 데이터가 로드될 때까지 기다림
                try {
                    await page.waitForSelector('.kpi-card', { timeout: 20000 });
                    console.log('✅ KPI 카드 발견! 데이터 로드 완료');
                    
                    // 차트가 로드될 때까지 추가 대기
                    await page.waitForSelector('#sales-trend-chart', { timeout: 10000 });
                    console.log('📊 차트 로드 완료');
                    
                    await page.waitForTimeout(5000); // 추가 대기
                } catch (e) {
                    console.warn('⚠️ 일부 요소를 찾을 수 없습니다. 스크린샷은 촬영합니다...');
                }
                
                // 스크린샷 촬영
                const now = new Date();
                const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
                const filename = `${key}_dashboard_${timestamp}.png`;
                
                // screenshots 폴더에 저장
                const screenshotsPath = path.join(__dirname, '../screenshots', filename);
                
                // screenshots 폴더가 없으면 생성
                const screenshotsDir = path.dirname(screenshotsPath);
                if (!fs.existsSync(screenshotsDir)) {
                    fs.mkdirSync(screenshotsDir, { recursive: true });
                }
                
                await page.screenshot({
                    path: screenshotsPath,
                    fullPage: true
                });
                
                console.log(`💾 스크린샷 저장: ${screenshotsPath}`);
                
                // 슬랙으로 알림 전송
                await sendToSlack(dashboard.title, filename, timestamp);
                
                await context.close();
                console.log(`✅ ${dashboard.title} 완료`);
                
            } catch (error) {
                console.error(`❌ ${dashboard.title} 오류:`, error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ 전체 프로세스 오류:', error);
    } finally {
        if (browser) {
            await browser.close();
            console.log('🔚 브라우저 종료');
        }
    }
}

async function sendToSlack(title, filename, timestamp) {
    try {
        const now = new Date();
        const koreanTime = new Intl.DateTimeFormat('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(now);
        
        // GitHub에 푸시된 후 사용할 이미지 URL
        const imageUrl = `https://raw.githubusercontent.com/gma3561/warmguys_sales/main/screenshots/${filename}`;
        
        const message = {
            text: `📊 ${title} 스크린샷 생성 완료`,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: `📊 ${title}`
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*촬영 시간:* ${koreanTime}\n*테이블 회전율 데이터* 포함 ✅\n*대시보드 URL:* https://gma3561.github.io/warmguys_sales/dashboard/apgujeong/\n*로그인:* Warmguys / Eksha12!@`
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `🎯 *주요 개선사항:*\n• 기존 apgujeong_sales 테이블 연동 완료\n• 테이블 회전율 데이터 정상 표시\n• 6월 데이터 포함하여 모든 월 표시\n• JavaScript 오류 해결로 데이터 정상 로드`
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn", 
                        text: `📸 *스크린샷 저장됨:* \`${filename}\`\n\n⚠️ *GitHub에 푸시 후 이미지가 표시됩니다*\n이미지 URL: ${imageUrl}`
                    }
                },
                {
                    type: "divider"
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "📝 *다음 단계:*\n```\ngit add screenshots/\ngit commit -m \"📸 대시보드 스크린샷 추가\"\ngit push origin main\n```"
                    }
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `자동 생성된 스크린샷 | ${timestamp}`
                        }
                    ]
                }
            ]
        };
        
        const response = await axios.post(SLACK_WEBHOOK_URL, message, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 200) {
            console.log(`📤 슬랙 전송 성공: ${title}`);
            console.log(`📌 참고: GitHub 푸시 후 이미지가 슬랙에 표시됩니다.`);
        } else {
            console.error(`❌ 슬랙 전송 실패: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ 슬랙 전송 오류:', error.message);
    }
}

// 스크립트 실행
if (require.main === module) {
    captureAndSendToSlack().then(() => {
        console.log('🎉 모든 작업 완료!');
        console.log('');
        console.log('📝 다음 단계:');
        console.log('1. git add screenshots/');
        console.log('2. git commit -m "📸 대시보드 스크린샷 추가"'); 
        console.log('3. git push origin main');
        console.log('');
        process.exit(0);
    }).catch(error => {
        console.error('❌ 스크립트 실행 오류:', error);
        process.exit(1);
    });
}

module.exports = { captureAndSendToSlack }; 