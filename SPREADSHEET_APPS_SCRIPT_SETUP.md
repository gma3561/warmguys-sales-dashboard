# 📊 스프레드시트 Apps Script 연동 가이드

## 🎯 개요
Google Sheets에 직접 Apps Script를 연결하여 데이터가 변경될 때마다 자동으로 Supabase와 동기화하는 시스템입니다.

## 📋 현재 시트 분석 결과
- **시트명**: `Warmguys_Dashboard_Raw Data`
- **데이터 유형**: 압구정곱창 매출 데이터 (카드, 현금, 배달 등)
- **기간**: 2025년 1월 1일 ~ 4월 9일
- **연동 테이블**: `apgujeong_sales`

## 🚀 설정 단계

### 1단계: Apps Script 에디터 열기
1. Google Sheets 열기: https://docs.google.com/spreadsheets/d/1Qq0sgm9xyTPmhphzIhyo_-lI55F4M7SOTS2FEBvsvQU/edit
2. 상단 메뉴에서 **"확장 프로그램"** → **"Apps Script"** 클릭
3. 새 Apps Script 프로젝트가 열림

### 2단계: 코드 설정
1. 기본 `Code.gs` 파일의 내용을 모두 삭제
2. `google-apps-script/SpreadsheetBound.gs` 파일의 내용을 복사하여 붙여넣기
3. **Ctrl+S** (또는 **Cmd+S**)로 저장
4. 프로젝트 이름을 "따스한놈들 매출 동기화"로 변경

### 3단계: 권한 설정
1. Apps Script 에디터에서 **"실행"** 버튼 옆의 **"권한 검토"** 클릭
2. Google 계정으로 로그인
3. **"고급"** → **"프로젝트명(안전하지 않음)"** 클릭
4. **"허용"** 클릭하여 필요한 권한 부여

### 4단계: 수동 테스트
Apps Script 에디터에서 다음 함수들을 차례로 실행해보세요:

#### 4-1. 데이터 읽기 테스트
```javascript
testReadData()
```
- 실행: 함수 선택 후 **"실행"** 버튼 클릭
- 확인: **"실행 로그"**에서 시트 데이터가 제대로 읽혔는지 확인

#### 4-2. 데이터 변환 테스트  
```javascript
testTransformData()
```
- 확인: 데이터가 Supabase 형식으로 올바르게 변환되었는지 확인

#### 4-3. Supabase 연결 테스트
```javascript
testSupabaseConnection()
```
- 확인: Supabase에 테스트 데이터가 성공적으로 업로드되는지 확인

#### 4-4. 전체 동기화 테스트
```javascript
manualSync()
```
- 확인: 전체 데이터가 성공적으로 동기화되는지 확인

### 5단계: 자동 트리거 설정 (선택사항)
```javascript
setupTriggers()
```
이 함수를 실행하면:
- **매일 오전 9시** 자동 동기화
- **시트 편집 시** 자동 동기화 (주의: 너무 자주 실행될 수 있음)

## 🔧 사용 방법

### 수동 동기화
- Apps Script 에디터에서 `manualSync()` 함수 실행
- 또는 대시보드의 "Google Sheets 연동" 페이지에서 실행

### 자동 동기화
- 트리거 설정 후 매일 자동 실행
- 시트 데이터 변경 시 자동 실행 (설정한 경우)

## 📊 데이터 매핑

현재 시트의 컬럼이 다음과 같이 매핑됩니다:

| 시트 컬럼 | Supabase 필드 | 설명 |
|----------|---------------|------|
| Date | date | 날짜 |
| Day of Week | day_of_week | 요일 |
| Card | card_sales | 카드 매출 |
| Cash Sales | cash_sales | 현금 매출 |
| Cash Receipt | cash_receipt | 현금영수증 |
| Delivery | delivery_sales | 배달 매출 |
| Bank Transfer | account_transfer | 계좌이체 |
| Card Discount | card_discount | 카드 할인 |
| Cash Discount | cash_discount | 현금 할인 |
| Total Sales | total_sales | 총 매출 |
| Number of Customers | customer_count | 고객수 |
| Turnover Rate | table_turnover | 테이블 회전율 |
| Special Notes | special_notes | 특이사항 |

## 🔍 문제 해결

### 오류: "권한이 없습니다"
- 3단계의 권한 설정을 다시 진행하세요
- Google 계정에 스프레드시트 소유자 권한이 있는지 확인

### 오류: "시트를 찾을 수 없습니다"
- 시트 이름이 정확한지 확인 (`Warmguys_Dashboard_Raw Data`)
- 대소문자와 공백을 정확히 입력했는지 확인

### 오류: "Supabase 연결 실패"
- 인터넷 연결 상태 확인
- Supabase API 키가 올바른지 확인

### 데이터가 동기화되지 않음
- 시트의 첫 번째 행이 헤더인지 확인
- Date 컬럼에 유효한 날짜가 있는지 확인
- Apps Script 실행 로그에서 오류 메시지 확인

## 🎨 시트에 더 많은 회사 데이터 추가하기

현재는 압구정곱창 데이터만 있지만, 다른 회사 데이터도 추가할 수 있습니다:

### 새 시트 추가 방법
1. 스프레드시트 하단의 **"+"** 클릭하여 새 시트 생성
2. 시트 이름을 다음 중 하나로 설정:
   - `MRS_Sales` (엠알에스 온라인 매출)
   - `Warmguys_Sales` (따스한놈들 통합 매출)  
   - `Geukjin_Sales` (극진이앤지 연료 매출)

3. Apps Script의 `SHEET_CONFIG` 객체에 새 시트 정보 추가:
```javascript
const SHEET_CONFIG = {
  'Warmguys_Dashboard_Raw Data': {
    tableName: 'apgujeong_sales',
    companyType: 'apgujeong'
  },
  'MRS_Sales': {
    tableName: 'mrs_sales', 
    companyType: 'mrs'
  }
  // 추가 시트들...
};
```

## 📈 모니터링

### 실행 로그 확인
- Apps Script 에디터 → **"실행"** → **"내 실행"**
- 각 실행의 상태와 로그를 확인할 수 있습니다

### 대시보드에서 확인
- https://gma3561.github.io/warmguys_sales/ 에서 로그인
- 압구정곱창 대시보드에서 데이터가 제대로 표시되는지 확인

설정이 완료되면 Google Sheets의 데이터가 실시간으로 대시보드에 반영됩니다! 🎉