// 따스한놈들 그룹 Google Sheets 연동 설정
// Supabase 연결을 위한 환경 변수
const SUPABASE_URL = 'https://ooqexropurnslqmcbjqk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNiamxxayIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ3NDc0MjA1LCJleHAiOjIwNjMwNTAyMDV9.yXVabxtZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbA';

// 따스한놈들 그룹사별 Google Sheets 설정
const AFFILIATE_CONFIGS = {
  // 지주사
  'WARMGUYS': {
    key: 'WARMGUYS',
    name: '따스한놈들',
    type: 'holding', // 지주사 구분
    spreadsheetId: '1kYrO5p3Q2mT8nH9vB1aU7Z6sM2lX4nKj3C5vFgB8W9D', // 실제 따스한놈들 스프레드시트 ID로 변경 필요
    sheetName: 'Sales Data',
    tableName: 'warmguys_sales',
    columns: {
      'A': 'date',        // 날짜
      'B': 'coupang_rocket', // 쿠팡로켓
      'C': 'smart_store',    // 스마트스토어  
      'D': 'coupang_wing',   // 쿠팡윙
      'E': 'other_online',   // 기타 온라인
      'F': 'wholesale',      // 도매
      'G': 'export',         // 수출
      'H': 'total_sales',    // 총매출
      'I': 'refund_amount',  // 환불액
      'J': 'refund_details', // 환불 내역
      'K': 'notes',          // 특이사항
      'L': 'order_count'     // 주문수량
    },
    skipRows: 1
  },
  
  // 계열사 1: 온라인 매출
  'MRS': {
    key: 'MRS',
    name: '엠알에스',
    type: 'subsidiary', // 계열사 구분
    business_type: 'online', // 사업 유형
    spreadsheetId: '18vNJXwSqhj7xWZYZztBJsEY5kYe0PuzCQvA_BsB4T1Q',
    sheetName: '시트명1',
    tableName: 'mrs_sales',
    columns: {
      'A': 'date',         // 날짜
      'B': 'coupang_rocket', // 쿠팡로켓
      'C': 'smart_store',    // 스마트스토어  
      'D': 'coupang_wing',   // 쿠팡윙
      'E': 'other_online',   // 기타 온라인
      'F': 'wholesale',      // 도매
      'G': 'export',         // 수출
      'H': 'total_sales',    // 총매출
      'I': 'refund_amount',  // 환불액
      'J': 'refund_details', // 환불 내역
      'K': 'notes',          // 특이사항
      'L': 'order_count'     // 주문수량
    },
    skipRows: 1 // 헤더 한 줄 제외
  },
  
  // 계열사 2: 오프라인 매점
  'APGUJEONG': {
    key: 'APGUJEONG',
    name: '압구정곱창',
    type: 'subsidiary', // 계열사 구분
    business_type: 'restaurant', // 사업 유형
    spreadsheetId: '1YNNadOC3mXv5ti1TxS1n4gZQ7qKOWNzi527rJkKFTqY',
    sheetName: '시트명1',
    tableName: 'apgujeong_sales',
    columns: {
      'A': 'date',           // 날짜
      'B': 'day_of_week',    // 요일
      'C': 'card_sales',     // 카드
      'D': 'cash_sales',     // 현금매출
      'E': 'cash_receipt',   // 현금영수증
      'F': 'delivery_sales', // 배달
      'G': 'account_transfer', // 계좌이체
      'H': 'card_discount',  // 카드할인
      'I': 'cash_discount',  // 현금할인  
      'J': 'total_sales',    // 총매출
      'K': 'customer_count', // 고객수
      'L': 'table_turnover', // 테이블회전율
      'M': 'special_notes',  // 특이사항
      'N': 'cash_deposit',   // 현금입금
      'O': 'cash_held',      // 현금보관
      'P': 'cash_expense',   // 현금지출
      'Q': 'expense_reason', // 지출사유
      'R': 'material_order', // 자재주문
      'S': 'table_count'     // 테이블수
    },
    skipRows: 1
  },
  
  // 계열사 3: 연료 매출
  'GEUKJIN': {
    key: 'GEUKJIN',
    name: '극진이앤지',
    type: 'subsidiary', // 계열사 구분
    business_type: 'energy', // 사업 유형
    spreadsheetId: '1kzw7D13mcCRRnEl4hxSFZVZtdroIZ9S3Lw8h302wgIU',
    sheetName: 'Sales Data',
    tableName: 'geukjin_sales',
    columns: {
      'A': 'date',          // 날짜
      'B': 'gasoline_sales', // 무연휘발유매출
      'C': 'diesel_sales',   // 경유매출
      'D': 'kerosene_sales', // 등유매출
      'E': 'freight_sales',  // 운송매출
      'F': 'total_sales',    // 총매출
      'G': 'gasoline_cost',  // 무연휘발유원가
      'H': 'diesel_cost',    // 경유원가
      'I': 'kerosene_cost',  // 등유원가
      'J': 'freight_cost',   // 운송원가
      'K': 'total_cost',     // 총원가
      'L': 'gasoline_margin', // 무연휘발유마진
      'M': 'diesel_margin',  // 경유마진
      'N': 'kerosene_margin', // 등유마진
      'O': 'freight_margin', // 운송마진
      'P': 'total_margin',   // 총마진
      'Q': 'growth_rate',    // 성장률
      'R': 'notes'           // 특이사항
    },
    skipRows: 1
  }
};

