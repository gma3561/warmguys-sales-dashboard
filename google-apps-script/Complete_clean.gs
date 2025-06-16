/**
 * 따스한놈들 스프레드시트 연동 Apps Script - 최종 통합 버전
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
  },
  '극진이앤지매출': {
    tableName: 'fuel_transactions',
    companyType: 'fuel',
    startRow: 3  // 3행이 헤더, 4행부터 데이터
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
 * 연료 데이터만 동기화
 */
function syncFuelOnly() {
  console.log('=== 연료 데이터만 동기화 시작 ===');
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = '극진이앤지매출';
  const config = SHEET_CONFIG[sheetName];
  
  try {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      console.log('연료 시트를 찾을 수 없습니다');
      return { success: false, error: '시트 없음' };
    }
    
    // 시트 데이터 읽기
    const data = readSheetData(sheet, config);
    console.log(`연료 데이터: ${data.length}개 레코드 읽음`);
    
    // 데이터 변환
    const transformedData = transformDataForSupabase(data, config);
    console.log(`연료 데이터: ${transformedData.length}개 레코드 변환`);
    
    // Supabase에 업로드
    const uploadResult = uploadToSupabase(transformedData, config.tableName);
    
    console.log(`연료 데이터 동기화 ${uploadResult.success ? '성공' : '실패'}`);
    return uploadResult;
    
  } catch (error) {
    console.log('연료 데이터 동기화 오류:', error);
    return { success: false, error: error.toString() };
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
      const data = readSheetData(sheet, config);
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
function readSheetData(sheet, config) {
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length === 0) {
    return [];
  }
  
  // 시작 행 설정 (기본값: 1, 연료 데이터는 4)
  const startRow = (config && config.startRow) ? config.startRow - 1 : 0;
  
  // 첫 번째 행을 헤더로 사용
  const headers = values[startRow];
  const data = [];
  
  for (let i = startRow + 1; i < values.length; i++) {
    const row = {};
    headers.forEach((header, index) => {
      let value = values[i][index];
      
      // 헤더를 문자열로 변환 (null, undefined, 숫자 등 처리)
      const headerStr = header ? String(header).trim() : '';
      
      // 날짜 처리 - 헤더가 문자열인지 확인 후 처리
      if (headerStr && (
        headerStr.toLowerCase().includes('date') || 
        headerStr === '날짜' || 
        headerStr === '송금일자' || 
        headerStr === '입하일자'
      )) {
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
      
      // 원본 헤더를 키로 사용 (문자열로 변환)
      row[headerStr] = value;
    });
    
    // 날짜가 있는 행만 포함 (연료 데이터는 송금일자 확인)
    const dateField = config && config.companyType === 'fuel' ? '송금일자' : Object.keys(row)[0];
    if (row[dateField] && row[dateField] !== '') {
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
    } else if (companyType === 'fuel') {
      // 연료 유류 데이터 변환
      // 송금일자가 없으면 skip
      if (!row['송금일자']) {
        return null;
      }
      
      // 컬럼 인덱스 기반으로 데이터 추출 (A~W)
      // A-F: 원가/유류, G-I: 운임비, J-Q: 매출/유류, R-T: 유류마진, U-W: 운임마진
      const headers = Object.keys(row);
      
      // 필수 필드 확인 (NOT NULL 제약 조건)
      const purchaseSupplier = row[headers[1]] || ''; // B열: 발주처
      const fuelType = row[headers[2]] || ''; // C열: 유종
      const deliveryDestination = row[headers[12]] || ''; // M열: 납품처
      
      // 필수 필드가 비어있으면 skip
      if (!purchaseSupplier || !fuelType || !deliveryDestination) {
        console.log(`필수 필드 누락으로 행 제외: 발주처=${purchaseSupplier}, 유종=${fuelType}, 납품처=${deliveryDestination}`);
        return null;
      }
      
      // 숫자 필드 처리 (0으로 기본값 설정)
      const purchaseUnitPrice = parseFloat(row[headers[3]] || 0); // D열: 단가
      const purchaseVolume = parseInt(row[headers[4]] || 0); // E열: 리터
      const purchaseTotalAmount = parseInt(row[headers[5]] || 0); // F열: 합계
      const saleUnitPrice = parseFloat(row[headers[14]] || 0); // O열: 단가
      const saleVolume = parseInt(row[headers[15]] || 0); // P열: 리터
      const saleTotalAmount = parseInt(row[headers[16]] || 0); // Q열: 합계
      
      // 매출 관련 필수 필드가 모두 0이면 원가 데이터로 대체
      const finalSaleUnitPrice = saleUnitPrice > 0 ? saleUnitPrice : purchaseUnitPrice;
      const finalSaleVolume = saleVolume > 0 ? saleVolume : purchaseVolume;
      const finalSaleTotalAmount = saleTotalAmount > 0 ? saleTotalAmount : purchaseTotalAmount;
      
      return {
        transaction_date: row['송금일자'],
        settlement_month: parseInt(row[headers[10]] || new Date(row['송금일자']).getMonth() + 1), // K열: 매출귀속월
        
        // 원가 정보 (A-F) - 필수 필드
        purchase_supplier: purchaseSupplier,
        fuel_type: fuelType,
        purchase_unit_price: purchaseUnitPrice,
        purchase_volume: purchaseVolume,
        purchase_total_amount: purchaseTotalAmount,
        
        // 운임 정보 (G-I) - 선택 필드
        delivery_transport_fee: parseInt(row[headers[6]] || 0), // G열: 납품운임비
        order_transport_fee: parseInt(row[headers[7]] || 0), // H열: 발주운임비
        transport_company: row[headers[8]] || '', // I열: 업체명
        
        // 매출 정보 (J-Q) - 필수 필드
        delivery_date: row[headers[9]] || row['송금일자'], // J열: 입하일자
        order_branch: row[headers[11]] || '아산지점', // L열: 발주처
        delivery_destination: deliveryDestination, // M열: 납품처 (필수)
        sale_unit_price: finalSaleUnitPrice, // O열: 단가 (필수)
        sale_volume: finalSaleVolume, // P열: 리터 (필수)
        sale_total_amount: finalSaleTotalAmount, // Q열: 합계 (필수)
        
        // 마진 정보 (R-W) - 선택 필드
        fuel_margin_total: parseInt(row[headers[17]] || 0), // R열: 마진합계
        fuel_margin_supply_value: parseInt(row[headers[18]] || 0), // S열: 공급가액
        fuel_margin_tax: parseInt(row[headers[19]] || 0), // T열: 세액
        transport_margin_total: parseInt(row[headers[20]] || 0), // U열: 마진합계
        transport_margin_supply_value: parseInt(row[headers[21]] || 0), // V열: 공급가액
        transport_margin_tax: parseInt(row[headers[22]] || 0) // W열: 세액
      };
    }
    
    // 기본 변환
    return baseData;
  })
  .filter(row => row && (row.date || row.transaction_date)); // null 및 날짜가 없는 행 제거
}

