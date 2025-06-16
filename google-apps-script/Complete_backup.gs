/**
 * 따스한놈들 스프레드시트 연동 Apps Script - 완전한 버전
 * 이 코드를 Google Sheets의 Apps Script 에디터에 직접 추가하세요.
 * 
 * 스프레드시트 URL: https://docs.google.com/spreadsheets/d/1Qq0sgm9xyTPmhphzIhyo_-lI55F4M7SOTS2FEBvsvQU/edit
 */

// Supabase 설정
const SUPABASE_URL = 'https://ooqexropurnslqmcbjqk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNianFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NzQyMDUsImV4cCI6MjA2MzA1MDIwNX0.yXVabtxZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbuA';

// 시트 매핑 설정 - 각 지점별 별도 테이블로 변경
const SHEET_CONFIG = {
  '압구정곱창 압구정점': {
    tableName: 'apgujeong_apgujung_sales',
    companyType: 'apgujeong'
  },
  '압구정곱창 가로수점': {
    tableName: 'apgujeong_garosu_sales',
    companyType: 'apgujeong'
  },
  '엠알에스': {
    tableName: 'mrs_sales',
    companyType: 'mrs'
  }
};

/**
 * 수동 동기화 함수 - 스크립트 에디터에서 실행 가능
 */
function manualSync() {
  console.log('=== 수동 동기화 시작 ===');
  
  try {
    const results = syncAllSheetsToSupabase();
    console.log('동기화 완료:', results);
    return results;
  } catch (error) {
    console.log('동기화 오류:', error);
    throw error;
  }
}

/**
 * 모든 시트를 Supabase와 동기화
 */
function syncAllSheetsToSupabase() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const results = {};
  
  // 각 시트별로 동기화
  for (const [sheetName, config] of Object.entries(SHEET_CONFIG)) {
    try {
      console.log(`${sheetName} 동기화 시작...`);
      
      const sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        console.log(`시트를 찾을 수 없습니다: ${sheetName}`);
        results[sheetName] = { success: false, error: '시트 없음' };
        continue;
      }
      
      // 시트 데이터 읽기
      const data = readSheetData(sheet);
      console.log(`${sheetName}: ${data.length}개 레코드 읽음`);
      
      // 데이터 변환
      const transformedData = transformDataForSupabase(data, config);
      console.log(`${sheetName}: ${transformedData.length}개 레코드 변환`);
      
      // Supabase에 업로드
      const uploadResult = uploadToSupabase(transformedData, config.tableName);
      
      results[sheetName] = {
        success: uploadResult.success,
        recordCount: transformedData.length,
        error: uploadResult.error
      };
      
      console.log(`${sheetName} 동기화 ${uploadResult.success ? '성공' : '실패'}`);
      
    } catch (error) {
      console.log(`${sheetName} 동기화 오류:`, error);
      results[sheetName] = { success: false, error: error.toString() };
    }
  }
  
  return results;
}

/**
 * 시트에서 데이터 읽기
 */
function readSheetData(sheet) {
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length === 0) {
    return [];
  }
  
  // 첫 번째 행을 헤더로 사용
  const headers = values[0];
  const data = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = {};
    headers.forEach((header, index) => {
      let value = values[i][index];
      
      // 날짜 처리
      if (header && (header.toLowerCase().includes('date') || header === '날짜')) {
        if (value instanceof Date) {
          value = Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        } else if (value) {
          // 문자열 날짜 변환 시도
          try {
            const dateObj = new Date(value);
            if (!isNaN(dateObj.getTime())) {
              value = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'yyyy-MM-dd');
            }
          } catch (e) {
            console.log(`날짜 변환 실패: ${value}`);
          }
        }
      }
      
      // 빈 셀 처리
      if (value === undefined || value === null) {
        value = '';
      }
      
      row[header] = value;
    });
    
    // 날짜가 있는 행만 포함
    if (row[headers[0]] && row[headers[0]] !== '') {
      data.push(row);
    }
  }
  
  return data;
}

/**
 * 데이터를 Supabase 형식으로 변환
 */
