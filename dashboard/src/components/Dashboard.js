import React, { useState, useEffect } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ko } from 'date-fns/locale';

// 로그인 상수
const LOGIN_CREDENTIALS = {
  username: 'Warmguys',
  password: 'Eksha12!@'
};

// 계열사 정보
const AFFILIATES = [
  { id: 'all', name: '전체 계열사', color: 'blue' },
  { id: 'warmguys', name: '웜가이즈', color: 'green' },
  { id: 'mrs', name: '엠알에스', color: 'purple' },
  { id: 'apgujeong', name: '압구정곱창', color: 'orange' },
  { id: 'geukjin', name: '극진이앤지', color: 'red' }
];

// 샘플 데이터 생성 함수
const generateSampleData = (affiliateId, days) => {
  const data = [];
  const baseMultiplier = {
    'warmguys': 1.0,
    'mrs': 0.7,
    'apgujeong': 0.5,
    'geukjin': 0.3
  };

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    if (affiliateId === 'all') {
      // 전체 계열사 합계
      let totalSales = 0;
      let totalOrders = 0;
      let totalRefunds = 0;
      
      Object.keys(baseMultiplier).forEach(affiliate => {
        const multiplier = baseMultiplier[affiliate];
        const sales = Math.floor((Math.random() * 3000000 + 2000000) * multiplier);
        const orders = Math.floor(sales / 80000);
        const refunds = Math.floor(sales * 0.02);
        
        totalSales += sales;
        totalOrders += orders;
        totalRefunds += refunds;
      });
      
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        affiliate: 'all',
        total_sales: totalSales,
        order_count: totalOrders,
        refund_amount: totalRefunds,
        channels: {
          online: Math.floor(totalSales * 0.6),
          offline: Math.floor(totalSales * 0.3),
          mobile: Math.floor(totalSales * 0.1)
        },
        categories: {
          main: Math.floor(totalSales * 0.5),
          side: Math.floor(totalSales * 0.3),
          drink: Math.floor(totalSales * 0.2)
        }
      });
    } else {
      const multiplier = baseMultiplier[affiliateId] || 1;
      const sales = Math.floor((Math.random() * 3000000 + 2000000) * multiplier);
      
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        affiliate: affiliateId,
        total_sales: sales,
        order_count: Math.floor(sales / 80000),
        refund_amount: Math.floor(sales * 0.02),
        channels: {
          online: Math.floor(sales * 0.6),
          offline: Math.floor(sales * 0.3),
          mobile: Math.floor(sales * 0.1)
        },
        categories: {
          main: Math.floor(sales * 0.5),
          side: Math.floor(sales * 0.3),
          drink: Math.floor(sales * 0.2)
        }
      });
    }
  }
  
  return data;
};