/**
 * Supabase에 데이터 업로드
 */
function uploadToSupabase(data, tableName) {
  try {
    // 데이터가 없으면 스킵
    if (!data || data.length === 0) {
      console.log(`${tableName}: 업로드할 데이터가 없습니다`);
      return { success: true, recordCount: 0 };
    }
    
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
 * 연료 데이터 테스트
 */
function testFuelData() {
  console.log('=== 연료 데이터 테스트 ===');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('극진이앤지매출');
    
    if (!sheet) {
      console.log('연료 시트를 찾을 수 없습니다');
      return;
    }
    
    const data = readSheetData(sheet, SHEET_CONFIG['극진이앤지매출']);
    console.log('연료 데이터 개수:', data.length);
    
    if (data.length > 0) {
      console.log('연료 첫 번째 원본:', JSON.stringify(data[0], null, 2));
      
      const transformed = transformDataForSupabase(data.slice(0, 2), SHEET_CONFIG['극진이앤지매출']);
      console.log('연료 변환 데이터:', JSON.stringify(transformed[0], null, 2));
    }
    
  } catch (error) {
    console.log('연료 테스트 오류:', error.toString());
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
  const expectedSheets = ['압구정곱창 압구정점', '압구정곱창 가로수점', '엠알에스', '극진이앤지매출'];
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
 * 연료 시트 구조 상세 확인 - 디버깅용
 */
function debugFuelSheetStructure() {
  console.log('=== 연료 시트 구조 상세 분석 ===');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // 모든 시트 이름 확인
    const sheets = spreadsheet.getSheets();
    console.log('전체 시트 목록:');
    sheets.forEach((sheet, index) => {
      console.log(`${index + 1}. "${sheet.getName()}"`);
    });
    
    // 극진이앤지매출 시트 찾기
    const fuelSheet = spreadsheet.getSheetByName('극진이앤지매출');
    
    if (!fuelSheet) {
      console.log('❌ "극진이앤지매출" 시트를 찾을 수 없음');
      
      // 비슷한 이름의 시트 찾기
      const possibleSheets = sheets.filter(sheet => 
        sheet.getName().includes('극진') || 
        sheet.getName().includes('이앤지') || 
        sheet.getName().includes('매출')
      );
      
      if (possibleSheets.length > 0) {
        console.log('유사한 이름의 시트들:');
        possibleSheets.forEach(sheet => console.log(`- "${sheet.getName()}"`));
      }
      
      return;
    }
    
    console.log('✅ "극진이앤지매출" 시트 찾음');
    
    // 시트의 전체 데이터 범위 확인
    const dataRange = fuelSheet.getDataRange();
    const totalRows = dataRange.getNumRows();
    const totalCols = dataRange.getNumColumns();
    
    console.log(`전체 데이터 범위: ${totalRows}행 × ${totalCols}열`);
    
    if (totalRows === 0) {
      console.log('❌ 시트에 데이터가 없음');
      return;
    }
    
    // 처음 10행의 데이터 확인
    const sampleRows = Math.min(10, totalRows);
    const sampleData = fuelSheet.getRange(1, 1, sampleRows, totalCols).getValues();
    
    console.log(`처음 ${sampleRows}행 데이터:`);
    sampleData.forEach((row, index) => {
      console.log(`${index + 1}행: [${row.join(' | ')}]`);
    });
    
    // 4행부터 데이터 확인 (설정된 시작 행)
    if (totalRows >= 4) {
      console.log('\n=== 4행부터 데이터 분석 ===');
      
      // 4행을 헤더로 가정하고 확인
      const headerRow = sampleData[3]; // 4행 (0-based index 3)
      console.log('4행 (헤더로 추정): [' + headerRow.join(' | ') + ']');
      
      // 5행부터 실제 데이터 확인
      if (totalRows >= 5) {
        const dataRow = sampleData[4]; // 5행 (0-based index 4)
        console.log('5행 (첫 데이터로 추정): [' + dataRow.join(' | ') + ']');
        
        // 송금일자 위치 찾기
        const dateColumnIndex = headerRow.findIndex(cell => 
          cell && String(cell).includes('송금') || String(cell).includes('일자')
        );
        
        if (dateColumnIndex >= 0) {
          console.log(`송금일자 컬럼 위치: ${dateColumnIndex + 1}번째 (${String(headerRow[dateColumnIndex])})`);
          console.log(`첫 번째 데이터의 송금일자: ${dataRow[dateColumnIndex]}`);
        } else {
          console.log('❌ 송금일자 컬럼을 찾을 수 없음');
          console.log('헤더 분석:');
          headerRow.forEach((header, index) => {
            console.log(`  ${index + 1}열: "${String(header)}"`);
          });
        }
      }
    } else {
      console.log('❌ 4행 이상의 데이터가 없음');
    }
    
  } catch (error) {
    console.log('디버깅 오류:', error.toString());
  }
}

// ============================================
// 트리거 및 자동화 함수들
// ============================================

/**
 * 1시간 간격 트리거 설정 함수
 * 기존 트리거를 모두 삭제하고 1시간마다 동기화하는 새 트리거를 설정합니다.
 */
function setupHourlyTrigger() {
  console.log('1시간 간격 트리거 설정 시작');
  
  try {
    // 기존 트리거 모두 삭제
    const triggers = ScriptApp.getProjectTriggers();
    console.log(`기존 트리거 ${triggers.length}개 삭제 중...`);
    
    triggers.forEach(trigger => {
      ScriptApp.deleteTrigger(trigger);
    });
    
    // 1시간 간격 트리거 생성
    ScriptApp.newTrigger('syncAllSheetsToSupabase')
      .timeBased()
      .everyHours(1)
      .create();
    
    console.log('✓ 1시간 간격 트리거 설정 완료');
    
    // 즉시 한 번 동기화 실행
    console.log('즉시 동기화 실행 중...');
    const results = syncAllSheetsToSupabase();
    console.log('즉시 동기화 완료:', JSON.stringify(results, null, 2));
    
    return {
      success: true,
      message: '1시간 간격 트리거 설정 완료 및 즉시 동기화 실행됨',
      syncResults: results
    };
    
  } catch (error) {
    console.log('트리거 설정 오류:', error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * 현재 설정된 트리거 목록 확인
 */
function checkCurrentTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  
  console.log(`현재 설정된 트리거: ${triggers.length}개`);
  
  const triggerInfo = triggers.map(trigger => {
    return {
      handlerFunction: trigger.getHandlerFunction(),
      triggerSource: trigger.getTriggerSource().toString(),
      eventType: trigger.getEventType().toString()
    };
  });
  
  console.log('트리거 정보:', JSON.stringify(triggerInfo, null, 2));
  
  return triggerInfo;
}

/**
 * 모든 트리거 삭제
 */
function deleteAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  console.log(`${triggers.length}개 트리거 삭제 중...`);
  
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  
  console.log('모든 트리거 삭제 완료');
  return { success: true, deletedCount: triggers.length };
} 