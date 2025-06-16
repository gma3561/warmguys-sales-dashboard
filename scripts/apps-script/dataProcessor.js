// scripts/apps-script/dataProcessor.js

/**
 * 데이터 처리 클래스
 * 스프레드시트에서 가져온 데이터를 처리하고 검증하는 함수들을 포함
 */
class DataProcessor {
  /**
   * 매출 데이터 유효성 검사
   * @param {Object} data - 검증할 매출 데이터 객체
   * @return {Object} 검증 결과 (isValid, message)
   */
  validateSalesData(data) {
    // 날짜 필드 필수 확인
    if (!data.date) {
      return {
        isValid: false,
        message: '날짜 필드가 비어 있습니다.'
      };
    }
    
    // 날짜 형식 확인 (YYYY-MM-DD)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(data.date)) {
      return {
        isValid: false,
        message: `날짜 형식이 올바르지 않습니다: ${data.date}`
      };
    }
    
    // 숫자 필드 검사
    const numericFields = [
      'coupang_rocket', 'smart_store', 'coupang_wing', 
      'other_online', 'wholesale', 'export', 
      'total_sales', 'refund_amount'
    ];
    
    for (const field of numericFields) {
      if (isNaN(data[field])) {
        return {
          isValid: false,
          message: `${field} 필드가 숫자가 아닙니다: ${data[field]}`
        };
      }
      
      if (data[field] < 0) {
        return {
          isValid: false,
          message: `${field} 필드는 음수가 될 수 없습니다: ${data[field]}`
        };
      }
    }
    
    // 총 매출 검증
    const calculatedTotal = (
      data.coupang_rocket + 
      data.smart_store + 
      data.coupang_wing + 
      data.other_online + 
      data.wholesale + 
      data.export
    );
    
    // 반올림 오차를 허용하기 위해 소수점 2자리까지 자름
    const roundedCalculated = Math.round(calculatedTotal * 100) / 100;
    const roundedTotal = Math.round(data.total_sales * 100) / 100;
    
    // 총 매출이 각 채널별 매출의 합과 일치하는지 확인 (약간의 오차 허용)
    if (Math.abs(roundedCalculated - roundedTotal) > 1) {
      Logger.log(`총액 불일치: 계산됨=${roundedCalculated}, 입력됨=${roundedTotal}, 차이=${roundedCalculated - roundedTotal}`);
      // 오차가 1원 이상이면 자동 수정
      data.total_sales = calculatedTotal;
    }
    
    return {
      isValid: true,
      message: ''
    };
  }
  
  /**
   * 데이터 전처리
   * @param {Array} rows - 스프레드시트에서 가져온 행 데이터 배열
   * @param {Object} columnMappings - 컬럼 매핑 정보
   * @return {Array} 처리된 데이터 객체 배열
   */
  preprocessData(rows, columnMappings) {
    const processedData = [];
    
    // 헤더 행 찾기
    const headers = rows[0];
    const headerIndices = {};
    
    // 컬럼 인덱스 매핑
    for (const koreanHeader in columnMappings) {
      const index = headers.indexOf(koreanHeader);
      if (index > -1) {
        headerIndices[columnMappings[koreanHeader]] = index;
      }
    }
    
    // 데이터 행 처리
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // 빈 행 건너뛰기
      if (!row[headerIndices['date']]) {
        continue;
      }
      
      // 데이터 객체 생성
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
        refund_details: row[headerIndices['refund_details']] || ''
      };
      
      // 유효성 검사
      const validationResult = this.validateSalesData(salesData);
      if (validationResult.isValid) {
        processedData.push(salesData);
      } else {
        Logger.log(`행 ${i+1} 유효성 검사 실패: ${validationResult.message}`);
      }
    }
    
    return processedData;
  }
  
  /**
   * 이상치 감지
   * @param {Array} data - 매출 데이터 객체 배열
   * @param {Number} threshold - 이상치 감지 임계값 (기본값: 0.3)
   * @return {Array} 감지된 이상치 데이터 배열
   */
  detectAnomalies(data, threshold = 0.3) {
    if (!data || data.length < 8) {
      return []; // 최소 8일 데이터가 필요 (7일 평균 + 현재)
    }
    
    // 날짜 기준으로 정렬
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const anomalies = [];
    
    // 7일 이동 평균을 사용하여 이상치 감지
    for (let i = 7; i < data.length; i++) {
      // 이전 7일 매출 평균 계산
      let sum = 0;
      for (let j = i - 7; j < i; j++) {
        sum += data[j].total_sales;
      }
      const avgSales = sum / 7;
      
      // 현재 매출과 평균 간의 차이 계산
      const currentSales = data[i].total_sales;
      const deviation = Math.abs(currentSales - avgSales) / avgSales;
      
      // 임계값 초과 시 이상치로 감지
      if (deviation > threshold) {
        anomalies.push({
          date: data[i].date,
          total_sales: currentSales,
          avg_sales: avgSales,
          deviation_percent: deviation * 100
        });
      }
    }
    
    return anomalies;
  }
}