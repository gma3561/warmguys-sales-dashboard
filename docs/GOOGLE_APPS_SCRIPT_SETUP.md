# Google Apps Script 설정 가이드

## 📋 개요

Google Sheets의 매출 데이터를 Supabase로 자동 동기화하는 Apps Script 설정 방법입니다.

## 🔧 설정 단계

### 1. Google Sheets 준비

각 사업부별로 다음과 같은 구조의 시트를 준비합니다:

#### 압구정곱창 시트 구조
| 날짜 | 요일 | 카드매출 | 현금매출 | 배달매출 | 총매출 | 고객수 | 테이블회전율 | 특이사항 |
|------|------|----------|----------|----------|--------|--------|--------------|----------|

#### 엠알에스 시트 구조
| 날짜 | 쿠팡로켓 | 스마트스토어 | 쿠팡윙 | 기타온라인 | 도매 | 수출 | 총매출 | 환불액 | 환불내역 |
|------|----------|--------------|--------|------------|------|------|--------|--------|----------|

#### 극진이앤지 시트 구조
| 날짜 | 휘발유매출 | 경유매출 | 등유매출 | 화물매출 | 총매출 | 총원가 | 총마진 | 성장률 | 특이사항 |
|------|------------|----------|----------|----------|--------|--------|--------|--------|----------|

### 2. Apps Script 에디터 열기

1. Google Sheets 열기
2. 메뉴에서 `확장 프로그램` → `Apps Script` 클릭
3. 새 프로젝트가 열립니다

### 3. 스크립트 코드 추가

#### 압구정곱창 동기화 스크립트

```javascript
// Supabase 설정
const SUPABASE_URL = 'https://ooqexropurnslqmcbjqk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // 실제 키로 교체

// 압구정점 데이터 동기화
function syncApgujeongData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('압구정점');
  const data = sheet.getDataRange().getValues();
  
  // 헤더 제외하고 데이터 처리
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    // 빈 행 건너뛰기
    if (!row[0]) continue;
    
    const payload = {
      date: Utilities.formatDate(new Date(row[0]), 'GMT+9', 'yyyy-MM-dd'),
      day_of_week: row[1],
      card_sales: parseFloat(row[2]) || 0,
      cash_sales: parseFloat(row[3]) || 0,
      delivery_sales: parseFloat(row[4]) || 0,
      total_sales: parseFloat(row[5]) || 0,
      customer_count: parseInt(row[6]) || 0,
      table_turnover: parseFloat(row[7]) || 0,
      special_notes: row[8] || ''
    };
    
    // Supabase에 데이터 전송
    const response = UrlFetchApp.fetch(
      `${SUPABASE_URL}/rest/v1/apgujeong_apgujung_sales`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        payload: JSON.stringify(payload)
      }
    );
    
    if (response.getResponseCode() !== 201) {
      console.error('데이터 전송 실패:', response.getContentText());
    }
  }
}

// 가로수점 데이터 동기화 (동일한 구조)
function syncGarosuData() {
  // 압구정점과 동일한 로직으로 apgujeong_garosu_sales 테이블에 저장
}
```

#### 엠알에스 동기화 스크립트

```javascript
function syncMrsData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('엠알에스');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    
    const payload = {
      date: Utilities.formatDate(new Date(row[0]), 'GMT+9', 'yyyy-MM-dd'),
      coupang_rocket: parseFloat(row[1]) || 0,
      smart_store: parseFloat(row[2]) || 0,
      coupang_wing: parseFloat(row[3]) || 0,
      other_online: parseFloat(row[4]) || 0,
      wholesale: parseFloat(row[5]) || 0,
      export: parseFloat(row[6]) || 0,
      total_sales: parseFloat(row[7]) || 0,
      refund_amount: parseFloat(row[8]) || 0,
      refund_details: row[9] || ''
    };
    
    // mrs_sales 테이블에 저장
    const response = UrlFetchApp.fetch(
      `${SUPABASE_URL}/rest/v1/mrs_sales`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        payload: JSON.stringify(payload)
      }
    );
  }
}
```

