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
      const transformed = transformDataForSupabase(data.slice(0, 3), 'apgujeong');
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
      
      const transformed = transformDataForSupabase(data.slice(0, 2), 'mrs');
      console.log('MRS 변환 데이터:', JSON.stringify(transformed[0], null, 2));
    }
    
  } catch (error) {
    console.log('MRS 테스트 오류:', error.toString());
  }
}

/**
 * 직접 Supabase 테스트 (다른 방식)
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