const { chromium } = require('playwright');
const fs = require('fs');

// 계열사별 대시보드 설정
const dashboards = [
  {
    name: 'MRS (엠알에스)',
    url: 'https://gma3561.github.io/warmguys_sales/dashboard/mrs/index.html',
    emoji: '📊',
    description: '온라인 쇼핑몰 매출 현황'
  },
  {
    name: 'APGUJEONG (압구정곱창)',
    url: 'https://gma3561.github.io/warmguys_sales/dashboard/apgujeong/index.html',
    emoji: '🍽️',
    description: '요식업 매출 현황'
  },
  {
    name: 'GEUKJIN (극진이앤지)',
    url: 'https://gma3561.github.io/warmguys_sales/dashboard/geukjin/index.html',
    emoji: '⛽',
    description: '에너지 사업 매출 현황'
  }
];

async function captureScreenshot(page, dashboard) {
  try {
    console.log(`📸 ${dashboard.name} 스크린샷 캡처 중...`);
    
    // 페이지 로드
    await page.goto(dashboard.url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 로그인이 필요한 경우 자동 로그인
    try {
      const loginForm = await page.locator('#login-section').isVisible();
      if (loginForm) {
        console.log('로그인 폼 발견, 자동 로그인 중...');
        await page.fill('#username', 'Warmguys');
        await page.fill('#password', 'Eksha12!@');
        await page.click('button[onclick="login()"]');
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('로그인 폼이 없거나 이미 로그인됨');
    }
    
    // 데이터 로딩 대기
    console.log('데이터 로딩 대기 중...');
    await page.waitForTimeout(5000);
    
    // 스크린샷 캡처 (전체 페이지)
    const screenshotPath = `screenshots/${dashboard.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
    
    // screenshots 폴더 생성
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
    
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      type: 'png'
    });
    
    console.log(`✅ ${dashboard.name} 스크린샷 저장: ${screenshotPath}`);
    return screenshotPath;
    
  } catch (error) {
    console.error(`❌ ${dashboard.name} 스크린샷 캡처 실패:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 모든 계열사 대시보드 스크린샷 캡처 시작...');
  
  // 브라우저 실행
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });
  
  const page = await context.newPage();
  
  const capturedFiles = [];
  
  try {
    // 모든 대시보드 캡처
    for (const dashboard of dashboards) {
      const screenshotPath = await captureScreenshot(page, dashboard);
      if (screenshotPath) {
        capturedFiles.push({
          name: dashboard.name,
          path: screenshotPath,
          emoji: dashboard.emoji,
          description: dashboard.description
        });
      }
      
      // 각 캡처 사이에 잠시 대기
      await page.waitForTimeout(2000);
    }
    
    console.log('\n🎉 모든 스크린샷 캡처 완료!');
    console.log('📁 캡처된 파일들:');
    capturedFiles.forEach(file => {
      console.log(`  ${file.emoji} ${file.name}: ${file.path}`);
    });
    
  } catch (error) {
    console.error('❌ 전체 프로세스 실패:', error);
  } finally {
    await browser.close();
  }
}

// 스크립트 실행
main().catch(console.error); 