// 로그인 컴포넌트
const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === LOGIN_CREDENTIALS.username && password === LOGIN_CREDENTIALS.password) {
      onLogin(true);
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            계열사 매출 대시보드
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            로그인이 필요합니다
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="아이디"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 메인 대시보드 컴포넌트
export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentAffiliate = AFFILIATES.find(a => a.id === selectedAffiliate);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn, selectedAffiliate, selectedPeriod]);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const data = generateSampleData(selectedAffiliate, selectedPeriod);
      setSalesData(data);
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedAffiliate('all');
  };

  // 데이터 분석
  const totalSales = salesData.reduce((sum, item) => sum + item.total_sales, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.order_count, 0);
  const totalRefunds = salesData.reduce((sum, item) => sum + item.refund_amount, 0);
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const refundRate = totalSales > 0 ? (totalRefunds / totalSales) * 100 : 0;

  // 전일 대비 증감률
  const todayData = salesData[salesData.length - 1];
  const yesterdayData = salesData[salesData.length - 2];
  const dailyGrowth = yesterdayData && todayData ? 
    ((todayData.total_sales - yesterdayData.total_sales) / yesterdayData.total_sales) * 100 : 0;

  if (!isLoggedIn) {
    return <LoginForm onLogin={setIsLoggedIn} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">계열사 매출 대시보드</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${currentAffiliate?.color}-100 text-${currentAffiliate?.color}-800`}>
                {currentAffiliate?.name}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {format(new Date(), 'yyyy년 MM월 dd일', { locale: ko })}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 계열사 탭 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {AFFILIATES.map((affiliate) => (
              <button
                key={affiliate.id}
                onClick={() => setSelectedAffiliate(affiliate.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedAffiliate === affiliate.id
                    ? `border-${affiliate.color}-500 text-${affiliate.color}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {affiliate.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 기간 선택 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            {currentAffiliate?.name} 매출 현황
          </h2>
          <div className="flex space-x-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setSelectedPeriod(days)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedPeriod === days
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {days}일
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI 카드 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* 총 매출 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">💰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">총 매출</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {new Intl.NumberFormat('ko-KR', { 
                        style: 'currency', 
                        currency: 'KRW',
                        notation: 'compact',
                        maximumFractionDigits: 1
                      }).format(totalSales)}
                    </dd>
                    <dd className="text-sm text-gray-500">최근 {selectedPeriod}일</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* 전일 대비 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    dailyGrowth >= 0 ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    <span className="text-white text-lg">
                      {dailyGrowth >= 0 ? '📈' : '📉'}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">전일 대비</dt>
                    <dd className={`text-lg font-medium ${
                      dailyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {dailyGrowth >= 0 ? '+' : ''}{dailyGrowth.toFixed(1)}%
                    </dd>
                    <dd className="text-sm text-gray-500">성장률</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* 총 주문 수 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">📦</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">총 주문 수</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {totalOrders.toLocaleString()}
                    </dd>
                    <dd className="text-sm text-gray-500">최근 {selectedPeriod}일</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* 평균 객단가 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-600 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">🛒</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">평균 객단가</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {new Intl.NumberFormat('ko-KR', { 
                        style: 'currency', 
                        currency: 'KRW',
                        maximumFractionDigits: 0
                      }).format(avgOrderValue)}
                    </dd>
                    <dd className="text-sm text-gray-500">주문당 평균</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* 환불율 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">↩️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">환불율</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {refundRate.toFixed(1)}%
                    </dd>
                    <dd className="text-sm text-gray-500">총 매출 대비</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 차트 및 분석 섹션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 매출 추이 차트 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">매출 추이</h3>
          <div className="h-64 flex items-end space-x-1">
            {salesData.slice(-14).map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full bg-${currentAffiliate?.color}-600 rounded-t transition-all hover:bg-${currentAffiliate?.color}-700`}
                  style={{
                    height: `${(item.total_sales / Math.max(...salesData.map(d => d.total_sales))) * 100}%`,
                    minHeight: '4px'
                  }}
                  title={`${format(new Date(item.date), 'MM/dd')}: ${new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(item.total_sales)}`}
                ></div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>{format(new Date(salesData[Math.max(0, salesData.length - 14)]?.date || new Date()), 'MM/dd')}</span>
            <span>{format(new Date(salesData[salesData.length - 1]?.date || new Date()), 'MM/dd')}</span>
          </div>
        </div>

        {/* 채널별 & 카테고리별 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 채널별 분석 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">채널별 매출</h3>
            <div className="space-y-4">
              {todayData && [
                { name: '온라인', value: todayData.channels.online, color: 'blue' },
                { name: '오프라인', value: todayData.channels.offline, color: 'green' },
                { name: '모바일', value: todayData.channels.mobile, color: 'purple' }
              ].map((channel, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 bg-${channel.color}-500 rounded mr-3`}></div>
                    <span className="text-sm font-medium text-gray-900">{channel.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', notation: 'compact' }).format(channel.value)}
                    </span>
                    <div className="text-xs text-gray-500">
                      {((channel.value / todayData.total_sales) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 카테고리별 분석 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">상품별 매출</h3>
            <div className="space-y-4">
              {todayData && [
                { name: '주력상품', value: todayData.categories.main, color: 'red' },
                { name: '사이드메뉴', value: todayData.categories.side, color: 'yellow' },
                { name: '음료', value: todayData.categories.drink, color: 'indigo' }
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 bg-${category.color}-500 rounded mr-3`}></div>
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', notation: 'compact' }).format(category.value)}
                    </span>
                    <div className="text-xs text-gray-500">
                      {((category.value / todayData.total_sales) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 상세 데이터 테이블 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">일별 상세 데이터</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    매출
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주문 수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평균 객단가
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    환불액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    전일대비
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesData.slice(-10).reverse().map((item, index, arr) => {
                  const prevItem = arr[index + 1];
                  const dayGrowth = prevItem ? ((item.total_sales - prevItem.total_sales) / prevItem.total_sales) * 100 : 0;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(item.date), 'MM/dd (E)', { locale: ko })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(item.total_sales)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.order_count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(item.total_sales / item.order_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(item.refund_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {prevItem ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            dayGrowth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {dayGrowth >= 0 ? '+' : ''}{dayGrowth.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 푸터 여백 */}
      <div className="h-16"></div>
    </div>
  );
}