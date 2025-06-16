/**
 * 유틸리티 함수 모음
 */

/**
 * 날짜 형식 변환 (JavaScript Date -> YYYY-MM-DD)
 * @param {Date|string} date - 변환할 날짜
 * @return {string} YYYY-MM-DD 형식의 문자열
 */
function formatDate(date) {
  if (!date) return null;
  
  // 이미 문자열이면 반환
  if (typeof date === 'string') {
    // YYYY-MM-DD 형식인지 확인
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (datePattern.test(date)) {
      return date;
    }
  }
  
  // Date 객체가 아니면 변환 시도
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  // 유효하지 않은 날짜인 경우
  if (isNaN(date.getTime())) {
    return null;
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 숫자 형식 변환 (문자열 또는 기타 형식 -> 숫자)
 * @param {*} value - 변환할 값
 * @return {number} 변환된 숫자
 */
function parseNumber(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  // 이미 숫자이면 반환
  if (typeof value === 'number') {
    return value;
  }
  
  // 문자열인 경우 쉼표, 통화 기호 등 제거 후 변환
  if (typeof value === 'string') {
    value = value.replace(/[^\d.-]/g, '');
  }
  
  const parsedValue = parseFloat(value);
  return isNaN(parsedValue) ? 0 : parsedValue;
}

/**
 * 날짜 범위 가져오기
 * @param {string} range - 'today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth'
 * @return {Object} 시작일과 종료일
 */
function getDateRange(range) {
  const now = new Date();
  const result = {
    start: null,
    end: null
  };
  
  switch (range) {
    case 'today':
      result.start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      result.end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
      
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      result.start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      result.end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
      break;
      
    case 'thisWeek':
      // 한 주의 시작을 월요일(1)으로 계산
      const dayOfWeek = now.getDay() || 7; // 일요일은 0이 아닌 7로 취급
      const diff = dayOfWeek - 1; // 월요일까지의 차이
      
      const monday = new Date(now);
      monday.setDate(monday.getDate() - diff);
      
      result.start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate());
      result.end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
      
    case 'lastWeek':
      // 지난 주 월요일과 일요일 계산
      const today = new Date(now);
      const currentDay = today.getDay() || 7;
      const lastMonday = new Date(today);
      lastMonday.setDate(today.getDate() - currentDay - 6);
      
      const lastSunday = new Date(today);
      lastSunday.setDate(today.getDate() - currentDay);
      
      result.start = new Date(lastMonday.getFullYear(), lastMonday.getMonth(), lastMonday.getDate());
      result.end = new Date(lastSunday.getFullYear(), lastSunday.getMonth(), lastSunday.getDate(), 23, 59, 59);
      break;
      
    case 'thisMonth':
      result.start = new Date(now.getFullYear(), now.getMonth(), 1);
      result.end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
      
    case 'lastMonth':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      
      result.start = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      result.end = new Date(lastDayOfLastMonth.getFullYear(), lastDayOfLastMonth.getMonth(), lastDayOfLastMonth.getDate(), 23, 59, 59);
      break;
  }
  
  // ISO 문자열로 변환 (YYYY-MM-DD)
  result.startStr = formatDate(result.start);
  result.endStr = formatDate(result.end);
  
  return result;
}

/**
 * 쉼표가 포함된 숫자 형식으로 변환
 * @param {number} number - 변환할 숫자
 * @param {number} decimals - 소수점 자리수 (기본값: 0)
 * @return {string} 쉼표가 포함된 문자열
 */
function formatNumber(number, decimals = 0) {
  return Number(number).toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * 원화 형식으로 변환
 * @param {number} number - 변환할 숫자
 * @param {number} decimals - 소수점 자리수 (기본값: 0)
 * @return {string} 원화 형식 문자열
 */
function formatCurrency(number, decimals = 0) {
  return Number(number).toLocaleString('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * 두 날짜 간의 차이 계산 (일 단위)
 * @param {Date|string} date1 - 첫 번째 날짜
 * @param {Date|string} date2 - 두 번째 날짜
 * @return {number} 일 단위 차이
 */
function getDaysDifference(date1, date2) {
  // 문자열을 Date 객체로 변환
  if (typeof date1 === 'string') {
    date1 = new Date(date1);
  }
  
  if (typeof date2 === 'string') {
    date2 = new Date(date2);
  }
  
  // 시간 부분을 제거하여 순수 날짜만 비교
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  
  // 밀리초 단위 차이를 일 단위로 변환
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
} 