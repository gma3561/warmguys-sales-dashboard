import { useState, useEffect } from 'react';
import { formatNumber } from '../lib/utils';
import SalesTrendChart from './SalesTrendChart';
import SalesByChannelChart from './SalesByChannelChart';

const MRSDashboard = ({ salesData, kpis }) => {
  const [dailyData, setDailyData] = useState({ today: {}, yesterday: {} });
  const [weeklyData, setWeeklyData] = useState({ thisWeek: {}, lastWeek: {} });
  const [monthlyData, setMonthlyData] = useState({ thisMonth: {}, lastMonth: {} });
  
  // 채널별 매출 비교 데이터 처리
  useEffect(() => {
    if (!salesData || salesData.length === 0) return;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // 날짜 포맷 함수
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    // 오늘/어제 데이터
    const todayData = salesData.find(d => d.date === formatDate(today)) || {};
    const yesterdayData = salesData.find(d => d.date === formatDate(yesterday)) || {};
    setDailyData({ today: todayData, yesterday: yesterdayData });
    
    // 이번주/지난주 데이터
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay()); // 이번주 시작 (일요일)
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7); // 지난주 시작
    
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6); // 이번주 끝 (토요일)
    
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6); // 지난주 끝
    
    const thisWeekData = salesData.filter(d => {
      const date = new Date(d.date);
      return date >= thisWeekStart && date <= thisWeekEnd;
    });
    
    const lastWeekData = salesData.filter(d => {
      const date = new Date(d.date);
      return date >= lastWeekStart && date <= lastWeekEnd;
    });
    
    // 이번주/지난주 합계 계산
    const thisWeekTotal = calculateTotal(thisWeekData);
    const lastWeekTotal = calculateTotal(lastWeekData);
    
    setWeeklyData({ thisWeek: thisWeekTotal, lastWeek: lastWeekTotal });
    
    // 이번달/지난달 데이터
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const thisMonthData = salesData.filter(d => {
      const date = new Date(d.date);
      return date >= thisMonthStart && date <= today;
    });
    
    const lastMonthData = salesData.filter(d => {
      const date = new Date(d.date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });
    
    // 이번달/지난달 합계 계산
    const thisMonthTotal = calculateTotal(thisMonthData);
    const lastMonthTotal = calculateTotal(lastMonthData);
    
    setMonthlyData({ thisMonth: thisMonthTotal, lastMonth: lastMonthTotal });
    
  }, [salesData]);
  
  // 채널별 합계 계산 함수
  const calculateTotal = (data) => {
    return data.reduce((acc, item) => {
      acc.total_sales = (acc.total_sales || 0) + parseFloat(item.total_sales || 0);
      acc.coupang_rocket = (acc.coupang_rocket || 0) + parseFloat(item.coupang_rocket || 0);
      acc.smart_store = (acc.smart_store || 0) + parseFloat(item.smart_store || 0);
      acc.coupang_wing = (acc.coupang_wing || 0) + parseFloat(item.coupang_wing || 0);
      acc.other_online = (acc.other_online || 0) + parseFloat(item.other_online || 0);
      acc.wholesale = (acc.wholesale || 0) + parseFloat(item.wholesale || 0);
      acc.export = (acc.export || 0) + parseFloat(item.export || 0);
      acc.refund_amount = (acc.refund_amount || 0) + parseFloat(item.refund_amount || 0);
      return acc;
    }, {});
  };
  
  // 채널별 비교 계산 함수
  const calculateDiff = (current, previous, field) => {
    const currentValue = parseFloat(current[field] || 0);
    const previousValue = parseFloat(previous[field] || 0);
    
    if (previousValue === 0) return { value: 0, percent: 0 };
    
    const diff = currentValue - previousValue;
    const percent = (diff / previousValue) * 100;
    
    return {
      value: diff,
      percent: percent
    };
  };
  
  // 채널별 매출 차트 데이터
  const channelData = salesData.length > 0 
    ? [
        { name: '쿠팡로켓', value: salesData.reduce((sum, item) => sum + parseFloat(item.coupang_rocket || 0), 0) },
        { name: '스마트스토어', value: salesData.reduce((sum, item) => sum + parseFloat(item.smart_store || 0), 0) },
        { name: '쿠팡윙', value: salesData.reduce((sum, item) => sum + parseFloat(item.coupang_wing || 0), 0) },
        { name: '기타온라인', value: salesData.reduce((sum, item) => sum + parseFloat(item.other_online || 0), 0) },
        { name: '도매', value: salesData.reduce((sum, item) => sum + parseFloat(item.wholesale || 0), 0) },
        { name: '수출', value: salesData.reduce((sum, item) => sum + parseFloat(item.export || 0), 0) }
      ].filter(item => item.value > 0)
    : [];
  
  return (
    <div className="space-y-6">
      {/* KPI 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">총매출</h3>
          <p className="text-2xl font-bold">{formatNumber(kpis.totalSales || 0)}원</p>
          <p className={`text-sm ${kpis.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {kpis.growthRate >= 0 ? '↑' : '↓'} {Math.abs(kpis.growthRate || 0).toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">쿠팡로켓</h3>
          <p className="text-2xl font-bold">
            {formatNumber(salesData.reduce((sum, item) => sum + parseFloat(item.coupang_rocket || 0), 0))}원
          </p>
          <p className="text-sm text-gray-500">
            전체의 {(salesData.reduce((sum, item) => sum + parseFloat(item.coupang_rocket || 0), 0) / kpis.totalSales * 100 || 0).toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">스마트스토어</h3>
          <p className="text-2xl font-bold">
            {formatNumber(salesData.reduce((sum, item) => sum + parseFloat(item.smart_store || 0), 0))}원
          </p>
          <p className="text-sm text-gray-500">
            전체의 {(salesData.reduce((sum, item) => sum + parseFloat(item.smart_store || 0), 0) / kpis.totalSales * 100 || 0).toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">환불액</h3>
          <p className="text-2xl font-bold text-red-500">
            {formatNumber(salesData.reduce((sum, item) => sum + parseFloat(item.refund_amount || 0), 0))}원
          </p>
          <p className="text-sm text-gray-500">
            환불률 {kpis.refundRate?.toFixed(1) || 0}%
          </p>
        </div>
      </div>
      
      {/* 채널별 매출 (일/주/월) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 일별 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">일별 채널 비교</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">채널</span>
              <div className="flex space-x-4">
                <span className="text-gray-500">오늘</span>
                <span className="text-gray-500">어제</span>
                <span className="text-gray-500">증감</span>
              </div>
            </div>
            
            {['coupang_rocket', 'smart_store', 'coupang_wing', 'other_online', 'wholesale', 'export'].map((channel) => {
              const diff = calculateDiff(dailyData.today, dailyData.yesterday, channel);
              const channelNames = {
                coupang_rocket: '쿠팡로켓',
                smart_store: '스마트스토어',
                coupang_wing: '쿠팡윙',
                other_online: '기타온라인',
                wholesale: '도매',
                export: '수출'
              };
              
              return (
                <div key={channel} className="flex justify-between">
                  <span>{channelNames[channel]}</span>
                  <div className="flex space-x-4">
                    <span>{formatNumber(dailyData.today[channel] || 0)}</span>
                    <span>{formatNumber(dailyData.yesterday[channel] || 0)}</span>
                    <span className={diff.percent >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {diff.percent >= 0 ? '+' : ''}{diff.percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
            
            <div className="flex justify-between font-bold mt-2 pt-2 border-t">
              <span>총계</span>
              <div className="flex space-x-4">
                <span>{formatNumber(dailyData.today.total_sales || 0)}</span>
                <span>{formatNumber(dailyData.yesterday.total_sales || 0)}</span>
                <span className={calculateDiff(dailyData.today, dailyData.yesterday, 'total_sales').percent >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {calculateDiff(dailyData.today, dailyData.yesterday, 'total_sales').percent >= 0 ? '+' : ''}
                  {calculateDiff(dailyData.today, dailyData.yesterday, 'total_sales').percent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 주별 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">주별 채널 비교</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">채널</span>
              <div className="flex space-x-4">
                <span className="text-gray-500">이번주</span>
                <span className="text-gray-500">지난주</span>
                <span className="text-gray-500">증감</span>
              </div>
            </div>
            
            {['coupang_rocket', 'smart_store', 'coupang_wing', 'other_online', 'wholesale', 'export'].map((channel) => {
              const diff = calculateDiff(weeklyData.thisWeek, weeklyData.lastWeek, channel);
              const channelNames = {
                coupang_rocket: '쿠팡로켓',
                smart_store: '스마트스토어',
                coupang_wing: '쿠팡윙',
                other_online: '기타온라인',
                wholesale: '도매',
                export: '수출'
              };
              
              return (
                <div key={channel} className="flex justify-between">
                  <span>{channelNames[channel]}</span>
                  <div className="flex space-x-4">
                    <span>{formatNumber(weeklyData.thisWeek[channel] || 0)}</span>
                    <span>{formatNumber(weeklyData.lastWeek[channel] || 0)}</span>
                    <span className={diff.percent >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {diff.percent >= 0 ? '+' : ''}{diff.percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
            
            <div className="flex justify-between font-bold mt-2 pt-2 border-t">
              <span>총계</span>
              <div className="flex space-x-4">
                <span>{formatNumber(weeklyData.thisWeek.total_sales || 0)}</span>
                <span>{formatNumber(weeklyData.lastWeek.total_sales || 0)}</span>
                <span className={calculateDiff(weeklyData.thisWeek, weeklyData.lastWeek, 'total_sales').percent >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {calculateDiff(weeklyData.thisWeek, weeklyData.lastWeek, 'total_sales').percent >= 0 ? '+' : ''}
                  {calculateDiff(weeklyData.thisWeek, weeklyData.lastWeek, 'total_sales').percent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 월별 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">월별 채널 비교</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">채널</span>
              <div className="flex space-x-4">
                <span className="text-gray-500">이번달</span>
                <span className="text-gray-500">지난달</span>
                <span className="text-gray-500">증감</span>
              </div>
            </div>
            
            {['coupang_rocket', 'smart_store', 'coupang_wing', 'other_online', 'wholesale', 'export'].map((channel) => {
              const diff = calculateDiff(monthlyData.thisMonth, monthlyData.lastMonth, channel);
              const channelNames = {
                coupang_rocket: '쿠팡로켓',
                smart_store: '스마트스토어',
                coupang_wing: '쿠팡윙',
                other_online: '기타온라인',
                wholesale: '도매',
                export: '수출'
              };
              
              return (
                <div key={channel} className="flex justify-between">
                  <span>{channelNames[channel]}</span>
                  <div className="flex space-x-4">
                    <span>{formatNumber(monthlyData.thisMonth[channel] || 0)}</span>
                    <span>{formatNumber(monthlyData.lastMonth[channel] || 0)}</span>
                    <span className={diff.percent >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {diff.percent >= 0 ? '+' : ''}{diff.percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
            
            <div className="flex justify-between font-bold mt-2 pt-2 border-t">
              <span>총계</span>
              <div className="flex space-x-4">
                <span>{formatNumber(monthlyData.thisMonth.total_sales || 0)}</span>
                <span>{formatNumber(monthlyData.lastMonth.total_sales || 0)}</span>
                <span className={calculateDiff(monthlyData.thisMonth, monthlyData.lastMonth, 'total_sales').percent >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {calculateDiff(monthlyData.thisMonth, monthlyData.lastMonth, 'total_sales').percent >= 0 ? '+' : ''}
                  {calculateDiff(monthlyData.thisMonth, monthlyData.lastMonth, 'total_sales').percent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 추이 그래프 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">채널별 매출 추이</h3>
          <SalesTrendChart salesData={salesData} />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">채널별 비율</h3>
          <div className="h-64">
            <SalesByChannelChart channelData={channelData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MRSDashboard;
