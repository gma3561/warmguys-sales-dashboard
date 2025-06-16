/**
 * 웜가이즈 다중 계열사 Google Sheets -> Supabase 동기화 메인 스크립트
 */

/**
 * 모든 활성화된 계열사의 데이터를 동기화
 */
function syncAllAffiliates() {
  Logger.log('=== 전체 계열사 동기화 시작 ===');
  
  const results = {};
  
  // ACTIVE_AFFILIATES 배열에 있는 계열사만 동기화
  for (const affiliateKey of ACTIVE_AFFILIATES) {
    Logger.log(`${affiliateKey} 동기화 시작...`);
    
    try {
      const result = syncAffiliateData(affiliateKey);
      results[affiliateKey] = result;
      Logger.log(`${affiliateKey} 동기화 완료: ${result.success ? '성공' : '실패'}`);
    } catch (error) {
      Logger.log(`${affiliateKey} 동기화 오류: ${error.toString()}`);
      results[affiliateKey] = { success: false, error: error.toString() };
    }
  }
  
  Logger.log('=== 전체 계열사 동기화 완료 ===');
  Logger.log('결과:', results);
  
  return results;
}

/**
 * 특정 계열사의 데이터를 동기화
 */
function syncAffiliateData(affiliateKey) {
  const supabaseClient = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // 동기화 로그 시작
  const logEntry = supabaseClient.startSyncLog(affiliateKey);
  
  try {
    // 해당 계열사의 스프레드시트 열기
    const spreadsheetId = SPREADSHEET_IDS[affiliateKey];
    const sheetName = SHEET_NAMES[affiliateKey];
    const columnMapping = COLUMN_MAPPINGS[affiliateKey];
    const tableName = TABLE_NAMES[affiliateKey];
    
    if (!spreadsheetId || spreadsheetId.startsWith('YOUR_')) {
      throw new Error(`${affiliateKey} 스프레드시트 ID가 설정되지 않았습니다.`);
    }
    
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`${affiliateKey} 시트를 찾을 수 없습니다: ${sheetName}`);
    }
    
    // 데이터 추출
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0];
    
    // 헤더 인덱스 매핑
    const headerIndices = {};
    for (const koreanHeader in columnMapping) {
      const index = headers.indexOf(koreanHeader);
      if (index > -1) {
        headerIndices[columnMapping[koreanHeader]] = index;
      }
    }
    
    // 데이터 처리 통계
    let rowsProcessed = 0;
    let rowsSuccessful = 0;
    let rowsFailed = 0;
    const errors = [];
    
    // 데이터 행 처리 (첫 번째 행은 헤더이므로 제외)
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      rowsProcessed++;
      
      // 빈 행 건너뛰기
      if (!row[headerIndices['date']]) {
        continue;
      }
      
      try {
        // 계열사별 데이터 변환
        const salesData = convertRowToSalesData(row, headerIndices, affiliateKey);
        
        // 데이터 유효성 검사
        if (!validateSalesData(salesData)) {
          rowsFailed++;
          errors.push({
            row: i + 1,
            message: '유효하지 않은 데이터',
            data: salesData
          });
          continue;
        }
        
        // Supabase에 데이터 저장
        const result = supabaseClient.upsertData(tableName, salesData);
        if (result.success) {
          rowsSuccessful++;
        } else {
          rowsFailed++;
          errors.push({
            row: i + 1,
            message: result.error,
            data: salesData
          });
        }
      } catch (error) {
        rowsFailed++;
        errors.push({
          row: i + 1,
          message: error.toString(),
          data: row
        });
      }
    }
    
    // 동기화 로그 완료
    const status = rowsFailed > 0 ? (rowsSuccessful > 0 ? 'partial' : 'error') : 'success';
    supabaseClient.completeSyncLog(logEntry.id, {
      status: status,
      rows_processed: rowsProcessed,
      rows_successful: rowsSuccessful,
      rows_failed: rowsFailed,
      error_details: errors.length > 0 ? JSON.stringify(errors) : null
    });
    
    return {
      success: status === 'success' || status === 'partial',
      rowsProcessed: rowsProcessed,
      rowsSuccessful: rowsSuccessful,
      rowsFailed: rowsFailed,
      errors: errors
    };
    
  } catch (error) {
    // 오류 발생 시 동기화 로그 업데이트
    supabaseClient.completeSyncLog(logEntry.id, {
      status: 'error',
      error_message: error.toString()
    });
    
    throw error;
  }
}

/**
 * 행 데이터를 계열사별 매출 데이터로 변환
 */
function convertRowToSalesData(row, headerIndices, affiliateKey) {
  switch (affiliateKey) {
    case 'MRS':
    case 'WARMGUYS':
      return convertOnlineSalesData(row, headerIndices);
      
    case 'APGUJEONG':
      return convertOfflineSalesData(row, headerIndices);
      
    case 'GEUKJIN':
      return convertFuelSalesData(row, headerIndices);
      
    default:
      throw new Error(`지원하지 않는 계열사: ${affiliateKey}`);
  }
}

/**
 * 온라인 매출 데이터 변환 (MRS, WARMGUYS)
 */
function convertOnlineSalesData(row, headerIndices) {
  return {
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
    order_count: Math.max(1, Math.floor(parseNumber(row[headerIndices['total_sales']]) / 50000))
  };
}

/**
 * 오프라인 매출 데이터 변환 (압구정곱창)
 */