#### 극진이앤지 동기화 스크립트

```javascript
function syncGeukjinData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('극진이앤지');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    
    const payload = {
      date: Utilities.formatDate(new Date(row[0]), 'GMT+9', 'yyyy-MM-dd'),
      gasoline_sales: parseFloat(row[1]) || 0,
      diesel_sales: parseFloat(row[2]) || 0,
      kerosene_sales: parseFloat(row[3]) || 0,
      freight_sales: parseFloat(row[4]) || 0,
      total_sales: parseFloat(row[5]) || 0,
      total_cost: parseFloat(row[6]) || 0,
      total_margin: parseFloat(row[7]) || 0,
      growth_rate: parseFloat(row[8]) || 0,
      special_notes: row[9] || ''
    };
    
    // geukjin_sales 테이블에 저장
    const response = UrlFetchApp.fetch(
      `${SUPABASE_URL}/rest/v1/geukjin_sales`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        payload: JSON.stringify(payload)
      }
    );
  }
}
```

### 4. 자동 실행 트리거 설정

1. Apps Script 에디터에서 시계 아이콘(트리거) 클릭
2. `트리거 추가` 클릭
3. 다음과 같이 설정:
   - 실행할 함수: `syncAllData` (모든 동기화 함수를 호출하는 메인 함수)
   - 이벤트 소스: 시간 기반
   - 시간 기반 트리거 유형: 시간 타이머
   - 시간 간격: 매시간

#### 메인 동기화 함수

```javascript
function syncAllData() {
  try {
    syncApgujeongData();
    syncGarosuData();
    syncMrsData();
    syncGeukjinData();
    
    console.log('모든 데이터 동기화 완료:', new Date());
  } catch (error) {
    console.error('동기화 오류:', error);
    
    // 오류 발생 시 이메일 알림 (선택사항)
    MailApp.sendEmail(
      'admin@warmguys.com',
      '매출 데이터 동기화 오류',
      `동기화 중 오류가 발생했습니다: ${error.toString()}`
    );
  }
}
```

### 5. 권한 승인

1. 처음 실행 시 권한 요청 팝업이 나타납니다
2. `권한 검토` → `고급` → `안전하지 않은 페이지로 이동` 클릭
3. Google 계정으로 로그인하고 권한 승인

## 🔍 문제 해결

### 데이터가 동기화되지 않을 때

1. **Supabase 키 확인**: API 키가 올바른지 확인
2. **테이블명 확인**: Supabase의 테이블명과 일치하는지 확인
3. **날짜 형식**: 날짜가 `YYYY-MM-DD` 형식인지 확인
4. **로그 확인**: Apps Script 에디터의 실행 로그 확인

### 중복 데이터 처리

`Prefer: resolution=merge-duplicates` 헤더를 사용하여 같은 날짜의 데이터는 자동으로 업데이트됩니다.

### 대량 데이터 처리

한 번에 많은 데이터를 처리할 때는 배치 처리를 고려하세요:

```javascript
function batchSync() {
  const batchSize = 100;
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    // 배치 처리 로직
    Utilities.sleep(1000); // 1초 대기
  }
}
```

## 📊 모니터링

### 실행 로그 확인

1. Apps Script 에디터에서 `실행` 탭 클릭
2. 각 실행의 상태와 로그 확인
3. 오류 발생 시 상세 내용 확인

### Supabase 대시보드

1. Supabase 프로젝트 대시보드 접속
2. Table Editor에서 데이터 확인
3. API Logs에서 요청 내역 확인

## 🔐 보안 주의사항

1. **API 키 보호**: Supabase API 키를 공개 저장소에 업로드하지 마세요
2. **권한 최소화**: 필요한 최소한의 권한만 부여
3. **정기 키 교체**: 보안을 위해 주기적으로 API 키 교체

---

**Last Updated**: 2025년 6월 4일 