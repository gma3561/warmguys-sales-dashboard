/**
 * 연료 유류 대시보드 JavaScript
 * Supabase에서 데이터를 가져와서 차트와 테이블에 표시
 */

// Supabase 설정
const SUPABASE_URL = 'https://ooqexropurnslqmcbjqk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNianFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NzQyMDUsImV4cCI6MjA2MzA1MDIwNX0.yXVabtxZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbuA';

// 전역 변수
let fuelData = [];
let filteredData = [];
let charts = {};

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

/**
 * 대시보드 초기화
 */
async function initializeDashboard() {
    showLoading(true);
    
    try {
        await loadFuelData();
        populateFilters();
        updateKPIs();
        createCharts();
        updateTable();
        updateLastUpdated();
    } catch (error) {
        console.error('대시보드 초기화 오류:', error);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
        showLoading(false);
    }
}

/**
 * Supabase에서 연료 데이터 가져오기
 */
async function loadFuelData() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/fuel_transactions?select=*&order=transaction_date.desc`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        fuelData = await response.json();
        filteredData = [...fuelData];
        
        console.log(`연료 데이터 ${fuelData.length}개 로드됨`);
        
    } catch (error) {
        console.error('데이터 로드 오류:', error);
        throw error;
    }
}

/**
 * 필터 옵션 채우기
 */
function populateFilters() {
    // 유종 필터
    const fuelTypes = [...new Set(fuelData.map(item => item.fuel_type))].filter(Boolean);
    const fuelTypeSelect = document.getElementById('fuelTypeFilter');
    fuelTypeSelect.innerHTML = '<option value="all">전체</option>';
    fuelTypes.forEach(type => {
        fuelTypeSelect.innerHTML += `<option value="${type}">${type}</option>`;
    });

    // 납품처 필터
    const destinations = [...new Set(fuelData.map(item => item.delivery_destination))].filter(Boolean);
    const destinationSelect = document.getElementById('destinationFilter');
    destinationSelect.innerHTML = '<option value="all">전체</option>';
    destinations.forEach(dest => {
        destinationSelect.innerHTML += `<option value="${dest}">${dest}</option>`;
    });
}

/**
 * KPI 업데이트
 */
function updateKPIs() {
    const totalTransactions = filteredData.length;
    const totalSales = filteredData.reduce((sum, item) => sum + (item.sale_total_amount || 0), 0);
    const totalVolume = filteredData.reduce((sum, item) => sum + (item.sale_volume || 0), 0);
    const avgPrice = totalVolume > 0 ? totalSales / totalVolume : 0;

    document.getElementById('totalTransactions').textContent = totalTransactions.toLocaleString() + '건';
    document.getElementById('totalSales').textContent = formatCurrency(totalSales);
    document.getElementById('totalVolume').textContent = totalVolume.toLocaleString() + 'L';
    document.getElementById('avgPrice').textContent = formatCurrency(avgPrice) + '/L';
}

/**
 * 차트 생성
 */
function createCharts() {
    createMonthlySalesChart();
    createFuelTypeChart();
    createDestinationChart();
    createDailyVolumeChart();
}

/**
 * 월별 매출 차트
 */
function createMonthlySalesChart() {
    const ctx = document.getElementById('monthlySalesChart').getContext('2d');
    
    // 월별 데이터 집계
    const monthlyData = {};
    filteredData.forEach(item => {
        const month = new Date(item.transaction_date).toISOString().substring(0, 7);
        if (!monthlyData[month]) {
            monthlyData[month] = 0;
        }
        monthlyData[month] += item.sale_total_amount || 0;
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(month => {
        const date = new Date(month + '-01');
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' });
    });
    const data = sortedMonths.map(month => monthlyData[month]);

    if (charts.monthlySalesChart) {
        charts.monthlySalesChart.destroy();
    }

    charts.monthlySalesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '매출액',
                data: data,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

/**
 * 유종별 비중 차트
 */
function createFuelTypeChart() {
    const ctx = document.getElementById('fuelTypeChart').getContext('2d');
    
    // 유종별 데이터 집계
    const fuelTypeData = {};
    filteredData.forEach(item => {
        const type = item.fuel_type || '기타';
        if (!fuelTypeData[type]) {
            fuelTypeData[type] = 0;
        }
        fuelTypeData[type] += item.sale_total_amount || 0;
    });

    const labels = Object.keys(fuelTypeData);
    const data = Object.values(fuelTypeData);
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

    if (charts.fuelTypeChart) {
        charts.fuelTypeChart.destroy();
    }

    charts.fuelTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * 납품처별 매출 차트
 */
function createDestinationChart() {
    const ctx = document.getElementById('destinationChart').getContext('2d');
    
    // 납품처별 데이터 집계
    const destinationData = {};
    filteredData.forEach(item => {
        const dest = item.delivery_destination || '기타';
        if (!destinationData[dest]) {
            destinationData[dest] = 0;
        }
        destinationData[dest] += item.sale_total_amount || 0;
    });

    // 상위 10개만 표시
    const sortedDestinations = Object.entries(destinationData)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

    const labels = sortedDestinations.map(([dest]) => dest);
    const data = sortedDestinations.map(([, amount]) => amount);

    if (charts.destinationChart) {
        charts.destinationChart.destroy();
    }

    charts.destinationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '매출액',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45
                    }
                }
            }
        }
    });
}

/**
 * 일별 거래량 차트
 */
function createDailyVolumeChart() {
    const ctx = document.getElementById('dailyVolumeChart').getContext('2d');
    
    // 일별 데이터 집계 (최근 30일)
    const dailyData = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    filteredData
        .filter(item => new Date(item.transaction_date) >= thirtyDaysAgo)
        .forEach(item => {
            const date = item.transaction_date;
            if (!dailyData[date]) {
                dailyData[date] = 0;
            }
            dailyData[date] += item.sale_volume || 0;
        });

    const sortedDates = Object.keys(dailyData).sort();
    const labels = sortedDates.map(date => {
        return new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    });
    const data = sortedDates.map(date => dailyData[date]);

    if (charts.dailyVolumeChart) {
        charts.dailyVolumeChart.destroy();
    }

    charts.dailyVolumeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '거래량 (L)',
                data: data,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + 'L';
                        }
                    }
                }
            }
        }
    });
}

/**
 * 테이블 업데이트
 */
function updateTable() {
    const tbody = document.getElementById('transactionTableBody');
    
    // 최근 50개 거래만 표시
    const recentData = filteredData.slice(0, 50);
    
    tbody.innerHTML = recentData.map(item => `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm">${formatDate(item.transaction_date)}</td>
            <td class="px-4 py-3 text-sm">${item.fuel_type || '-'}</td>
            <td class="px-4 py-3 text-sm">${item.delivery_destination || '-'}</td>
            <td class="px-4 py-3 text-sm text-right">${formatCurrency(item.sale_unit_price || 0)}</td>
            <td class="px-4 py-3 text-sm text-right">${(item.sale_volume || 0).toLocaleString()}L</td>
            <td class="px-4 py-3 text-sm text-right font-semibold">${formatCurrency(item.sale_total_amount || 0)}</td>
        </tr>
    `).join('');
}

/**
 * 필터 적용
 */
function applyFilters() {
    const periodFilter = document.getElementById('periodFilter').value;
    const fuelTypeFilter = document.getElementById('fuelTypeFilter').value;
    const destinationFilter = document.getElementById('destinationFilter').value;

    filteredData = fuelData.filter(item => {
        // 기간 필터
        if (periodFilter !== 'all') {
            const itemDate = new Date(item.transaction_date);
            const today = new Date();
            const daysDiff = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));
            
            switch (periodFilter) {
                case '7days':
                    if (daysDiff > 7) return false;
                    break;
                case '30days':
                    if (daysDiff > 30) return false;
                    break;
                case '3months':
                    if (daysDiff > 90) return false;
                    break;
            }
        }

        // 유종 필터
        if (fuelTypeFilter !== 'all' && item.fuel_type !== fuelTypeFilter) {
            return false;
        }

        // 납품처 필터
        if (destinationFilter !== 'all' && item.delivery_destination !== destinationFilter) {
            return false;
        }

        return true;
    });

    updateKPIs();
    createCharts();
    updateTable();
}

/**
 * 데이터 새로고침
 */
async function refreshData() {
    await initializeDashboard();
}

/**
 * CSV 내보내기
 */
function exportToCSV() {
    const headers = ['거래일자', '유종', '납품처', '단가', '리터', '총액'];
    const csvContent = [
        headers.join(','),
        ...filteredData.map(item => [
            item.transaction_date,
            item.fuel_type || '',
            item.delivery_destination || '',
            item.sale_unit_price || 0,
            item.sale_volume || 0,
            item.sale_total_amount || 0
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `연료거래내역_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

/**
 * 유틸리티 함수들
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ko-KR');
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

function updateLastUpdated() {
    const now = new Date();
    document.getElementById('lastUpdated').textContent = 
        `마지막 업데이트: ${now.toLocaleString('ko-KR')}`;
} 