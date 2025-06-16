# Google Sheets 보안 연동 설정 가이드

## 🔒 보안 연동 방식 (권장)

이 방식은 Google Sheets를 공개하지 않고도 안전하게 데이터를 연동할 수 있습니다.
Google Apps Script 웹 앱을 통해 인증된 요청만 처리합니다.

## 1. Google Apps Script 설정

### 단계 1: Google Apps Script 프로젝트 생성
1. https://script.google.com 접속
2. "새 프로젝트" 클릭
3. 프로젝트 이름을 "따스한놈들 매출 연동"으로 변경

### 단계 2: 코드 설정
1. `google-apps-script/Code.gs` 파일의 내용을 복사
2. Google Apps Script 에디터에 붙여넣기
3. 다음 설정값들을 수정:
   - `SPREADSHEET_ID`: 실제 스프레드시트 ID 확인
   - `API_KEY`: 안전한 커스텀 키로 변경 (예: `warmguys-secure-key-2025`)
   - `SHEET_MAPPINGS`: 실제 시트 이름으로 변경

### 단계 3: 웹 앱 배포
1. "배포" → "새 배포" 클릭
2. "유형" → "웹 앱" 선택
3. 설정:
   - **실행 권한**: "나"
   - **액세스 권한**: "모든 사용자"
4. "배포" 클릭
5. 생성된 웹 앱 URL 복사

## 2. 스프레드시트 구조 확인

각 탭(시트)의 구조를 다음과 같이 설정해주세요:

### 탭 1: 따스한놈들 (warmguys_sales)
```
A열: 날짜 (YYYY-MM-DD 형식)
B열: 쿠팡로켓
C열: 스마트스토어
D열: 쿠팡윙
E열: 기타온라인
F열: 도매
G열: 수출
H열: 총매출
I열: 환불액
J열: 주문수
K열: 특이사항
```

### 탭 2: 엠알에스 (mrs_sales)
```
A열: 날짜 (YYYY-MM-DD 형식)
B열: 쿠팡로켓
C열: 스마트스토어
D열: 쿠팡윙
E열: 기타온라인
F열: 도매
G열: 수출
H열: 총매출
I열: 환불액
J열: 주문수
K열: 특이사항
```

### 탭 3: 압구정곱창 (apgujeong_sales)
```
A열: 날짜 (YYYY-MM-DD 형식)
B열: 요일
C열: 카드매출
D열: 현금매출
E열: 배달매출
F열: 계좌이체
G열: 총매출
H열: 고객수
I열: 테이블회전율
J열: 현금입금
K열: 현금지출
L열: 지출사유
M열: 자재주문
N열: 특이사항
```

### 탭 4: 극진이앤지 (geukjin_sales)
```
A열: 날짜 (YYYY-MM-DD 형식)
B열: 휘발유매출
C열: 경유매출
D열: 등유매출
E열: 운송매출
F열: 총매출
G열: 휘발유원가
H열: 경유원가
I열: 등유원가
J열: 운송원가
K열: 총원가
L열: 휘발유마진
M열: 경유마진
N열: 등유마진
O열: 운송마진
P열: 총마진
Q열: 성장률
R열: 특이사항
```

## 3. 탭별 GID 확인

각 탭의 GID를 확인하는 방법:
1. 해당 탭 클릭
2. 브라우저 주소창에서 `#gid=` 뒤의 숫자가 GID
3. 예: `#gid=123456789`

확인된 GID를 `scripts/google-sheets-sync.js` 파일의 `SHEET_TABS` 객체에 업데이트:

```javascript
const SHEET_TABS = {
  warmguys: '0',        // 첫 번째 탭은 항상 0
  mrs: '실제GID입력',     // 두 번째 탭의 GID
  apgujeong: '실제GID입력', // 세 번째 탭의 GID  
  geukjin: '실제GID입력'    // 네 번째 탭의 GID
};
```

## 4. 테스트 방법

1. Google Sheets 공개 설정 완료 후
2. https://gma3561.github.io/warmguys_sales/google-sheets-sync.html 접속
3. "전체 데이터 동기화" 버튼 클릭
4. 로그 확인하여 동기화 상태 점검

## 5. 문제 해결

### 오류: "CSV 가져오기 실패"
- Google Sheets가 공개 설정되어 있는지 확인
- 브라우저에서 CSV URL 직접 접속 테스트:
  `https://docs.google.com/spreadsheets/d/1Qq0sgm9xyTPmhphzIhyo_-lI55F4M7SOTS2FEBvsvQU/export?format=csv&gid=0`

### 오류: "데이터 변환 실패"
- 스프레드시트의 컬럼 헤더가 지정된 형식과 일치하는지 확인
- 첫 번째 행이 헤더 행인지 확인

### 오류: "Supabase 업로드 실패"
- 네트워크 연결 상태 확인
- API 키가 올바른지 확인

## 6. 자동화 옵션

수동 동기화 외에도 다음 자동화 방법을 고려할 수 있습니다:

1. **Google Apps Script 트리거** (권장)
   - Google Sheets에서 데이터 변경 시 자동 동기화
   - 시간 기반 트리거로 정기 동기화

2. **GitHub Actions**
   - 정해진 시간마다 자동 동기화
   - 서버리스 환경에서 실행

3. **Webhook 연동**
   - Google Sheets 변경 시 즉시 동기화
   - 실시간 데이터 반영

설정이 완료되면 알려주세요!