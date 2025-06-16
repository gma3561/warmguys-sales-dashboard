/**
 * 구글 시트 연결 상태 확인 테스트 스크립트
 * 이 스크립트를 Google Apps Script에서 실행하여 연결을 확인하세요.
 */

function testConnectionStatus() {
  Logger.log('=== 연결 상태 확인 시작 ===');
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('스프레드시트 이름:', spreadsheet.getName());
  Logger.log('스프레드시트 ID:', spreadsheet.getId());
  
  // 실제 시트 이름들 확인
  const sheets = spreadsheet.getSheets();
  Logger.log('발견된 시트들:');
  sheets.forEach(sheet => {
    Logger.log('- ' + sheet.getName());
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
      
      Logger.log(`✓ ${sheetName}: ${rowCount}행 ${colCount}열`);
      
      // 첫 번째 행(헤더) 확인
      if (rowCount > 0) {
        const headers = sheet.getRange(1, 1, 1, colCount).getValues()[0];
        Logger.log(`  헤더: ${headers.join(', ')}`);
      }
      
    } else {
      results[sheetName] = {
        exists: false,
        error: '시트를 찾을 수 없음'
      };
      Logger.log(`✗ ${sheetName}: 시트를 찾을 수 없음`);
    }
  });
  
  // Supabase 연결 테스트
  Logger.log('\n=== Supabase 연결 테스트 ===');
  try {
    const testResponse = UrlFetchApp.fetch('https://ooqexropurnslqmcbjqk.supabase.co/rest/v1/', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNiamxxayIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ3NDc0MjA1LCJleHAiOjIwNjMwNTAyMDV9.yXVabxtZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbA'
      }
    });
    Logger.log('✓ Supabase 연결 성공, 상태코드:', testResponse.getResponseCode());
    results.supabase = { connected: true, status: testResponse.getResponseCode() };
  } catch (error) {
    Logger.log('✗ Supabase 연결 실패:', error.toString());
    results.supabase = { connected: false, error: error.toString() };
  }
  
  Logger.log('\n=== 연결 상태 요약 ===');
  Logger.log(JSON.stringify(results, null, 2));
  
  return results;
}

function quickDataTest() {
  Logger.log('=== 빠른 데이터 테스트 ===');
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('압구정곱창 압구정점');
  
  if (!sheet) {
    Logger.log('압구정곱창 압구정점 시트를 찾을 수 없습니다');
    return false;
  }
  
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  if (values.length < 2) {
    Logger.log('데이터가 충분하지 않습니다 (헤더 제외 최소 1행 필요)');
    return false;
  }
  
  Logger.log('헤더:', values[0].join(', '));
  Logger.log('첫 번째 데이터 행:', values[1].join(', '));
  
  // 간단한 데이터 변환 테스트
  const headers = values[0];
  const firstRow = values[1];
  const testRecord = {};
  
  headers.forEach((header, index) => {
    testRecord[header] = firstRow[index];
  });
  
  Logger.log('변환된 객체:', JSON.stringify(testRecord, null, 2));
  
  return true;
}