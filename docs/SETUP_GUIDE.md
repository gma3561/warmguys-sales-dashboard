# 🔧 웜가이즈 매출 대시보드 실제 연동 가이드

## 🎯 현재 연동 상태

### ✅ 완료된 설정
- **압구정곱창**: 1YNNadOC3mXv5ti1TxS1n4gZQ7qKOWNzi527rJkKFTqY
- **엠알에스**: 18vNJXwSnhj7xWZYZztBJsEY5kYe0PuzCQvA_BsB4T1Q
- **극진이앤지**: 1kzw7D13mcCRRnEl4hxSFZWZtdroIZ9S3Lw8h302wgIU

### ⏳ 대기 중
- **웜가이즈**: Google Sheets 생성 필요

## 🚀 Google Apps Script 설정 단계

### 1. Google Apps Script 프로젝트 생성

1. **[Google Apps Script](https://script.google.com) 접속**
2. **"새 프로젝트" 클릭**
3. **프로젝트 이름**: "웜가이즈-매출-동기화"

### 2. 스크립트 파일 추가

다음 순서로 파일들을 생성하고 코드를 복사합니다:

#### 📋 파일 목록
1. **config.gs** - 설정 파일
2. **main.gs** - 메인 동기화 로직  
3. **supabaseClient.gs** - Supabase 연동
4. **utils.gs** - 유틸리티 함수
5. **dataProcessor.gs** - 데이터 처리

### 3. 코드 복사 
저장소의 `scripts/apps-script/` 폴더에서 각 파일의 내용을 복사해서 붙여넣습니다.

### 4. 권한 설정

스크립트 실행 시 다음 권한이 필요합니다:
- ✅ Google Sheets 읽기/쓰기
- ✅ 외부 URL 접근 (Supabase API)
- ✅ 시간 기반 트리거

### 5. 트리거 설정

1. **Apps Script 에디터**에서 **"트리거" 메뉴** 클릭
2. **"트리거 추가"** 클릭
3. **다음 설정 적용**:
   - 실행할 함수: `scheduledSync`
   - 이벤트 종류: `시간 기반`
   - 시간 간격 유형: `시간마다`
   - 시간 간격: `1시간마다`

## 📊 시트 구조 가이드

### 엠알에스 (MRS) 시트 구조
```
날짜 | 쿠팡로켓 | 스마트스토어 | 쿠팡윙 | 기타 온라인 | 도매 | 수출 | 총매출 | 특이사항 | 환불액 | 환불 내역
```

### 압구정곱창 시트 구조  
```
날짜 | 요일 | 카드 | 현금매출 | 현금영수증 | 배달 | 계좌이체 | 카드할인 | 현금할인 | 총매출 | 고객 수 | 회전율 | 특이사항 | 시제입금 | 보유 시제 | 현금지출 | 현금지출사유 | 원물발주 | 테이블수
```

### 극진이앤지 시트 구조
```
Month / Total | 매출 무연 | 매출 경유 | 매출 등유 | 매출 운임 | 매출 Total | 원가 무연 | 원가 경유 | 원가 등유 | 원가 운임 | 원가 Total | 마진 무연 | 마진 경유 | 마진 등유 | 마진 운임 | 마진 Total | Grow Rate
```

## 🔧 웜가이즈 시트 생성

웜가이즈 계열사의 시트를 생성하고 다음과 같이 설정하세요:

### 1. 새 Google Sheets 생성
1. **[Google Sheets](https://sheets.google.com) 접속**
2. **빈 스프레드시트 생성**
3. **이름**: "웜가이즈 매출 입력 시트"

### 2. 헤더 설정 (A1부터)
```
날짜 | 쿠팡로켓 | 스마트스토어 | 쿠팡윙 | 기타 온라인 | 도매 | 수출 | 총매출 | 특이사항 | 환불액 | 환불 내역
```

### 3. 스프레드시트 ID 추출
- URL에서 ID 복사: `https://docs.google.com/spreadsheets/d/{YOUR_ID}/edit`

### 4. Apps Script에서 설정 업데이트
`config.gs` 파일에서 다음 라인 수정:
```javascript
WARMGUYS: 'YOUR_WARMGUYS_SPREADSHEET_ID', // <- 실제 ID로 변경
```

## 🧪 테스트 방법

### 1. 수동 동기화 테스트

Apps Script 에디터에서:
1. **함수 선택**: `manualSyncAll`
2. **실행 버튼** 클릭  
3. **로그 확인**: `Ctrl+Enter`로 로그 창 확인

### 2. 개별 계열사 테스트

특정 계열사만 테스트하려면:
```javascript
manualSyncMRS()      // 엠알에스
manualSyncAPGUJEONG()  // 압구정곱창  
manualSyncGEUKJIN()  // 극진이앤지
```

### 3. 대시보드에서 확인

1. **[대시보드](https://gma3561.github.io/warmguys_sales) 접속**
2. **로그인**: Warmguys / Eksha12!@
3. **계열사별 데이터 확인**

## 🔍 문제 해결

### 권한 오류
- **증상**: "권한이 없습니다" 오류
- **해결**: Apps Script 실행 시 권한 승인

### 시트를 찾을 수 없음
- **증상**: "시트를 찾을 수 없습니다" 오류  
- **해결**: `config.gs`의 `SHEET_NAMES` 확인

### 컬럼 매핑 오류
- **증상**: 데이터가 제대로 들어가지 않음
- **해결**: 시트의 헤더와 `COLUMN_MAPPINGS` 일치 확인

### Supabase 연결 오류
- **증상**: "네트워크 오류" 또는 "401 인증 실패"
- **해결**: Supabase URL과 API Key 재확인

## 📈 모니터링

### 동기화 상태 확인

1. **대시보드의 "동기화 로그" 섹션**에서 실시간 상태 확인
2. **성공/실패 로그** 및 **처리된 행 수** 확인
3. **오류 발생 시 상세 메시지** 확인

### 수동 새로고침

대시보드에서:
1. **"새로고침" 버튼** 클릭
2. **최신 데이터** 즉시 반영

## ⚙️ 고급 설정

### 동기화 간격 조정

`config.gs`에서 다음 설정 변경:
```javascript
// 30분마다 동기화 (기본: 1시간)
// 트리거 설정에서 "30분마다"로 변경
```

### 특정 계열사만 활성화

`config.gs`에서:
```javascript
const ACTIVE_AFFILIATES = ['MRS', 'APGUJEONG']; // 필요한 계열사만 포함
```

### 데이터 유효성 검사 강화

`main.gs`의 `validateSalesData` 함수에서 추가 검증 로직:
```javascript
function validateSalesData(data) {
  // 기존 검증 + 추가 검증
  if (data.total_sales > 100000000) { // 1억 초과 시 경고
    Logger.log(`높은 매출 감지: ${data.total_sales}`);
  }
  return true;
}
```

## 📞 지원

추가 도움이 필요하면:
1. **GitHub Issues**에서 문의
2. **로그 내용**과 **오류 메시지** 첨부  
3. **계열사명**과 **발생 시점** 명시

---

*마지막 업데이트: 2025년 5월 18일*