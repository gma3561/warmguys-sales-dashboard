// 숫자 포맷팅 함수 (천 단위 콤마)
export function formatNumber(number) {
  if (number === undefined || number === null) return '0';
  return new Intl.NumberFormat('ko-KR').format(Math.round(number));
}

// 날짜 포맷팅 함수
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// 퍼센트 포맷팅 함수
export function formatPercent(value) {
  if (value === undefined || value === null) return '0%';
  return `${value.toFixed(1)}%`;
}

// 현재 날짜 기준 날짜 범위 계산 함수
export function getDateRanges() {
  const today = new Date();
  
  // 오늘
  const todayStr = today.toISOString().split('T')[0];
  
  // 어제
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // 이번주 (월~일)
  const thisWeekStart = new Date(today);
  const day = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // 월요일로 조정
  thisWeekStart.setDate(diff);
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
  
  // 지난주 (월~일)
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
  
  // 이번달
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  // 지난달
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  
  return {
    today: todayStr,
    yesterday: yesterdayStr,
    thisWeek: {
      start: thisWeekStart.toISOString().split('T')[0],
      end: thisWeekEnd.toISOString().split('T')[0]
    },
    lastWeek: {
      start: lastWeekStart.toISOString().split('T')[0],
      end: lastWeekEnd.toISOString().split('T')[0]
    },
    thisMonth: {
      start: thisMonthStart.toISOString().split('T')[0],
      end: thisMonthEnd.toISOString().split('T')[0]
    },
    lastMonth: {
      start: lastMonthStart.toISOString().split('T')[0],
      end: lastMonthEnd.toISOString().split('T')[0]
    }
  };
}

// 지정된 날짜 범위 내 데이터 필터링 함수
export function filterDataByDateRange(data, startDate, endDate) {
  if (!data || !Array.isArray(data)) return [];
  
  return data.filter(item => {
    const date = new Date(item.date);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });
}

// 채널별 합계 계산 함수
export function sumByChannel(data, channelFields) {
  if (!data || !Array.isArray(data) || data.length === 0) return {};
  
  return data.reduce((acc, item) => {
    channelFields.forEach(field => {
      if (item[field] !== undefined) {
        acc[field] = (acc[field] || 0) + parseFloat(item[field] || 0);
      }
    });
    return acc;
  }, {});
}

// 증감율 계산 함수
export function calculateGrowth(current, previous) {
  if (!previous || previous === 0) return { value: current, percent: 0 };
  
  const diff = current - previous;
  const percent = (diff / previous) * 100;
  
  return {
    value: diff,
    percent: parseFloat(percent.toFixed(1))
  };
}
