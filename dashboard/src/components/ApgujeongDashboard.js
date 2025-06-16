import { useState, useEffect } from 'react';
import { formatNumber, formatPercent } from '../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const ApgujeongDashboard = ({ salesData, kpis }) => {
  // 지점 관련 상태 - 추후 구현을 위한 준비
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [branchOptions, setBranchOptions] = useState([{ value: 'all', label: '전체 지점' }]);
  
  // 매출 데이터를 일별로 그룹화
  const [dailySalesData, setDailySalesData] = useState([]);
  
  useEffect(() => {
    if (!salesData || salesData.length === 0) return;
    
    // 일별 데이터 정리
    const groupedData = salesData.map(item => ({
      date: item.date,
      cardSales: parseFloat(item.card_sales || 0),
      cashSales: parseFloat(item.cash_sales || 0),
      cashReceipt: parseFloat(item.cash_receipt || 0),
      deliverySales: parseFloat(item.delivery_sales || 0),
      accountTransfer: parseFloat(item.account_transfer || 0),
      totalSales: parseFloat(item.total_sales || 0),
      customerCount: parseInt(item.customer_count || 0),
      tableTurnover: parseFloat(item.table_turnover || 0)
    }));
    
    setDailySalesData(groupedData);
    
    // 지점 정보가 있다면 여기서 설정 (현재는 가상 데이터)
    // 실제 데이터에 지점 정보가 포함되면 이 부분을 수정
    setBranchOptions([
      { value: 'all', label: '전체 지점' },
      { value: 'gangnam', label: '강남점' },
      { value: 'sinsa', label: '신사점' }
    ]);
    
  }, [salesData]);
  
  // 기간별 매출 추이 데이터 계산
  const trendData = dailySalesData.slice(-30); // 최근 30일 데이터
  
  // 카드/현금 비율 계산
  const totalCardSales = dailySalesData.reduce((sum, item) => sum + item.cardSales, 0);
  const totalCashSales = dailySalesData.reduce((sum, item) => sum + item.cashSales + item.cashReceipt, 0);
  const totalDeliverySales = dailySalesData.reduce((sum, item) => sum + item.deliverySales, 0);
  const totalAccountTransfer = dailySalesData.reduce((sum, item) => sum + item.accountTransfer, 0);
  
  const paymentMethodData = [
    { name: '카드', value: totalCardSales },
    { name: '현금', value: totalCashSales },
    { name: '배달', value: totalDeliverySales },
    { name: '계좌이체', value: totalAccountTransfer }
  ];
  
  // 테이블 회전율 추이
  const tableTurnoverData = dailySalesData.slice(-14); // 최근 14일 데이터
  
  return (
    <div className="space-y-6">
      {/* 지점 선택 기능 (미래 구현을 위한 UI) */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">지점 선택</h3>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="border rounded px-3 py-1"
          >
            {branchOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-500">
          현재 데이터에는 지점 정보가 포함되어 있지 않습니다. 지점별 데이터가 필요하다면 데이터베이스에 지점 컬럼을 추가해야 합니다.
        </p>
      </div>
      
      {/* KPI 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">총매출</h3>
          <p className="text-2xl font-bold">{formatNumber(kpis.totalSales || 0)}원</p>
          <p className={`text-sm ${kpis.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {kpis.growthRate >= 0 ? '↑' : '↓'} {Math.abs(kpis.growthRate || 0).toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">카드 매출</h3>
          <p className="text-2xl font-bold">{formatNumber(totalCardSales)}원</p>
          <p className="text-sm text-gray-500">
            전체의 {formatPercent(totalCardSales / kpis.totalSales * 100 || 0)}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">총 고객수</h3>
          <p className="text-2xl font-bold">{formatNumber(dailySalesData.reduce((sum, item) => sum + item.customerCount, 0))}명</p>
          <p className="text-sm text-gray-500">
            객단가 {formatNumber(kpis.totalSales / dailySalesData.reduce((sum, item) => sum + item.customerCount, 0))}원
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">평균 테이블 회전율</h3>
          <p className="text-2xl font-bold">{(dailySalesData.reduce((sum, item) => sum + item.tableTurnover, 0) / dailySalesData.length || 0).toFixed(1)}회</p>
          <p className="text-sm text-gray-500">
            최고 {Math.max(...dailySalesData.map(item => item.tableTurnover || 0)).toFixed(1)}회
          </p>
        </div>
      </div>
      
      {/* 일별 상세 데이터 */}
      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <h3 className="text-lg font-medium mb-3">일별 매출 상세</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">카드</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">현금</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">현금영수증</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">배달</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">계좌이체</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">고객수</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">테이블회전율</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">총매출</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dailySalesData.slice().reverse().map((day, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-4 py-2 whitespace-nowrap text-sm">{day.date}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{formatNumber(day.cardSales)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{formatNumber(day.cashSales)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{formatNumber(day.cashReceipt)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{formatNumber(day.deliverySales)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{formatNumber(day.accountTransfer)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{day.customerCount}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{day.tableTurnover.toFixed(1)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-bold">{formatNumber(day.totalSales)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 그래프 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 매출 추이 그래프 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">총매출 추이</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${formatNumber(value)}원`, '매출']}
                  labelFormatter={(label) => `날짜: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalSales"
                  name="총매출"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* 결제 방식 분포 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">결제 방식 분포</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={paymentMethodData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${formatNumber(value)}원`, '매출']}
                />
                <Legend />
                <Bar dataKey="value" name="매출액" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* 고객수 & 테이블 회전율 추이 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">고객수 & 테이블 회전율 추이</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={tableTurnoverData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="customerCount"
                  name="고객수"
                  stroke="#8884d8"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="tableTurnover"
                  name="테이블회전율"
                  stroke="#82ca9d"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* 결제 방식별 일간 추이 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">결제 방식별 일간 추이</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${formatNumber(value)}원`, '매출']}
                />
                <Legend />
                <Line type="monotone" dataKey="cardSales" name="카드" stroke="#8884d8" />
                <Line type="monotone" dataKey="cashSales" name="현금" stroke="#82ca9d" />
                <Line type="monotone" dataKey="deliverySales" name="배달" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApgujeongDashboard;
