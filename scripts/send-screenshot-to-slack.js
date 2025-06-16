const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 슬랙 웹훅 URL
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';

async function sendScreenshotToSlack() {
    try {
        // screenshots 폴더에서 가장 최근 파일 찾기
        const screenshotsDir = path.join(__dirname, '../screenshots');
        const files = fs.readdirSync(screenshotsDir)
            .filter(file => file.endsWith('.png') && file.includes('apgujeong_dashboard'))
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
        
        // GitHub Raw URL
        const imageUrl = `https://raw.githubusercontent.com/gma3561/warmguys_sales/main/screenshots/${latestFile.name}`;
        
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
        
        const message = {
            text: `📊 압구정곱창 매출 대시보드 스크린샷`,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: `📊 압구정곱창 매출 대시보드`
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*촬영 시간:* ${koreanTime}\n*테이블 회전율 데이터* 포함 ✅\n\n🔗 *대시보드:* <https://gma3561.github.io/warmguys_sales/dashboard/apgujeong/|바로가기>\n🔑 *로그인:* Warmguys / Eksha12!@`
                    },
                    accessory: {
                        type: "image",
                        image_url: imageUrl,
                        alt_text: "대시보드 스크린샷"
                    }
                },
                {
                    type: "divider"
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `✅ *주요 기능:*\n• 기존 apgujeong_sales 테이블 연동\n• 테이블 회전율 데이터 표시\n• 6월 데이터 포함 (1월~12월 전체)\n• 일별/주별/월별 매출 분석\n\n📸 *전체 스크린샷 보기:* <${imageUrl}|이미지 열기>`
                    }
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `자동 생성된 스크린샷 | ${latestFile.name}`
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
            console.log(`✅ 슬랙 전송 성공!`);
            console.log(`📸 이미지 URL: ${imageUrl}`);
        } else {
            console.error(`❌ 슬랙 전송 실패: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ 오류:', error.message);
    }
}

// 스크립트 실행
if (require.main === module) {
    sendScreenshotToSlack().then(() => {
        console.log('🎉 완료!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ 스크립트 실행 오류:', error);
        process.exit(1);
    });
}

module.exports = { sendScreenshotToSlack }; 