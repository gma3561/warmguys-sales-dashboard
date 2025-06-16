/**
 * 간단한 연결 테스트 함수
 * Google Apps Script에서 실행하여 연결을 확인할 수 있습니다.
 */
function testConnection() {
  try {
    // 설정 정보
    const SUPABASE_URL = 'https://ooqexropurnsldqmcbjqk.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNianFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYwMDI0NTcsImV4cCI6MjAzMTU3ODQ1N30.KgDtdD9BdZEWHDCkXH0-yfkdUYj2rMEbpOdDfnKbRuY';
    
    // Supabase에 테스트 데이터 삽입
    const testData = {
      date: '2025-05-18',
      total_sales: 1000000,
      coupang_rocket: 500000,
      smart_store: 300000,
      coupang_wing: 200000,
      other_online: 0,
      wholesale: 0,
      export: 0,
      notes: '테스트 데이터',
      refund_amount: 0,
      refund_details: '',
      channel: '온라인',
      category: '종합',
      order_count: 20
    };
    
    const response = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/warmguys_sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Prefer': 'return=minimal'
      },
      payload: JSON.stringify(testData)
    });
    
    console.log(`응답 코드: ${response.getResponseCode()}`);
    console.log(`응답 내용: ${response.getContentText()}`);
    
    if (response.getResponseCode() === 201) {
      console.log('✅ 연결 성공! 테스트 데이터가 삽입되었습니다.');
      return { success: true, message: '연결 성공!' };
    } else {
      console.log('❌ 연결 실패');
      return { success: false, error: response.getContentText() };
    }
    
  } catch (error) {
    console.log(`❌ 오류 발생: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Google Sheets에서 데이터를 읽어서 확인하는 함수
 */
function testSheetReading() {
  try {
    const SPREADSHEET_ID = '18vNJXwSnhj7xWZYZztBJsEY5kYe0PuzCQvA_BsB4T1Q';
    const SHEET_NAME = 'Imported View';
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      console.log(`❌ 시트 '${SHEET_NAME}'를 찾을 수 없습니다.`);
      return { success: false, error: `시트 '${SHEET_NAME}'를 찾을 수 없습니다.` };
    }
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0];
    
    console.log(`✅ 시트 읽기 성공!`);
    console.log(`헤더: ${headers.join(', ')}`);
    console.log(`총 행 수: ${values.length}`);
    console.log(`데이터 행 수: ${values.length - 1}`);
    
    // 첫 번째 데이터 행 출력
    if (values.length > 1) {
      console.log(`첫 번째 데이터 행: ${values[1].join(', ')}`);
    }
    
    return { 
      success: true, 
      headers: headers,
      totalRows: values.length,
      dataRows: values.length - 1,
      firstDataRow: values.length > 1 ? values[1] : null
    };
    
  } catch (error) {
    console.log(`❌ 시트 읽기 오류: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * 전체 동기화 테스트 (한 행만)
 */
function testSingleRowSync() {
  try {
    const SPREADSHEET_ID = '18vNJXwSnhj7xWZYZztBJsEY5kYe0PuzCQvA_BsB4T1Q';
    const SHEET_NAME = 'Imported View';
    const SUPABASE_URL = 'https://ooqexropurnsldqmcbjqk.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNianFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYwMDI0NTcsImV4cCI6MjAzMTU3ODQ1N30.KgDtdD9BdZEWHDCkXH0-yfkdUYj2rMEbpOdDfnKbRuY';
    
    // 컬럼 매핑
    const columnMappings = {
      '날짜': 'date',
      '쿠팡로켓': 'coupang_rocket',
      '스마트스토어': 'smart_store',
      '쿠팡윙': 'coupang_wing',
      '기타 온라인': 'other_online',
      '도매': 'wholesale',
      '수출': 'export',
      '총매출': 'total_sales',
      '특이사항': 'notes',
      '환불액': 'refund_amount',
      '환불 내역': 'refund_details'
    };
    
    // 1. 시트에서 데이터 읽기
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0];
    
    if (values.length < 2) {
      console.log('❌ 데이터가 없습니다.');
      return { success: false, error: '데이터가 없습니다.' };
    }
    
    // 2. 헤더 인덱스 찾기
    const headerIndices = {};
    for (const koreanHeader in columnMappings) {
      const index = headers.indexOf(koreanHeader);
      if (index > -1) {
        headerIndices[columnMappings[koreanHeader]] = index;
      }
    }
    
    console.log('매핑된 컬럼들:', headerIndices);
    
    // 3. 첫 번째 데이터 행 처리
    const row = values[1];
    const salesData = {
      date: formatDate(row[headerIndices['date']]),
      coupang_rocket: parseNumber(row[headerIndices['coupang_rocket']]),
      smart_store: parseNumber(row[headerIndices['smart_store']]),
      coupang_wing: parseNumber(row[headerIndices['coupang_wing']]),
      other_online: parseNumber(row[headerIndices['other_online']]),
      wholesale: parseNumber(row[headerIndices['wholesale']]),
      export: parseNumber(row[headerIndices['export']]),
      total_sales: parseNumber(row[headerIndices['total_sales']]),
      notes: row[headerIndices['notes']] || '',
      refund_amount: parseNumber(row[headerIndices['refund_amount']]),
      refund_details: row[headerIndices['refund_details']] || '',
      channel: '온라인',
      category: '종합',
      order_count: Math.floor(parseNumber(row[headerIndices['total_sales']]) / 50000) || 1
    };
    
    console.log('변환된 데이터:', salesData);
    
    // 4. Supabase에 삽입
    const response = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/warmguys_sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Prefer': 'return=minimal'
      },
      payload: JSON.stringify(salesData)
    });
    
    console.log(`응답 코드: ${response.getResponseCode()}`);
    console.log(`응답 내용: ${response.getContentText()}`);
    
    if (response.getResponseCode() === 201) {
      console.log('✅ 단일 행 동기화 성공!');
      return { success: true, data: salesData };
    } else {
      console.log('❌ 동기화 실패');
      return { success: false, error: response.getContentText(), data: salesData };
    }
    
  } catch (error) {
    console.log(`❌ 동기화 오류: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

// 유틸리티 함수들
function formatDate(date) {
  if (!date) return null;
  
  if (typeof date === 'string') {
    return date;
  }
  
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    value = value.replace(/,/g, '');
  }
  
  const parsedValue = parseFloat(value);
  return isNaN(parsedValue) ? 0 : parsedValue;
}