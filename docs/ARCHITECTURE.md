# 프로젝트 아키텍처

## 🏗 시스템 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                         Google Sheets                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ 압구정곱창   │  │  엠알에스    │  │  극진이앤지  │            │
│  │  (2개 시트)  │  │   (1개 시트) │  │  (1개 시트)  │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│         │                 │                 │                    │
└─────────┼─────────────────┼─────────────────┼────────────────────┘
          │                 │                 │
          └─────────────────┴─────────────────┘
                            │
                            ▼
                  ┌─────────────────┐
                  │ Google Apps     │
                  │ Script          │
                  │ (1시간 자동실행) │
                  └────────┬────────┘
                           │ API 호출
                           ▼
                  ┌─────────────────┐
                  │    Supabase     │
                  │   PostgreSQL    │
                  │                 │
                  │ • apgujeong_    │
                  │   apgujung_     │
                  │   sales         │
                  │ • apgujeong_    │
                  │   garosu_sales  │
                  │ • mrs_sales     │
                  │ • geukjin_sales │
                  └────────┬────────┘
                           │ REST API
                           ▼
         ┌─────────────────────────────────────┐
         │          웹 대시보드                  │
         │        (GitHub Pages)                │
         │                                      │
         │  ┌──────────┐  ┌──────────┐        │
         │  │  로그인   │  │  메인     │        │
         │  │  페이지   │─▶│ 대시보드  │        │
         │  └──────────┘  └─────┬────┘        │
         │                      │              │
         │    ┌─────────────────┼─────────┐    │
         │    ▼                 ▼         ▼    │
         │ ┌────────┐    ┌────────┐  ┌────────┐│
         │ │압구정곱창│    │엠알에스 │  │극진이앤지││
         │ │대시보드 │    │대시보드 │  │대시보드 ││
         │ └────────┘    └────────┘  └────────┘│
         └──────────────────┬──────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │   Playwright   │
                   │  스크린샷 캡처  │
                   └────────┬───────┘
                            │
                            ▼
                   ┌────────────────┐
                   │   Slack Bot    │
                   │   API 전송     │
                   └────────────────┘
```

## 📊 데이터 플로우

### 1. 데이터 수집 (Google Sheets → Supabase)
```
매출 데이터 입력 (수동)
    ↓
Google Sheets 저장
    ↓
Apps Script 트리거 (1시간마다)
    ↓
데이터 변환 및 검증
    ↓
Supabase API 호출
    ↓
PostgreSQL 저장/업데이트
```

### 2. 데이터 표시 (Supabase → Dashboard)
```
사용자 대시보드 접속
    ↓
로그인 확인
    ↓
기간/지점 선택
    ↓
Supabase API 요청
    ↓
데이터 수신 및 가공
    ↓
Chart.js 시각화
    ↓
화면 렌더링
```

### 3. 자동 리포팅 (Dashboard → Slack)
```
Node.js 스크립트 실행
    ↓
Playwright 브라우저 실행
    ↓
자동 로그인
    ↓
대시보드 로드 대기
    ↓
스크린샷 캡처
    ↓
이미지 파일 저장
    ↓
Slack Bot API 호출
    ↓
채널에 이미지 업로드
```

## 🔐 보안 구조

### 인증 계층
1. **대시보드 접근**
   - 하드코딩된 로그인 (Warmguys/Eksha12!@)
   - localStorage 세션 관리
   - 24시간 자동 만료

2. **API 보안**
   - Supabase Row Level Security (RLS)
   - API Key 인증
   - CORS 설정

3. **데이터 보안**
   - HTTPS 통신
   - 민감 정보 환경변수 처리
   - API Key .gitignore 처리

## 🗂 디렉토리 구조

```
warmguys_sales/
│
├── 📁 dashboard/              # 대시보드 파일
│   ├── apgujeong/            # 압구정곱창
│   │   ├── index.html
│   │   └── js/
│   │       └── apgujeong_fix.js
│   ├── mrs/                  # 엠알에스
│   │   └── index.html
│   └── geukjin/              # 극진이앤지
│       └── index.html
│
├── 📁 scripts/               # 자동화 스크립트
│   ├── capture-dashboards.js
│   ├── send-screenshot-with-bot.js
│   └── capture-all-dashboards.js
│
├── 📁 docs/                  # 문서
│   ├── ARCHITECTURE.md
│   └── GOOGLE_APPS_SCRIPT_SETUP.md
│
├── 📁 screenshots/           # 캡처 이미지 (gitignore)
│
├── 📄 index.html            # 메인 로그인 페이지
├── 📄 README.md             # 프로젝트 설명
├── 📄 CHANGELOG.md          # 변경 이력
├── 📄 package.json          # Node.js 의존성
└── 📄 .gitignore            # Git 제외 파일
```

## 🔧 기술 스택 상세

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: 반응형 디자인, Flexbox/Grid
- **JavaScript (ES6+)**: 비동기 처리, 모듈화
- **Chart.js 3.x**: 데이터 시각화

### Backend
- **Supabase**: BaaS (Backend as a Service)
- **PostgreSQL**: 관계형 데이터베이스
- **REST API**: 데이터 통신

### 자동화
- **Google Apps Script**: 데이터 동기화
- **Node.js**: 스크립트 실행 환경
- **Playwright**: 브라우저 자동화
- **Slack API**: 메시지 전송

### 배포
- **GitHub Pages**: 정적 웹 호스팅
- **GitHub Actions**: CI/CD (계획중)

## 🚀 확장 계획

### 단기 계획
1. **실시간 동기화**: WebSocket 연결
2. **모바일 최적화**: PWA 변환
3. **다크 모드**: 테마 전환 기능
4. **데이터 내보내기**: Excel/PDF 다운로드

### 장기 계획
1. **AI 분석**: 매출 예측 모델
2. **멀티 테넌트**: 다중 기업 지원
3. **API 서버**: 자체 백엔드 구축
4. **모바일 앱**: React Native 개발

## 📈 성능 최적화

### 현재 적용된 최적화
1. **데이터 캐싱**: 중복 API 호출 방지
2. **지연 로딩**: 차트 라이브러리 동적 로드
3. **이미지 최적화**: WebP 포맷 사용
4. **코드 압축**: 프로덕션 빌드

### 계획된 최적화
1. **CDN 적용**: 정적 자원 캐싱
2. **Service Worker**: 오프라인 지원
3. **코드 분할**: 라우트별 번들링
4. **서버 사이드 렌더링**: Next.js 마이그레이션

---

**Last Updated**: 2025년 6월 4일 