function transformDataForSupabase(rawData, config) {
  const companyType = config.companyType;
  
  return rawData.map(row => {
    const baseData = {
      date: row['날짜'] || null
    };
    
    if (companyType === 'apgujeong') {
      // 총매출 데이터
      const totalSales = parseFloat(row['총매출'] || 0);
      // 총매출이 0인 경우 skip하기 위해 null을 반환
      if (totalSales <= 0) {
        return null;
      }
      
      return {
        ...baseData,
        day_of_week: row['요일'] || '',
        card_sales: parseFloat(row['카드'] || 0),
        cash_sales: parseFloat(row['현금매출'] || 0),
        cash_receipt: parseFloat(row['현금영수증'] || 0),
        delivery_sales: parseFloat(row['배달'] || 0),
        account_transfer: parseFloat(row['계좌이체'] || 0),
        card_discount: parseFloat(row['카드할인'] || 0),
        cash_discount: parseFloat(row['현금할인'] || 0),
        total_sales: totalSales,
        customer_count: parseInt(row['고객 수'] || 0),
        table_turnover: parseFloat(row['회전율'] || 0),
        // 기본값 설정
        cash_deposit: 0,
        cash_held: 0,
        cash_expense: 0,
        expense_reason: '',
        material_order: 0,
        table_count: 19,
        special_notes: row['특이사항'] || ''
      };
    } else if (companyType === 'mrs') {
      // MRS 총매출
      const totalSales = parseFloat(row['총매출'] || 0);
      // 총매출이 0인 경우 skip하기 위해 null을 반환
      if (totalSales <= 0) {
        return null;
      }
      
      return {
        ...baseData,
        // MRS 필드들
        coupang_rocket: parseFloat(row['쿠팡로켓'] || 0),
        smart_store: parseFloat(row['스마트스토어'] || 0),
        coupang_wing: parseFloat(row['쿠팡윙'] || 0),
        other_online: parseFloat(row['기타 온라인'] || 0),
        wholesale: parseFloat(row['도매'] || 0),
        export: parseFloat(row['수출'] || 0),
        total_sales: totalSales,
        refund_amount: parseFloat(row['환불액'] || 0),
        refund_details: row['환불 내역'] || ''
      };
    }
    
    // 기본 변환
    return baseData;
  })
  .filter(row => row && row.date); // null 및 날짜가 없는 행 제거
}

/**
 * Supabase에 데이터 업로드
 */
function uploadToSupabase(data, tableName) {
  try {
    // 전체 데이터 삭제 후 새로 업로드
    const deleteOptions = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      }
    };
    
    const deleteResponse = UrlFetchApp.fetch(
      `${SUPABASE_URL}/rest/v1/${tableName}?id=neq.0`,
      deleteOptions
    );
    
    if (deleteResponse.getResponseCode() >= 400) {
      console.log(`삭제 요청 실패 - 상태코드: ${deleteResponse.getResponseCode()}`);
      console.log(`삭제 응답 내용: ${deleteResponse.getContentText()}`);
      throw new Error(`데이터 삭제 실패: ${deleteResponse.getResponseCode()} - ${deleteResponse.getContentText()}`);
    }
    
    console.log(`기존 ${tableName} 데이터 삭제 완료`);
    
    // 새 데이터 삽입
    const insertOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      payload: JSON.stringify(data)
    };
    
    const insertResponse = UrlFetchApp.fetch(
      `${SUPABASE_URL}/rest/v1/${tableName}`,
      insertOptions
    );
    
    if (insertResponse.getResponseCode() >= 400) {
      console.log(`삽입 요청 실패 - 상태코드: ${insertResponse.getResponseCode()}`);
      console.log(`삽입 응답 내용: ${insertResponse.getContentText()}`);
      console.log(`삽입 요청 데이터 샘플:`, JSON.stringify(data.slice(0, 2), null, 2));
      throw new Error(`데이터 삽입 실패: ${insertResponse.getResponseCode()} - ${insertResponse.getContentText()}`);
    }
    
    console.log(`${tableName}에 ${data.length}개 레코드 삽입 완료`);
    
    return { success: true, recordCount: data.length };
    
  } catch (error) {
    console.log(`Supabase 업로드 오류 상세:`, error.toString());
    console.log(`오류 스택:`, error.stack || 'No stack trace');
    return { success: false, error: error.toString() };
  }
}

// ============================================
// 테스트 함수들
// ============================================

/**
 * 데이터 변환 테스트 - Supabase 연결 없이
 */
function testDataTransformation() {
  console.log('=== 데이터 변환 테스트 시작 ===');
  
  try {
    // 압구정곱창 압구정점 데이터 테스트
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('압구정곱창 압구정점');
    
    if (!sheet) {
      console.log('시트를 찾을 수 없습니다');
      return;
    }
    
    // 시트 데이터 읽기
    const data = readSheetData(sheet);
    console.log('읽은 데이터 개수:', data.length);
    
    if (data.length > 0) {
      console.log('첫 번째 원본 데이터:', JSON.stringify(data[0], null, 2));
      
      // 데이터 변환
      const transformed = transformDataForSupabase(data.slice(0, 3), SHEET_CONFIG['압구정곱창 압구정점']);
      console.log('변환된 데이터 개수:', transformed.length);
      console.log('첫 번째 변환 데이터:', JSON.stringify(transformed[0], null, 2));
    }
    
  } catch (error) {
    console.log('데이터 변환 테스트 오류:', error.toString());
  }
}

/**
 * MRS 데이터 테스트
 */
function testMRSData() {
  console.log('=== MRS 데이터 테스트 ===');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('엠알에스');
    
    if (!sheet) {
      console.log('MRS 시트를 찾을 수 없습니다');
      return;
    }
    
    const data = readSheetData(sheet);
    console.log('MRS 데이터 개수:', data.length);
    
    if (data.length > 0) {
      console.log('MRS 첫 번째 원본:', JSON.stringify(data[0], null, 2));
      
      const transformed = transformDataForSupabase(data.slice(0, 2), SHEET_CONFIG['엠알에스']);
      console.log('MRS 변환 데이터:', JSON.stringify(transformed[0], null, 2));
    }
    
  } catch (error) {
    console.log('MRS 테스트 오류:', error.toString());
  }
}

