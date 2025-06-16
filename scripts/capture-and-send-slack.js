const { captureAndSendToSlack } = require('./capture-dashboards');
const { uploadScreenshotToSlack } = require('./send-screenshot-with-bot');

async function captureAndSendToSlackBot() {
    try {
        console.log('🚀 압구정곱창 대시보드 스크린샷 캡처 및 Slack 전송 시작...\n');
        
        // 1. 스크린샷 캡처 (이미 webhook으로 전송됨)
        console.log('📸 스크린샷 캡처 중...');
        await captureAndSendToSlack();
        
        // 잠시 대기 (파일 저장 완료 보장)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 2. Slack Bot으로도 전송 (파일 업로드)
        console.log('\n📤 Slack Bot으로 파일 업로드 중...');
        await uploadScreenshotToSlack();
        
        console.log('\n✅ 모든 작업이 완료되었습니다!');
        
    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
        process.exit(1);
    }
}

// 스크립트 실행
if (require.main === module) {
    captureAndSendToSlackBot();
}

module.exports = { captureAndSendToSlackBot }; 