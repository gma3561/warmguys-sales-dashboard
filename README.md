# 🔥 따스한놈들 (Warmguys) 통합 매출 대시보드

## 📋 프로젝트 개요

따스한놈들 그룹의 4개 사업부(압구정곱창, 엠알에스, 극진이앤지)의 매출 데이터를 실시간으로 수집하고 시각화하는 통합 대시보드 시스템입니다.

### 🎯 주요 목표
- Google Sheets 데이터를 Supabase로 자동 동기화
- 실시간 매출 현황 모니터링
- 일별/주별/월별 매출 분석 및 비교
- Slack을 통한 자동 리포팅

### 🏢 사업부 구성
1. **압구정곱창** - 요식업 (압구정점, 가로수점)
2. **엠알에스(MRS)** - 온라인 커머스
3. **극진이앤지** - 에너지 사업

## 🛠 기술 스택

- **Frontend**: HTML, CSS, JavaScript, Chart.js
- **Backend**: Supabase (PostgreSQL)
- **데이터 수집**: Google Apps Script
- **자동화**: Node.js, Playwright
- **배포**: GitHub Pages
- **알림**: Slack API

## 📊 데이터베이스 구조

### 테이블 구성

#### 1. `apgujeong_apgujung_sales` - 압구정점 매출
```sql
- id: 고유 ID
- date: 날짜
- day_of_week: 요일
- card_sales: 카드 매출
- cash_sales: 현금 매출
- delivery_sales: 배달 매출
- total_sales: 총 매출
- customer_count: 고객 수
- table_turnover: 테이블 회전율
- special_notes: 특이사항
```

#### 2. `apgujeong_garosu_sales` - 가로수점 매출
(압구정점과 동일한 구조)

#### 3. `mrs_sales` - 엠알에스 매출
```sql
- id: 고유 ID
- date: 날짜
- coupang_rocket: 쿠팡로켓 매출
- smart_store: 스마트스토어 매출
- coupang_wing: 쿠팡윙 매출
- other_online: 기타 온라인 매출
- wholesale: 도매 매출
- export: 수출 매출
- total_sales: 총 매출
- refund_amount: 환불액
- refund_details: 환불 내역
```

#### 4. `geukjin_sales` - 극진이앤지 매출
```sql
- id: 고유 ID
- date: 날짜
- gasoline_sales: 휘발유 매출
- diesel_sales: 경유 매출
- kerosene_sales: 등유 매출
- freight_sales: 화물 매출
- total_sales: 총 매출
- total_cost: 총 원가
- total_margin: 총 마진
- growth_rate: 성장률
- special_notes: 특이사항
```

## 🔄 데이터 동기화 프로세스

### Google Apps Script 설정
1. Google Sheets에서 Apps Script 에디터 열기
2. 제공된 스크립트 코드 붙여넣기
3. 1시간 간격 자동 동기화 트리거 설정

### 동기화 흐름
```
Google Sheets → Apps Script → Supabase API → PostgreSQL
```

## 📱 대시보드 기능

### 공통 기능
- 📊 실시간 매출 현황 (KPI 카드)
- 📈 매출 추이 차트
- 📅 일별/주별/월별 기간 선택
- 🔄 전월/전주/전일 대비 비교
- 📋 상세 데이터 테이블

### 압구정곱창 대시보드
- 지점 선택 (전체/압구정점/가로수점)
- 테이블 회전율 분석
- 고객 수 추이
- 결제 방식별 매출 분석

### 엠알에스 대시보드
- 채널별 매출 추이
- 채널별 매출 비율 (도넛 차트)
- 환불 현황 모니터링
- 순매출 자동 계산

### 극진이앤지 대시보드
- 연료별 매출 분석
- 마진율 추이
- 성장률 모니터링
- 원가 대비 수익 분석

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/gma3561/warmguys_sales.git
cd warmguys_sales
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
export SLACK_BOT_TOKEN='your-slack-bot-token'
export SLACK_CHANNEL_ID='your-channel-id'
```

### 4. 로컬 실행
```bash
# 대시보드 접속
open https://gma3561.github.io/warmguys_sales/

# 로그인 정보
Username: Warmguys
Password: Eksha12!@
```

## 📸 자동 스크린샷 및 Slack 전송

### 단일 대시보드 캡처
```bash
cd scripts
node capture-and-send-slack.js
```

### 전체 대시보드 캡처 (15초 간격)
```bash
cd scripts
node capture-all-dashboards.js
```

### Slack Bot 설정
1. https://api.slack.com/apps 에서 앱 생성
2. OAuth & Permissions에서 권한 추가:
   - `files:write`
   - `chat:write`
   - `channels:read`
3. Bot User OAuth Token 복사
4. 채널에 봇 초대: `/invite @bot-name`

## 📝 변경 이력

### 2025년 6월 4일
- ✅ 압구정곱창 대시보드 테이블명 수정 (`apgujeong_sales` → `apgujeong_apgujung_sales`)
- ✅ 지점 선택 기능 추가 (전체/압구정점/가로수점)
- ✅ 6월 데이터 표시 문제 해결 (월 버튼 12개 전체 표시)
- ✅ 대시보드 제목에서 영어 제거
- ✅ Slack Bot 통합 및 자동 스크린샷 전송 기능 구현
- ✅ 4개 대시보드 순차 캡처 스크립트 추가

### 2025년 5월
- 🚀 프로젝트 초기 구축
- 📊 Supabase 데이터베이스 설계
- 🔄 Google Apps Script 동기화 구현
- 📱 대시보드 UI/UX 개발
- 📈 Chart.js 차트 구현

## 🔧 문제 해결

### 데이터가 표시되지 않을 때
1. 브라우저 개발자 도구(F12) 콘솔 확인
2. Supabase 테이블명 확인
3. Google Apps Script 동기화 상태 확인
4. 로그인 상태 확인

### Slack 전송 실패 시
1. Bot Token 유효성 확인
2. 채널 ID 확인 (C로 시작하는 ID)
3. 봇이 채널에 초대되었는지 확인
4. 필요한 권한이 있는지 확인

## 📁 프로젝트 구조

```
warmguys_sales/
├── dashboard/
│   ├── apgujeong/          # 압구정곱창 대시보드
│   │   ├── index.html
│   │   └── js/
│   │       └── apgujeong_fix.js
│   ├── mrs/                # 엠알에스 대시보드
│   │   └── index.html
│   └── geukjin/            # 극진이앤지 대시보드
│       └── index.html
├── scripts/
│   ├── capture-dashboards.js        # 스크린샷 캡처
│   ├── send-screenshot-with-bot.js  # Slack Bot 전송
│   ├── capture-all-dashboards.js    # 전체 대시보드 캡처
│   └── google-sheets-sync.js        # 데이터 동기화
├── screenshots/            # 캡처된 스크린샷 저장
├── index.html             # 메인 로그인 페이지
└── README.md              # 프로젝트 문서
```

## 🤝 기여 방법

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

- 프로젝트 관리자: [GitHub Profile](https://github.com/gma3561)
- 이슈 제보: [GitHub Issues](https://github.com/gma3561/warmguys_sales/issues)

## 📄 라이선스

이 프로젝트는 따스한놈들 내부용으로 개발되었습니다.

---

**Last Updated**: 2025년 6월 4일