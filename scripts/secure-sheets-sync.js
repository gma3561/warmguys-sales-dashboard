// 보안 강화된 Google Sheets 연동 스크립트
// Google Apps Script를 통한 서버리스 연동 방식

const SUPABASE_URL = 'https://ooqexropurnslqmcbjqk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNiamxxayIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ3NDc0MjA1LCJleHAiOjIwNjMwNTAyMDV9.yXVabxtZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbA';

// 보안 방법 1: 웹 앱 엔드포인트 사용
class SecureSheetsSync {
  constructor() {
    this.webAppUrl = null; // Google Apps Script 웹 앱 URL (나중에 설정)
    this.apiKey = null;    // 커스텀 API 키 (나중에 설정)
  }

  // 웹 앱 URL과 API 키 설정
  configure(webAppUrl, apiKey) {
    this.webAppUrl = webAppUrl;
    this.apiKey = apiKey;
  }

  // 보안 웹 앱을 통한 데이터 요청
  async fetchSecureData(company) {
    if (!this.webAppUrl || !this.apiKey) {
      throw new Error('웹 앱 URL과 API 키가 설정되지 않았습니다.');
    }

    try {
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getData',
          company: company,
          apiKey: this.apiKey,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`웹 앱 요청 실패: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return result.data;
    } catch (error) {
      console.error(`${company} 데이터 요청 실패:`, error);
      throw error;
    }
  }

  // Supabase에 안전하게 업로드
  async uploadToSupabase(data, tableName) {
    try {
      // 기존 데이터 삭제
      const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?id=neq.0`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        }
      });

      if (!deleteResponse.ok) {
        throw new Error(`데이터 삭제 실패: ${deleteResponse.statusText}`);
      }

      // 새 데이터 삽입
      const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
      });

      if (!insertResponse.ok) {
        throw new Error(`데이터 삽입 실패: ${insertResponse.statusText}`);
      }

      return true;
    } catch (error) {
      console.error(`${tableName} 업로드 실패:`, error);
      return false;
    }
  }

  // 전체 동기화
  async syncAllCompanies() {
    const companies = ['warmguys', 'mrs', 'apgujeong', 'geukjin'];
    const results = {};

    for (const company of companies) {
      try {
        console.log(`${company} 동기화 시작...`);
        
        const data = await this.fetchSecureData(company);
        const tableName = `${company}_sales`;
        const success = await this.uploadToSupabase(data, tableName);
        
        results[company] = {
          success,
          recordCount: data.length,
          message: success ? '성공' : '업로드 실패'
        };
        
      } catch (error) {
        results[company] = {
          success: false,
          recordCount: 0,
          message: error.message
        };
      }
    }

    return results;
  }
}

// 보안 방법 2: 서비스 계정 인증 (클라이언트 사이드에서는 불가능)
// 이 방법은 서버 환경에서만 사용 가능

// 보안 방법 3: OAuth 2.0 인증
class OAuthSheetsSync {
  constructor() {
    this.accessToken = null;
    this.spreadsheetId = '1Qq0sgm9xyTPmhphzIhyo_-lI55F4M7SOTS2FEBvsvQU';
  }

  // OAuth 토큰 설정
  setAccessToken(token) {
    this.accessToken = token;
  }

