// Google Sheets 연동 스크립트
// 스프레드시트 ID: 1Qq0sgm9xyTPmhphzIhyo_-lI55F4M7SOTS2FEBvsvQU

const SPREADSHEET_ID = '1Qq0sgm9xyTPmhphzIhyo_-lI55F4M7SOTS2FEBvsvQU';
const SUPABASE_URL = 'https://ooqexropurnslqmcbjqk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNiamxxayIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ3NDc0MjA1LCJleHAiOjIwNjMwNTAyMDV9.yXVabxtZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbA';

// 구글 시트 탭별 GID (구글 시트에서 확인 필요)
const SHEET_TABS = {
  warmguys: '0',      // 첫 번째 탭 (기본값)
  mrs: '1234567890',  // MRS 탭의 GID
  apgujeong: '2345678901', // 압구정곱창 탭의 GID  
  geukjin: '3456789012'    // 극진이앤지 탭의 GID
};

// CSV URL 생성 함수
function getCSVUrl(gid = '0') {
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${gid}`;
}

// CSV 데이터를 파싱하는 함수
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());
    
    const row = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      
      // 숫자 변환
      if (!isNaN(value) && value !== '') {
        value = Number(value);
      }
      
      row[header] = value;
    });
    
    data.push(row);
  }
  
  return data;
}

// 데이터를 Supabase 형식으로 변환
function transformDataForSupabase(rawData, companyType) {
  return rawData.map(row => {
    // 공통 변환
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
  }).filter(row => row.date); // 날짜가 있는 행만 포함
}

// 날짜 형식 변환
function formatDate(dateValue) {
  if (!dateValue) return null;
  
  // 이미 YYYY-MM-DD 형식인 경우
  if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateValue;
  }
  
  // 날짜 객체로 변환
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return null;
  
  return date.toISOString().split('T')[0];
}

// Supabase에 데이터 업로드
async function uploadToSupabase(data, tableName) {
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
    console.error(`${tableName} 업로드 오류:`, error);
    return false;
  }
}

// 전체 동기화 함수
async function syncAllData() {
  const results = {};
  
  try {
    // 각 회사별 데이터 동기화
    for (const [company, gid] of Object.entries(SHEET_TABS)) {
      console.log(`${company} 데이터 동기화 시작...`);
      
      try {
        // CSV 데이터 가져오기
        const csvUrl = getCSVUrl(gid);
        const response = await fetch(csvUrl);
        
        if (!response.ok) {
          throw new Error(`CSV 가져오기 실패: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        const rawData = parseCSV(csvText);
        
        if (rawData.length === 0) {
          console.log(`${company}: 데이터가 없습니다.`);
          results[company] = { success: false, message: '데이터 없음' };
          continue;
        }
        
        // 데이터 변환
        const transformedData = transformDataForSupabase(rawData, company);
        
        // Supabase에 업로드
        const tableName = `${company}_sales`;
        const uploadSuccess = await uploadToSupabase(transformedData, tableName);
        
        results[company] = {
          success: uploadSuccess,
          recordCount: transformedData.length,
          message: uploadSuccess ? '성공' : '업로드 실패'
        };
        
        console.log(`${company}: ${uploadSuccess ? '성공' : '실패'} (${transformedData.length}개 레코드)`);
        
      } catch (error) {
        console.error(`${company} 동기화 오류:`, error);
        results[company] = { success: false, message: error.message };
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('전체 동기화 오류:', error);
    throw error;
  }
}

// 특정 회사 데이터만 동기화
async function syncCompanyData(company) {
  const gid = SHEET_TABS[company];
  if (!gid) {
    throw new Error(`알 수 없는 회사: ${company}`);
  }
  
  const csvUrl = getCSVUrl(gid);
  const response = await fetch(csvUrl);
  
  if (!response.ok) {
    throw new Error(`CSV 가져오기 실패: ${response.statusText}`);
  }
  
  const csvText = await response.text();
  const rawData = parseCSV(csvText);
  const transformedData = transformDataForSupabase(rawData, company);
  
  const tableName = `${company}_sales`;
  const success = await uploadToSupabase(transformedData, tableName);
  
  return {
    success,
    recordCount: transformedData.length,
    tableName
  };
}

// 브라우저에서 사용할 수 있도록 전역 함수로 등록
if (typeof window !== 'undefined') {
  window.syncAllData = syncAllData;
  window.syncCompanyData = syncCompanyData;
}

// Node.js 환경에서 사용
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    syncAllData,
    syncCompanyData,
    SPREADSHEET_ID,
    SHEET_TABS
  };
}