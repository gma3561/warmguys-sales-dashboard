const { WebClient } = require('@slack/web-api');
const fs = require('fs');
const path = require('path');

// 슬랙 봇 토큰과 채널 ID는 환경변수로 설정해야 합니다
// 보안 상의 이유로 토큰 값이 제거되었습니다
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || 'YOUR_SLACK_BOT_TOKEN';
const SLACK_CHANNEL = process.env.SLACK_CHANNEL || 'YOUR_SLACK_CHANNEL_ID';

const slack = new WebClient(SLACK_BOT_TOKEN);

async function uploadScreenshotToSlack(dashboardTitle = null) {
    try {
        // screenshots 폴더에서 가장 최근 파일 찾기
        const screenshotsDir = path.join(__dirname, '../screenshots');
        const files = fs.readdirSync(screenshotsDir)
            .filter(file => file.endsWith('.png') && file.includes('_dashboard'))
            .map(file => ({
                name: file,
                path: path.join(screenshotsDir, file),
                time: fs.statSync(path.join(screenshotsDir, file)).mtime
            }))
            .sort((a, b) => b.time - a.time);
        
        if (files.length === 0) {
            console.error('❌ 스크린샷 파일을 찾을 수 없습니다.');
            return;
        }
        
        const latestFile = files[0];
        console.log(`📸 최신 스크린샷: ${latestFile.name}`);
        
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
        
        console.log('📤 슬랙에 이미지 업로드 중...');
        
        // 대시보드 제목 설정
        const title = dashboardTitle || process.env.DASHBOARD_NAME || '대시보드';
        
        // 파일 업로드
        const result = await slack.files.uploadV2({
            channel_id: SLACK_CHANNEL,
            file: fs.createReadStream(latestFile.path),
            filename: latestFile.name,
            title: title,
            initial_comment: `📊 ${title} - ${koreanTime}`
        });
        
        if (result.ok) {
            console.log('✅ 슬랙 업로드 성공!');
            // API 응답 구조 확인
            if (result.file && result.file.permalink) {
                console.log(`📁 파일 URL: ${result.file.permalink}`);
            } else if (result.files && result.files[0] && result.files[0].permalink) {
                console.log(`📁 파일 URL: ${result.files[0].permalink}`);
            } else {
                console.log('📁 파일이 성공적으로 업로드되었습니다!');
            }
        } else {
            console.error('❌ 슬랙 업로드 실패:', result.error);
        }
        
    } catch (error) {
        console.error('❌ 오류:', error.message);
        console.log('\n💡 슬랙 봇 토큰 설정 방법:');
        console.log('1. https://api.slack.com/apps 에서 새 앱 생성');
        console.log('2. OAuth & Permissions 에서 Bot Token Scopes 추가:');
        console.log('   - files:write');
        console.log('   - chat:write');
        console.log('3. 앱을 워크스페이스에 설치');
        console.log('4. Bot User OAuth Token 복사');
        console.log('5. 환경변수 설정: export SLACK_BOT_TOKEN="xoxb-your-token"');
    }
}

// 스크립트 실행
if (require.main === module) {
    uploadScreenshotToSlack().then(() => {
        console.log('🎉 완료!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ 스크립트 실행 오류:', error);
        process.exit(1);
    });
}

module.exports = { uploadScreenshotToSlack };