  // Google Sheets API를 통한 데이터 요청
  async fetchSheetData(sheetName, range = 'A:Z') {
    if (!this.accessToken) {
      throw new Error('OAuth 토큰이 설정되지 않았습니다.');
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${sheetName}!${range}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Google Sheets API 오류: ${response.statusText}`);
      }

      const result = await response.json();
      return this.parseSheetData(result.values);
      
    } catch (error) {
      console.error('시트 데이터 요청 실패:', error);
      throw error;
    }
  }

  // 시트 데이터를 객체 배열로 변환
  parseSheetData(values) {
    if (!values || values.length === 0) return [];
    
    const headers = values[0];
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[i][index] || '';
      });
      data.push(row);
    }
    
    return data;
  }
}

// 전역 인스턴스
window.secureSync = new SecureSheetsSync();
window.oauthSync = new OAuthSheetsSync();

// 설정 함수들
window.configureSecureSync = function(webAppUrl, apiKey) {
  window.secureSync.configure(webAppUrl, apiKey);
};

window.setOAuthToken = function(token) {
  window.oauthSync.setAccessToken(token);
};

// 동기화 함수들
window.syncViaWebApp = async function() {
  return await window.secureSync.syncAllCompanies();
};

window.syncViaOAuth = async function(sheetMappings) {
  const results = {};
  
  for (const [company, sheetName] of Object.entries(sheetMappings)) {
    try {
      const data = await window.oauthSync.fetchSheetData(sheetName);
      const transformedData = transformDataForSupabase(data, company);
      const tableName = `${company}_sales`;
      const success = await window.secureSync.uploadToSupabase(transformedData, tableName);
      
      results[company] = {
        success,
        recordCount: transformedData.length,
        message: success ? '성공' : '업로드 실패'
      };
      
    } catch (error) {
      results[company] = {
        success: false,
        recordCount: 0,
        message: error.message
      };
    }
  }
  
  return results;
};

// 데이터 변환 함수 (기존과 동일)
function transformDataForSupabase(rawData, companyType) {
  return rawData.map(row => {
    const transformed = {
      date: formatDate(row['날짜'] || row['Date'] || row['date']),
      notes: row['특이사항'] || row['비고'] || row['Notes'] || ''
    };
    
    switch (companyType) {
      case 'warmguys':
      case 'mrs':
        return {
          ...transformed,
          coupang_rocket: parseFloat(row['쿠팡로켓'] || row['Coupang Rocket'] || 0),
          smart_store: parseFloat(row['스마트스토어'] || row['Smart Store'] || 0),
          coupang_wing: parseFloat(row['쿠팡윙'] || row['Coupang Wing'] || 0),
          other_online: parseFloat(row['기타온라인'] || row['Other Online'] || 0),
          wholesale: parseFloat(row['도매'] || row['Wholesale'] || 0),
          export: parseFloat(row['수출'] || row['Export'] || 0),
          total_sales: parseFloat(row['총매출'] || row['Total Sales'] || 0),
          refund_amount: parseFloat(row['환불액'] || row['Refund'] || 0),
          order_count: parseInt(row['주문수'] || row['Order Count'] || 0)
        };
        
      case 'apgujeong':
        return {
          ...transformed,
          day_of_week: row['요일'] || row['Day'] || '',
          card_sales: parseFloat(row['카드매출'] || row['Card Sales'] || 0),
          cash_sales: parseFloat(row['현금매출'] || row['Cash Sales'] || 0),
          delivery_sales: parseFloat(row['배달매출'] || row['Delivery Sales'] || 0),
          account_transfer: parseFloat(row['계좌이체'] || row['Transfer'] || 0),
          total_sales: parseFloat(row['총매출'] || row['Total Sales'] || 0),
          customer_count: parseInt(row['고객수'] || row['Customers'] || 0),
          table_turnover: parseFloat(row['테이블회전율'] || row['Table Turnover'] || 0),
          special_notes: row['특이사항'] || row['Special Notes'] || '',
          cash_deposit: parseFloat(row['현금입금'] || row['Cash Deposit'] || 0),
          cash_expense: parseFloat(row['현금지출'] || row['Cash Expense'] || 0),
          expense_reason: row['지출사유'] || row['Expense Reason'] || '',
          material_order: parseFloat(row['자재주문'] || row['Material Order'] || 0),
          table_count: parseInt(row['테이블수'] || row['Table Count'] || 19)
        };
        
      case 'geukjin':
        return {
          ...transformed,
          gasoline_sales: parseFloat(row['휘발유매출'] || row['Gasoline Sales'] || 0),
          diesel_sales: parseFloat(row['경유매출'] || row['Diesel Sales'] || 0),
          kerosene_sales: parseFloat(row['등유매출'] || row['Kerosene Sales'] || 0),
          freight_sales: parseFloat(row['운송매출'] || row['Freight Sales'] || 0),
          total_sales: parseFloat(row['총매출'] || row['Total Sales'] || 0),
          gasoline_cost: parseFloat(row['휘발유원가'] || row['Gasoline Cost'] || 0),
          diesel_cost: parseFloat(row['경유원가'] || row['Diesel Cost'] || 0),
          kerosene_cost: parseFloat(row['등유원가'] || row['Kerosene Cost'] || 0),
          freight_cost: parseFloat(row['운송원가'] || row['Freight Cost'] || 0),
          total_cost: parseFloat(row['총원가'] || row['Total Cost'] || 0),
          gasoline_margin: parseFloat(row['휘발유마진'] || row['Gasoline Margin'] || 0),
          diesel_margin: parseFloat(row['경유마진'] || row['Diesel Margin'] || 0),
          kerosene_margin: parseFloat(row['등유마진'] || row['Kerosene Margin'] || 0),
          freight_margin: parseFloat(row['운송마진'] || row['Freight Margin'] || 0),
          total_margin: parseFloat(row['총마진'] || row['Total Margin'] || 0),
          growth_rate: parseFloat(row['성장률'] || row['Growth Rate'] || 0)
        };
        
      default:
        return transformed;
    }
  }).filter(row => row.date);
}

function formatDate(dateValue) {
  if (!dateValue) return null;
  
  if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateValue;
  }
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return null;
  
  return date.toISOString().split('T')[0];
}