// 그룹사 유형별 분류
const GROUP_STRUCTURE = {
  holding: ['WARMGUYS'], // 지주사
  subsidiaries: ['MRS', 'APGUJEONG', 'GEUKJIN'], // 계열사들
  business_types: {
    online: ['MRS'], // 온라인 사업
    restaurant: ['APGUJEONG'], // 요식업
    energy: ['GEUKJIN'] // 에너지 사업
  }
};

// 동기화 설정
const SYNC_CONFIG = {
  batchSize: 100,          // 한번에 처리할 한 수
  maxRetries: 3,           // 재시도 횟수
  retryDelay: 1000,        // 재시도 간격 (ms)
  logLevel: 'INFO',        // 로그 레벨 (DEBUG, INFO, WARN, ERROR)
  enableValidation: true,  // 데이터 유효성 검사 활성화
  skipEmptyRows: true,     // 빈 행 건너뛰기
  skipInvalidDates: true   // 유효하지 않은 날짜 건너뛰기
};

// 날짜 형식 설정
const DATE_FORMATS = [
  'YYYY-MM-DD',
  'MM/DD/YYYY', 
  'DD/MM/YYYY',
  'YYYY/MM/DD'
];

// 에러 처리 설정
const ERROR_CONFIG = {
  sendEmail: false,        // 에러 시 이메일 발송
  emailRecipients: [],     // 이메일 수신자 목록
  slackWebhook: null,      // Slack 웹훅 URL
  logToConsole: true,      // 콘솔 로그 출력
  logToSheet: false        // 별도 시트에 로그 기록
};

// 설정 유효성 검사
function validateConfig() {
  const errors = [];
  
  // Supabase 설정 확인
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    errors.push('Supabase URL 또는 ANON KEY가 설정되지 않았습니다.');
  }
  
  // 그룹사별 설정 확인
  Object.keys(AFFILIATE_CONFIGS).forEach(key => {
    const config = AFFILIATE_CONFIGS[key];
    if (!config.spreadsheetId) {
      errors.push(`${config.name}(${key}) 스프레드시트 ID가 설정되지 않았습니다.`);
    }
    if (!config.tableName) {
      errors.push(`${config.name}(${key}) 테이블명이 설정되지 않았습니다.`);
    }
  });
  
  if (errors.length > 0) {
    console.error('설정 오류:', errors.join('\n'));
    return false;
  }
  
  return true;
}

// 설정 정보 로그 출력
function logConfig() {
  console.log('=== 따스한놈들 그룹 매출 동기화 설정 ===');
  console.log('Supabase URL:', SUPABASE_URL);
  console.log('전체 회사 수:', Object.keys(AFFILIATE_CONFIGS).length);
  
  console.log('\n=== 지주사 ===');
  GROUP_STRUCTURE.holding.forEach(key => {
    const config = AFFILIATE_CONFIGS[key];
    console.log(`${config.name}: ${config.spreadsheetId} (${config.sheetName})`);
  });
  
  console.log('\n=== 계열사 ===');
  GROUP_STRUCTURE.subsidiaries.forEach(key => {
    const config = AFFILIATE_CONFIGS[key];
    console.log(`${config.name}: ${config.spreadsheetId} (${config.business_type})`);
  });
  
  console.log('\n동기화 배치 크기:', SYNC_CONFIG.batchSize);
  console.log('로그 레벨:', SYNC_CONFIG.logLevel);
}

// 설정 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    AFFILIATE_CONFIGS,
    GROUP_STRUCTURE,
    SYNC_CONFIG,
    DATE_FORMATS,
    ERROR_CONFIG,
    validateConfig,
    logConfig
  };
}