# 📊 따스한놈들 대시보드 스크린샷 자동화

GitHub Actions를 사용하여 각 계열사별 대시보드 스크린샷을 자동으로 캡처하고 슬랙에 전송하는 시스템입니다.

## 🎯 기능

- **자동 스크린샷 캡처**: 각 계열사별 대시보드 전체 페이지 캡처
- **슬랙 자동 전송**: 캡처된 이미지를 슬랙 채널에 자동 업로드
- **스케줄 실행**: 매일 정해진 시간에 자동 실행
- **수동 실행**: 필요시 수동으로 즉시 실행 가능

## 📋 대상 대시보드

1. **📊 MRS (엠알에스)** - 온라인 쇼핑몰 매출 현황
2. **🍽️ APGUJEONG (압구정곱창)** - 요식업 매출 현황
   - 압구정점
   - 가로수점

## ⚙️ 설정 방법

### 1. 슬랙 봇 설정

1. [Slack API](https://api.slack.com/apps)에서 새 앱 생성
2. **OAuth & Permissions**에서 다음 권한 추가:
   - `files:write`
   - `chat:write`
   - `channels:read`
3. **Bot Token** 복사 (xoxb-로 시작)

### 2. GitHub Secrets 설정

Repository Settings > Secrets and variables > Actions에서 다음 시크릿 추가:

```
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_CHANNEL=#dashboard-reports
```

### 3. 실행 스케줄

- **오전 9시 (KST)**: 일일 모닝 리포트
- **오후 6시 (KST)**: 일일 이브닝 리포트

## 🚀 수동 실행 방법

1. GitHub 레포지토리 > Actions 탭
2. "📊 Daily Dashboard Screenshots" 워크플로우 선택
3. "Run workflow" 버튼 클릭

## 📁 파일 구조

```
├── .github/workflows/
│   └── dashboard-screenshots.yml    # GitHub Actions 워크플로우
├── scripts/
│   └── capture-dashboards.js        # 스크린샷 캡처 스크립트
├── package.json                     # Node.js 의존성
└── DASHBOARD_AUTOMATION_README.md   # 이 파일
```

## 🔧 커스터마이징

### 스케줄 변경
`.github/workflows/dashboard-screenshots.yml`에서 cron 표현식 수정:

```yaml
schedule:
  - cron: '0 0 * * *'  # UTC 00:00 = KST 09:00
  - cron: '0 9 * * *'  # UTC 09:00 = KST 18:00
```

### 대시보드 URL 변경
`scripts/capture-dashboards.js`에서 `dashboards` 배열 수정:

```javascript
const dashboards = [
  {
    name: 'MRS (엠알에스)',
    url: 'https://gma3561.github.io/warmguys_sales/dashboard/mrs/index.html',
    emoji: '📊',
    description: '온라인 쇼핑몰 매출 현황'
  },
  // 추가 대시보드...
];
```

### 스크린샷 설정 변경
`scripts/capture-dashboards.js`에서 브라우저 설정 수정:

```javascript
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },  // 해상도 변경
  deviceScaleFactor: 1                      // 스케일 변경
});
```

## 🐛 트러블슈팅

### 로그인 문제
- 대시보드에 로그인이 필요한 경우, 스크립트에서 자동 로그인 처리됨
- 로그인 정보 변경시 `scripts/capture-dashboards.js`에서 수정 필요

### 슬랙 전송 실패
- `SLACK_BOT_TOKEN`과 `SLACK_CHANNEL` 시크릿 확인
- 봇이 해당 채널에 초대되었는지 확인
- 봇 권한 설정 확인

### 스크린샷 캡처 실패
- 대시보드 URL 접근 가능 여부 확인
- 페이지 로딩 시간 조정 (`waitForTimeout` 값 증가)

## 📊 실행 결과 예시

슬랙에 전송되는 메시지 형태:

```
📊 MRS (엠알에스) 대시보드 현황
📅 2024년 5월 30일 목요일
📈 온라인 쇼핑몰 매출 현황

[스크린샷 이미지]

📊 따스한놈들 일일 대시보드 리포트
📅 2025/6/16
✅ 총 2개 계열사 대시보드 캡처 완료
```

## 🔄 업데이트 방법

1. 스크립트 수정 후 커밋 & 푸시
2. GitHub Actions가 자동으로 최신 코드 사용
3. 수동 테스트: Actions 탭에서 워크플로우 수동 실행

---

**문의사항이나 개선사항이 있으시면 이슈를 등록해주세요! 🚀** 