/**
 * 연결 상태 확인 테스트
 */
function testConnectionStatus() {
  console.log('=== 연결 상태 확인 시작 ===');
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  console.log('스프레드시트 이름:', spreadsheet.getName());
  console.log('스프레드시트 ID:', spreadsheet.getId());
  
  // 실제 시트 이름들 확인
  const sheets = spreadsheet.getSheets();
  console.log('발견된 시트들:');
  sheets.forEach(sheet => {
    console.log('- ' + sheet.getName());
  });
  
  // 설정된 시트들과 비교
  const expectedSheets = ['압구정곱창 압구정점', '압구정곱창 가로수점', '엠알에스'];
  const results = {};
  
  expectedSheets.forEach(sheetName => {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (sheet) {
      const dataRange = sheet.getDataRange();
      const rowCount = dataRange.getNumRows();
      const colCount = dataRange.getNumColumns();
      
      results[sheetName] = {
        exists: true,
        rows: rowCount,
        columns: colCount,
        hasData: rowCount > 1
      };
      
      console.log(`✓ ${sheetName}: ${rowCount}행 ${colCount}열`);
      
      // 첫 번째 행(헤더) 확인
      if (rowCount > 0) {
        const headers = sheet.getRange(1, 1, 1, colCount).getValues()[0];
        console.log(`  헤더: ${headers.join(', ')}`);
      }
      
    } else {
      results[sheetName] = {
        exists: false,
        error: '시트를 찾을 수 없음'
      };
      console.log(`✗ ${sheetName}: 시트를 찾을 수 없음`);
    }
  });
  
  // Supabase 연결 테스트
  console.log('\n=== Supabase 연결 테스트 ===');
  try {
    const testResponse = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    });
    console.log('✓ Supabase 연결 성공, 상태코드:', testResponse.getResponseCode());
    results.supabase = { connected: true, status: testResponse.getResponseCode() };
  } catch (error) {
    console.log('✗ Supabase 연결 실패:', error.toString());
    results.supabase = { connected: false, error: error.toString() };
  }
  
  console.log('\n=== 연결 상태 요약 ===');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
}

/**
 * 직접 Supabase 테스트
 */
function testSupabaseDirectly() {
  console.log('=== 직접 Supabase 테스트 ===');
  
  try {
    // 테스트 데이터 생성
    const testData = [{
      date: '2025-05-22',
      day_of_week: '수',
      card_sales: 100000,
      cash_sales: 50000,
      delivery_sales: 30000,
      total_sales: 180000,
      customer_count: 50,
      table_turnover: 3.0,
      special_notes: '테스트',
      cash_receipt: 0,
      account_transfer: 0,
      card_discount: 0,
      cash_discount: 0,
      cash_deposit: 0,
      cash_held: 0,
      cash_expense: 0,
      expense_reason: '',
      material_order: 0,
      table_count: 19
    }];
    
    console.log('테스트 데이터 준비 완료');
    console.log('데이터:', JSON.stringify(testData[0], null, 2));
    
    // Supabase 업로드 시도
    const result = uploadToSupabase(testData, 'apgujeong_sales');
    console.log('업로드 결과:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('직접 테스트 오류:', error.toString());
  }
}

// ============================================
// 트리거 및 자동화 함수들
// ============================================

/**
 * 트리거 설정 함수 - 최초 1회만 실행
 */
function setupTriggers() {
  // 기존 트리거 삭제
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  
  // 시간 기반 트리거 설정 (매일 오전 9시)
  ScriptApp.newTrigger('dailySync')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
  
  // 스프레드시트 변경 트리거 설정
  ScriptApp.newTrigger('onEditSync')
    .for(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();
  
  console.log('트리거 설정 완료');
}

/**
 * 매일 자동 동기화 함수
 */
function dailySync() {
  console.log('일일 자동 동기화 시작');
  try {
    const results = syncAllSheetsToSupabase();
    console.log('일일 동기화 완료:', results);
  } catch (error) {
    console.log('일일 동기화 오류:', error);
  }
}

/**
 * 편집 시 자동 동기화
 */
function onEditSync(e) {
  // 편집된 시트가 설정된 시트인지 확인
  const editedSheetName = e.source.getActiveSheet().getName();
  
  if (SHEET_CONFIG[editedSheetName]) {
    console.log(`${editedSheetName} 편집 감지, 동기화 시작`);
    
    // 간단한 지연 (여러 편집이 연속으로 일어날 때 대비)
    Utilities.sleep(2000);
    
    try {
      const results = syncAllSheetsToSupabase();
      console.log('편집 후 동기화 완료:', results);
    } catch (error) {
      console.log('편집 후 동기화 오류:', error);
    }
  }
}

/**
 * 웹 앱 엔드포인트
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'active',
    timestamp: new Date().toISOString(),
    sheets: Object.keys(SHEET_CONFIG)
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    
    if (requestData.action === 'sync') {
      const results = syncAllSheetsToSupabase();
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        results: results
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: '지원하지 않는 액션입니다.'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}