function convertOfflineSalesData(row, headerIndices) {
  return {
    date: formatDate(row[headerIndices['date']]),
    day_of_week: row[headerIndices['day_of_week']] || '',
    card_sales: parseNumber(row[headerIndices['card_sales']]),
    cash_sales: parseNumber(row[headerIndices['cash_sales']]),
    cash_receipt: parseNumber(row[headerIndices['cash_receipt']]),
    delivery_sales: parseNumber(row[headerIndices['delivery_sales']]),
    account_transfer: parseNumber(row[headerIndices['account_transfer']]),
    card_discount: parseNumber(row[headerIndices['card_discount']]),
    cash_discount: parseNumber(row[headerIndices['cash_discount']]),
    total_sales: parseNumber(row[headerIndices['total_sales']]),
    customer_count: parseNumber(row[headerIndices['customer_count']]),
    table_turnover: parseFloat(row[headerIndices['table_turnover']] || 0),
    special_notes: row[headerIndices['special_notes']] || '',
    cash_deposit: parseNumber(row[headerIndices['cash_deposit']]),
    cash_held: parseNumber(row[headerIndices['cash_held']]),
    cash_expense: parseNumber(row[headerIndices['cash_expense']]),
    expense_reason: row[headerIndices['expense_reason']] || '',
    material_order: parseNumber(row[headerIndices['material_order']]),
    table_count: parseNumber(row[headerIndices['table_count']]) || 19
  };
}

/**
 * 연료 매출 데이터 변환 (극진이앤지)
 */
function convertFuelSalesData(row, headerIndices) {
  return {
    date: formatDate(row[headerIndices['date']]),
    gasoline_sales: parseNumber(row[headerIndices['gasoline_sales']]),
    diesel_sales: parseNumber(row[headerIndices['diesel_sales']]),
    kerosene_sales: parseNumber(row[headerIndices['kerosene_sales']]),
    freight_sales: parseNumber(row[headerIndices['freight_sales']]),
    total_sales: parseNumber(row[headerIndices['total_sales']]),
    gasoline_cost: parseNumber(row[headerIndices['gasoline_cost']]),
    diesel_cost: parseNumber(row[headerIndices['diesel_cost']]),
    kerosene_cost: parseNumber(row[headerIndices['kerosene_cost']]),
    freight_cost: parseNumber(row[headerIndices['freight_cost']]),
    total_cost: parseNumber(row[headerIndices['total_cost']]),
    gasoline_margin: parseNumber(row[headerIndices['gasoline_margin']]),
    diesel_margin: parseNumber(row[headerIndices['diesel_margin']]),
    kerosene_margin: parseNumber(row[headerIndices['kerosene_margin']]),
    freight_margin: parseNumber(row[headerIndices['freight_margin']]),
    total_margin: parseNumber(row[headerIndices['total_margin']]),
    growth_rate: parseFloat(row[headerIndices['growth_rate']] || 0),
    notes: row[headerIndices['notes']] || ''
  };
}

/**
 * 매출 데이터 유효성 검사
 */
function validateSalesData(data) {
  // 날짜 필드 필수
  if (!data.date) {
    return false;
  }
  
  // 총 매출이 음수이면 무효
  if (data.total_sales < 0) {
    return false;
  }
  
  return true;
}

/**
 * 날짜 형식 변환 (JavaScript Date -> YYYY-MM-DD)
 */
function formatDate(date) {
  if (!date) return null;
  
  // 이미 문자열이라면 그대로 반환
  if (typeof date === 'string') {
    // YYYY.MM.DD 형식을 YYYY-MM-DD로 변환
    if (date.includes('.')) {
      return date.replace(/\./g, '-');
    }
    return date;
  }
  
  // Date 객체가 아니라면 변환 시도
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 숫자 형식 변환 (문자열이나 기타 형식 -> 숫자)
 */
function parseNumber(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  // 이미 숫자라면 반환
  if (typeof value === 'number') {
    return value;
  }
  
  // 문자열인 경우 쉼표나 통화 기호 등 제거 후 변환
  if (typeof value === 'string') {
    // 통화 기호와 쉼표 제거
    value = value.replace(/[₩,]/g, '');
    // 음수 기호 처리
    const isNegative = value.includes('-');
    value = value.replace(/-/g, '');
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : (isNegative ? -parsed : parsed);
  }
  
  const parsedValue = parseFloat(value);
  return isNaN(parsedValue) ? 0 : parsedValue;
}

/**
 * 수동 트리거 함수 (Apps Script 에디터에서 직접 호출 가능)
 */
function manualSyncAll() {
  Logger.log('수동 전체 동기화 시작...');
  const result = syncAllAffiliates();
  Logger.log('동기화 결과:', result);
  return result;
}

/**
 * 특정 계열사만 수동 동기화
 */
function manualSyncMRS() {
  return syncAffiliateData('MRS');
}

function manualSyncAPGUJEONG() {
  return syncAffiliateData('APGUJEONG');
}

function manualSyncGEUKJIN() {
  return syncAffiliateData('GEUKJIN');
}

/**
 * 시간 기반 트리거용 함수 (1시간마다 실행)
 */
function scheduledSync() {
  syncAllAffiliates();
}

/**
 * 웹 앱으로 호출할 때 사용 (GET 요청 처리)
 */
function doGet(e) {
  const affiliateKey = e.parameter.affiliate;
  
  let result;
  if (affiliateKey && ACTIVE_AFFILIATES.includes(affiliateKey)) {
    result = syncAffiliateData(affiliateKey);
  } else {
    result = syncAllAffiliates();
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}