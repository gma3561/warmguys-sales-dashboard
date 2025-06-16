// 수정된 월별 버튼 생성 함수
function createMonthButtons() {
    const monthSelector = document.getElementById('month-selector');
    monthSelector.innerHTML = '';
    
    // 현재 년도와 월
    const currentYear = moment().year();
    const currentMonth = moment().month() + 1;
    
    // 1월부터 12월까지 모든 월 버튼 생성
    for (let monthNum = 1; monthNum <= 12; monthNum++) {
        const button = document.createElement('button');
        button.className = 'month-btn' + (monthNum === selectedMonth && currentYear === selectedYear ? ' active' : '');
        button.textContent = `${monthNum}월`;
        button.dataset.month = monthNum;
        button.dataset.year = currentYear;
        
        button.addEventListener('click', function() {
            // 이전 active 클래스 제거
            document.querySelectorAll('.month-btn').forEach(b => b.classList.remove('active'));
            // 현재 버튼에 active 클래스 추가
            this.classList.add('active');
            
            selectedMonth = parseInt(this.dataset.month);
            selectedYear = parseInt(this.dataset.year);
            
            loadData();
        });
        
        monthSelector.appendChild(button);
    }
}

// 수정된 기간별 데이터 처리 함수
function processDataByPeriod(data) {
    if (!data || data.length === 0) {
        console.log('처리할 데이터가 없습니다');
        return;
    }
    
    // moment.js에서 한 주의 시작을 월요일로 설정
    moment.locale('ko', {
        week: {
            dow: 1, // 월요일을 주의 시작으로 설정 (0: 일요일, 1: 월요일)
            doy: 4  // 한 해의 첫 번째 주는 1월 4일이 포함된 주
        }
    });
    
    // 날짜순 정렬
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 데이터 변수
    let currentData = [];
    let previousData = [];
    let currentDateRange = '';
    let previousDateRange = '';
    let comparisonType = '';
    let periodText = '';
    
    // 항상 선택된 월의 데이터도 유지 (테이블 표시용)
    let monthToDateData = sortedData;
    
    // 마지막 날짜 기준 (데이터가 없는 경우 현재 날짜 사용)
    const lastDate = sortedData.length > 0 ? 
        moment(sortedData[sortedData.length - 1].date) : 
        moment();
    
    // 기간별 데이터 처리
    if (currentPeriod === 'day') {
        // 일별 처리 (전일 동기대비)
        comparisonType = '전일 동기대비';
        
        // 현재 데이터 (당일)
        currentData = sortedData.filter(d => moment(d.date).isSame(lastDate, 'day'));
        currentDateRange = lastDate.format('YYYY년 MM월 DD일');
        
        // 이전 데이터 (전일)
        const prevDate = lastDate.clone().subtract(1, 'days');
        previousData = sortedData.filter(d => moment(d.date).isSame(prevDate, 'day'));
        previousDateRange = prevDate.format('YYYY년 MM월 DD일');
        
        periodText = `${currentDateRange} (${comparisonType}: ${previousDateRange})`;
        
        // 일별 버튼 텍스트 업데이트
        document.getElementById('day-btn').textContent = `일별 (${lastDate.format('MM/DD')})`;
    } 
    else if (currentPeriod === 'week') {
        // 주별 처리 (전주 동기대비)
        comparisonType = '전주 동기대비';
        
        // 현재 주의 시작일과 종료일 계산 (월요일 시작)
        const currentWeekStart = lastDate.clone().startOf('week');
        const currentWeekEnd = lastDate.clone();
        
        // 현재 데이터 (당주)
        currentData = sortedData.filter(d => {
            const date = moment(d.date);
            return date.isSameOrAfter(currentWeekStart, 'day') && 
                   date.isSameOrBefore(currentWeekEnd, 'day');
        });
        currentDateRange = `${currentWeekStart.format('YYYY년 MM월 DD일')} ~ ${currentWeekEnd.format('YYYY년 MM월 DD일')}`;
        
        // 이전 데이터 (전주)
        const prevWeekStart = currentWeekStart.clone().subtract(1, 'weeks');
        const prevWeekEnd = currentWeekEnd.clone().subtract(1, 'weeks');
        previousData = sortedData.filter(d => {
            const date = moment(d.date);
            return date.isSameOrAfter(prevWeekStart, 'day') && 
                   date.isSameOrBefore(prevWeekEnd, 'day');
        });
        previousDateRange = `${prevWeekStart.format('YYYY년 MM월 DD일')} ~ ${prevWeekEnd.format('YYYY년 MM월 DD일')}`;
        
        periodText = `${currentDateRange} (${comparisonType}: ${previousDateRange})`;
        
        // 주별 버튼 텍스트 업데이트
        document.getElementById('week-btn').textContent = `주별 (${currentWeekStart.format('MM/DD')}-${currentWeekEnd.format('MM/DD')})`;
    } 
    else {
        // 월별 처리 - 선택된 월의 데이터 처리
        comparisonType = '전월 동기대비';
        
        // 선택된 월의 데이터 처리 (현재 날짜보다 미래는 사용 불가)
        const today = moment();
        const selectedDate = moment().year(selectedYear).month(selectedMonth - 1);
        const monthStart = selectedDate.clone().startOf('month');
        
        // 현재 월인 경우 현재일까지, 과거 월인 경우 해당 월의 마지막일까지
        let monthEnd;
        if (selectedMonth === today.month() + 1 && selectedYear === today.year()) {
            monthEnd = today; // 현재일까지
        } else {
            monthEnd = selectedDate.clone().endOf('month'); // 해당 월의 마지막일까지
        }
        
        console.log('선택된 월 범위:', monthStart.format('YYYY-MM-DD'), '~', monthEnd.format('YYYY-MM-DD'));
        
        // 선택된 월의 데이터 필터링 (1일부터 현재일 또는 마지막일까지)
        currentData = sortedData.filter(d => {
            const date = moment(d.date);
            return date.isSameOrAfter(monthStart, 'day') && date.isSameOrBefore(monthEnd, 'day');
        });
        
        console.log('필터링된 데이터 수:', currentData.length);
        
        // 이전 월 동기간 데이터 (비교용)
        const prevMonthStart = monthStart.clone().subtract(1, 'month');
        const prevMonthEnd = prevMonthStart.clone().add(monthEnd.diff(monthStart, 'days'), 'days');
        
        previousData = sortedData.filter(d => {
            const date = moment(d.date);
            return date.isSameOrAfter(prevMonthStart, 'day') && date.isSameOrBefore(prevMonthEnd, 'day');
        });
        
        currentDateRange = `${monthStart.format('YYYY년 MM월 DD일')} ~ ${monthEnd.format('YYYY년 MM월 DD일')}`;
        previousDateRange = `${prevMonthStart.format('YYYY년 MM월 DD일')} ~ ${prevMonthEnd.format('YYYY년 MM월 DD일')}`;
        
        periodText = `${currentDateRange} (${comparisonType}: ${previousDateRange})`;
        
        // 버튼 텍스트 업데이트
        const monthText = selectedMonth === today.month() + 1 && selectedYear === today.year() 
            ? `${selectedYear}/${selectedMonth.toString().padStart(2, '0')} (1일~현재)`
            : `${selectedYear}/${selectedMonth.toString().padStart(2, '0')}`;
        document.getElementById('month-btn').textContent = `월별 (${monthText})`;
        
        // 차트와 테이블에 표시할 데이터
        monthToDateData = currentData;
    }
    
    // 데이터 집계
    const currentAggregated = aggregateData(currentData);
    const previousAggregated = aggregateData(previousData);
    
    console.log('집계된 현재 데이터:', currentAggregated);
    console.log('집계된 이전 데이터:', previousAggregated);
    
    // UI 업데이트
    updateKPIs(currentAggregated, previousAggregated, comparisonType);
    updateSalesTrendChart(monthToDateData, currentPeriod, comparisonType);
    updateDailySalesTable(currentData);
    
    // 기간 표시 업데이트
    document.getElementById('period-title').textContent = `${periodText} 매출 분석`;
}