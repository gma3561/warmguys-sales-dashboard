# 변경 이력 (CHANGELOG)

이 문서는 따스한놈들 통합 매출 대시보드의 모든 변경사항을 기록합니다.

## [1.2.0] - 2025-06-04

### 🎯 주요 이슈 해결
- **문제**: 압구정곱창 대시보드에서 6월 버튼이 표시되지 않음
- **원인**: `createMonthButtons()` 함수가 최근 6개월만 표시하도록 제한됨
- **해결**: 1월부터 12월까지 모든 월 버튼을 표시하도록 수정

### ✨ 새로운 기능
1. **지점 선택 기능 추가**
   - 압구정곱창 대시보드에 지점 선택 드롭다운 추가
   - 전체/압구정점/가로수점 선택 가능
   - 선택에 따라 데이터 필터링 및 합산 처리

2. **Slack 자동 리포팅 시스템**
   - Playwright를 이용한 대시보드 스크린샷 캡처
   - Slack Bot API를 통한 이미지 업로드
   - 4개 대시보드 순차 캡처 스크립트 (`capture-all-dashboards.js`)

### 🔧 기술적 변경사항
1. **데이터베이스 구조 변경**
   - `apgujeong_sales` → `apgujeong_apgujung_sales` (압구정점)
   - `apgujeong_garosu_sales` 테이블 추가 (가로수점)
   - Google Apps Script와 테이블명 동기화

2. **JavaScript 오류 수정**
   - `branchSelect` 요소 참조 오류 해결
   - 불필요한 이벤트 리스너 제거
   - 데이터 로드 로직 개선

3. **UI/UX 개선**
   - 대시보드 제목에서 영어 텍스트 제거
   - 월 선택 버튼 레이아웃 개선
   - 지점 선택기 스타일링 추가

### 📁 파일 변경
- **수정된 파일**:
  - `/dashboard/apgujeong/index.html`
  - `/dashboard/apgujeong/js/apgujeong_fix.js`
  - `/README.md`

- **추가된 파일**:
  - `/scripts/capture-dashboards.js`
  - `/scripts/send-screenshot-with-bot.js`
  - `/scripts/capture-all-dashboards.js`
  - `/scripts/capture-and-send-slack.js`
  - `/docs/GOOGLE_APPS_SCRIPT_SETUP.md`
  - `/CHANGELOG.md`

- **삭제된 파일**:
  - `/supabase/migrations/009_create_apgujeong_branch_tables.sql`
  - `/google-apps-script/apgujeong-sync.js`
  - `/scripts/send-screenshot-base64.js`
  - `/insert-test-data.js`
  - `/create-apgujeong-table.js`

### 🐛 버그 수정
1. 6월 데이터가 표시되지 않는 문제 해결
2. JavaScript 콘솔 오류 제거
3. 데이터베이스 연결 오류 수정
4. 테이블 회전율 평균 계산 로직 수정

### 📝 문서화
- 상세한 README.md 작성
- Google Apps Script 설정 가이드 추가
- 변경 이력 문서(CHANGELOG.md) 생성

## [1.1.0] - 2025-05-20

### ✨ 초기 릴리스
1. **대시보드 구축**
   - 압구정곱창 대시보드
   - 엠알에스 대시보드
   - 극진이앤지 대시보드
   - 메인 로그인 페이지

2. **데이터 동기화**
   - Google Sheets → Supabase 자동 동기화
   - 1시간 간격 자동 업데이트
   - 중복 데이터 자동 처리

3. **시각화 기능**
   - Chart.js를 이용한 매출 추이 차트
   - KPI 카드 (전월/전주/전일 대비)
   - 상세 데이터 테이블

4. **인증 시스템**
   - 하드코딩된 로그인 (Warmguys/Eksha12!@)
   - localStorage 기반 세션 관리
   - 24시간 자동 로그아웃

### 🛠 기술 스택
- Frontend: HTML, CSS, JavaScript
- Charts: Chart.js
- Backend: Supabase (PostgreSQL)
- Deployment: GitHub Pages

## [1.0.0] - 2025-05-01

### 🚀 프로젝트 시작
- 프로젝트 초기 설정
- GitHub 저장소 생성
- Supabase 프로젝트 생성
- 기본 폴더 구조 설정

---

## 버전 관리 규칙

### 버전 번호 체계
- **Major (X.0.0)**: 대규모 변경, 하위 호환성 없음
- **Minor (0.X.0)**: 새로운 기능 추가, 하위 호환성 유지
- **Patch (0.0.X)**: 버그 수정, 작은 개선사항

### 커밋 메시지 규칙
- `feat:` 새로운 기능
- `fix:` 버그 수정
- `docs:` 문서 변경
- `style:` 코드 스타일 변경
- `refactor:` 코드 리팩토링
- `test:` 테스트 추가/수정
- `chore:` 빌드 프로세스 등 기타 변경

---

**Last Updated**: 2025년 6월 4일 