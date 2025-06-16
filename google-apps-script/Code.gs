/**
 * Google Apps Script 웹 앱 - 따스한놈들 매출 데이터 연동
 * 이 스크립트를 Google Apps Script에 복사하여 웹 앱으로 배포하세요.
 */

// 보안 설정
const API_KEY = 'warmguys-secure-2025'; // 커스텀 API 키 (변경 필요)
const ALLOWED_ORIGINS = [
  'https://gma3561.github.io',
  'http://localhost',
  'https://localhost'
];

// 스프레드시트 설정
const SPREADSHEET_ID = '1Qq0sgm9xyTPmhphzIhyo_-lI55F4M7SOTS2FEBvsvQU';

// 시트별 매핑
const SHEET_MAPPINGS = {
  'warmguys': '따스한놈들',      // 실제 시트 이름으로 변경
  'mrs': '엠알에스',           // 실제 시트 이름으로 변경
  'apgujeong': '압구정곱창',    // 실제 시트 이름으로 변경
  'geukjin': '극진이앤지'      // 실제 시트 이름으로 변경
};

/**
 * 웹 앱 POST 요청 처리
 */
function doPost(e) {
  try {
    // CORS 헤더 설정
    const origin = e.parameter.origin || e.postData?.origin;
    
    // 원본 검증 (선택사항)
    if (origin && !ALLOWED_ORIGINS.some(allowed => origin.includes(allowed))) {
      return createResponse({
        error: '허용되지 않은 원본입니다.'
      }, 403);
    }
    
    // JSON 데이터 파싱
    let requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createResponse({
        error: '잘못된 JSON 형식입니다.'
      }, 400);
    }
    
    // API 키 검증
    if (requestData.apiKey !== API_KEY) {
      return createResponse({
        error: '유효하지 않은 API 키입니다.'
      }, 401);
    }
    
    // 액션별 처리
    switch (requestData.action) {
      case 'getData':
        return handleGetData(requestData);
      case 'getAll':
        return handleGetAllData();
      default:
        return createResponse({
          error: '지원하지 않는 액션입니다.'
        }, 400);
    }
    
  } catch (error) {
    console.error('웹 앱 오류:', error);
    return createResponse({
      error: '서버 내부 오류가 발생했습니다.',
      details: error.toString()
    }, 500);
  }
}

/**
 * GET 요청 처리 (간단한 상태 확인)
 */
function doGet(e) {
  return createResponse({
    status: 'active',
    timestamp: new Date().toISOString(),
    message: '따스한놈들 매출 데이터 API'
  });
}

/**
 * 특정 회사 데이터 가져오기
 */
function handleGetData(requestData) {
  try {
    const company = requestData.company;
    
    if (!company || !SHEET_MAPPINGS[company]) {
      return createResponse({
        error: '유효하지 않은 회사명입니다.'
      }, 400);
    }
    
    const sheetName = SHEET_MAPPINGS[company];
    const data = getSheetData(sheetName);
    
    return createResponse({
      company: company,
      data: data,
      recordCount: data.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`데이터 가져오기 오류 (${requestData.company}):`, error);
    return createResponse({
      error: '데이터를 가져오는 중 오류가 발생했습니다.',
      details: error.toString()
    }, 500);
  }
}

/**
 * 전체 회사 데이터 가져오기
 */
function handleGetAllData() {
  try {
    const allData = {};
    
    for (const [company, sheetName] of Object.entries(SHEET_MAPPINGS)) {
      try {
        allData[company] = getSheetData(sheetName);
      } catch (error) {
        console.error(`${company} 데이터 오류:`, error);
        allData[company] = [];
      }
    }
    
    return createResponse({
      data: allData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('전체 데이터 가져오기 오류:', error);
    return createResponse({
      error: '전체 데이터를 가져오는 중 오류가 발생했습니다.',
      details: error.toString()
    }, 500);
  }
}

/**
 * 시트에서 데이터 읽기
 */
function getSheetData(sheetName) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`시트를 찾을 수 없습니다: ${sheetName}`);
    }
    
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
        if (header.toLowerCase().includes('날짜') || header.toLowerCase().includes('date')) {
          if (value instanceof Date) {
            value = Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
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
    
  } catch (error) {
    console.error(`시트 데이터 읽기 오류 (${sheetName}):`, error);
    throw error;
  }
}

/**
 * HTTP 응답 생성
 */
function createResponse(data, statusCode = 200) {
  const response = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // CORS 헤더 추가
  response.setHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '3600'
  });
  
  return response;
}

/**
 * 수동 테스트 함수
 */
function testGetData() {
  const testRequest = {
    action: 'getData',
    company: 'warmguys',
    apiKey: API_KEY
  };
  
  const result = handleGetData(testRequest);
  console.log('테스트 결과:', result.getContent());
}

/**
 * 수동 테스트 - 전체 데이터
 */
function testGetAllData() {
  const result = handleGetAllData();
  console.log('전체 데이터 테스트:', result.getContent());
}

/**
 * 시트 이름 확인 함수
 */
function listSheetNames() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = spreadsheet.getSheets();
    
    console.log('사용 가능한 시트 목록:');
    sheets.forEach((sheet, index) => {
      console.log(`${index + 1}. ${sheet.getName()}`);
    });
    
    return sheets.map(sheet => sheet.getName());
  } catch (error) {
    console.error('시트 목록 가져오기 오류:', error);
    return [];
  }
}

/**
 * 설정 검증 함수
 */
function validateSetup() {
  console.log('=== 설정 검증 시작 ===');
  
  // 1. 스프레드시트 접근 테스트
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log('✅ 스프레드시트 접근 성공');
    
    // 2. 시트 목록 확인
    const sheetNames = listSheetNames();
    console.log('📋 시트 목록:', sheetNames);
    
    // 3. 매핑 검증
    console.log('🔍 시트 매핑 검증:');
    for (const [company, sheetName] of Object.entries(SHEET_MAPPINGS)) {
      if (sheetNames.includes(sheetName)) {
        console.log(`✅ ${company} -> ${sheetName}`);
      } else {
        console.log(`❌ ${company} -> ${sheetName} (시트 없음)`);
      }
    }
    
    // 4. 데이터 샘플 테스트
    console.log('📊 데이터 샘플:');
    const firstSheet = Object.values(SHEET_MAPPINGS)[0];
    if (sheetNames.includes(firstSheet)) {
      const sampleData = getSheetData(firstSheet);
      console.log(`${firstSheet}: ${sampleData.length}개 레코드`);
      if (sampleData.length > 0) {
        console.log('첫 번째 레코드:', JSON.stringify(sampleData[0], null, 2));
      }
    }
    
  } catch (error) {
    console.log('❌ 스프레드시트 접근 실패:', error);
  }
  
  console.log('=== 설정 검증 완료 ===');
}