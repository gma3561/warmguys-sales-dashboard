/**
 * 간단한 연결 테스트 - 권한 및 기본 설정 확인
 */
function simpleConnectionTest() {
  Logger.log('=== 간단한 연결 테스트 시작 ===');
  
  try {
    // 1. 기본 HTTP 요청 테스트
    Logger.log('1. 기본 HTTP 요청 테스트');
    const basicResponse = UrlFetchApp.fetch('https://httpbin.org/get');
    Logger.log('기본 HTTP 테스트 성공, 상태코드:', basicResponse.getResponseCode());
    
    // 2. Supabase URL 접근 테스트 (인증 없이)
    Logger.log('2. Supabase URL 기본 접근 테스트');
    try {
      const supabaseResponse = UrlFetchApp.fetch('https://ooqexropurnslqmcbjqk.supabase.co');
      Logger.log('Supabase 기본 접근 성공, 상태코드:', supabaseResponse.getResponseCode());
    } catch (supabaseError) {
      Logger.log('Supabase 기본 접근 실패:', supabaseError.toString());
    }
    
    // 3. Supabase REST API 접근 테스트
    Logger.log('3. Supabase REST API 접근 테스트');
    try {
      const apiResponse = UrlFetchApp.fetch('https://ooqexropurnslqmcbjqk.supabase.co/rest/v1/', {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNiamxxayIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ3NDc0MjA1LCJleHAiOjIwNjMwNTAyMDV9.yXVabxtZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbA'
        }
      });
      Logger.log('Supabase API 접근 성공, 상태코드:', apiResponse.getResponseCode());
      Logger.log('API 응답 내용:', apiResponse.getContentText().substring(0, 200));
    } catch (apiError) {
      Logger.log('Supabase API 접근 실패:', apiError.toString());
      Logger.log('오류 이름:', apiError.name);
      Logger.log('오류 메시지:', apiError.message);
    }
    
    // 4. 권한 확인
    Logger.log('4. Apps Script 권한 확인');
    const scriptProperties = PropertiesService.getScriptProperties();
    Logger.log('스크립트 속성 접근 가능');
    
    Logger.log('=== 연결 테스트 완료 ===');
    
  } catch (error) {
    Logger.log('전체 테스트 실패:', error.toString());
    Logger.log('오류 이름:', error.name);
    Logger.log('오류 메시지:', error.message);
    Logger.log('오류 스택:', error.stack);
  }
}

/**
 * 매우 간단한 시트 읽기 테스트
 */
function simpleSheetTest() {
  Logger.log('=== 간단한 시트 테스트 ===');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('스프레드시트 접근 성공');
    Logger.log('스프레드시트 이름:', spreadsheet.getName());
    Logger.log('스프레드시트 ID:', spreadsheet.getId());
    
    const sheets = spreadsheet.getSheets();
    Logger.log('시트 개수:', sheets.length);
    
    sheets.forEach((sheet, index) => {
      Logger.log(`시트 ${index + 1}: "${sheet.getName()}" - ${sheet.getLastRow()}행 ${sheet.getLastColumn()}열`);
    });
    
    if (sheets.length > 0) {
      const firstSheet = sheets[0];
      Logger.log('첫 번째 시트 상세 정보:');
      Logger.log('- 이름:', firstSheet.getName());
      Logger.log('- 마지막 행:', firstSheet.getLastRow());
      Logger.log('- 마지막 열:', firstSheet.getLastColumn());
      
      if (firstSheet.getLastRow() > 0 && firstSheet.getLastColumn() > 0) {
        const cellA1 = firstSheet.getRange('A1').getValue();
        Logger.log('- A1 셀 값:', cellA1);
      }
    }
    
  } catch (error) {
    Logger.log('시트 테스트 실패:', error.toString());
    Logger.log('오류 이름:', error.name);
    Logger.log('오류 메시지:', error.message);
  }
}