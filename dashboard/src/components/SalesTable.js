import { useState } from 'react';

export default function SalesTable({ data, affiliateKey }) {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        표시할 데이터가 없습니다.
      </div>
    );
  }

  // 정렬 처리
  const sortedData = [...data].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // 페이지네이션
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  // 계열사별 컬럼 설정
  const getColumns = () => {
    if (affiliateKey === 'APGUJEONG') {
      return [
        { key: 'date', label: '날짜', sortable: true },
        { key: 'card_sales', label: '카드매출', sortable: true },
        { key: 'cash_sales', label: '현금매출', sortable: true },
        { key: 'delivery_sales', label: '배달매출', sortable: true },
        { key: 'total_sales', label: '총매출', sortable: true },
        { key: 'customer_count', label: '고객수', sortable: true },
        { key: 'table_turnover', label: '회전율', sortable: true },
      ];
    } else if (affiliateKey === 'GEUKJIN') {
      return [
        { key: 'date', label: '날짜', sortable: true },
        { key: 'gasoline_sales', label: '무연휘발유', sortable: true },
        { key: 'diesel_sales', label: '경유', sortable: true },
        { key: 'freight_sales', label: '운임', sortable: true },
        { key: 'total_sales', label: '총매출', sortable: true },
        { key: 'total_margin', label: '총마진', sortable: true },
        { key: 'growth_rate', label: '성장률(%)', sortable: true },
      ];
    } else {
      // MRS, WARMGUYS, 또는 전체
      return [
        { key: 'date', label: '날짜', sortable: true },
        { key: 'coupang_rocket', label: '쿠팡로켓', sortable: true },
        { key: 'smart_store', label: '스마트스토어', sortable: true },
        { key: 'coupang_wing', label: '쿠팡윙', sortable: true },
        { key: 'total_sales', label: '총매출', sortable: true },
        { key: 'refund_amount', label: '환불액', sortable: true },
        { key: 'order_count', label: '주문건수', sortable: true },
      ];
    }
  };

  const columns = getColumns();

  const renderCellValue = (record, column) => {
    const value = record[column.key];
    
    if (column.key === 'date') {
      return formatDate(value);
    } else if (column.key === 'growth_rate') {
      return `${(parseFloat(value) || 0).toFixed(2)}%`;
    } else if (column.key === 'table_turnover') {
      return (parseFloat(value) || 0).toFixed(2);
    } else if (['customer_count', 'order_count'].includes(column.key)) {
      return new Intl.NumberFormat('ko-KR').format(parseInt(value) || 0);
    } else {
      return formatCurrency(parseFloat(value) || 0);
    }
  };

  return (
    <div>
      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && (
                      <span className="ml-2">
                        {sortField === column.key ? (
                          sortDirection === 'asc' ? '▲' : '▼'
                        ) : (
                          '↕'
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((record, index) => (
              <tr key={record.id || index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {renderCellValue(record, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              이전
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              다음
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                총 <span className="font-medium">{sortedData.length}</span>개 중{' '}
                <span className="font-medium">{startIndex + 1}</span>-{' '}
                <span className="font-medium">{Math.min(endIndex, sortedData.length)}</span>개 표시
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  이전
                </button>
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === page
                          ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  다음
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}