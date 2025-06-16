import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { withAuth } from '../lib/auth';
import { getSalesData, calculateKPIs, analyzeFuelSales } from '../lib/supabase';
import Navigation from '../components/Navigation';
import GeukjinDashboard from '../components/GeukjinDashboard';

function GeukjinPage() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [kpis, setKpis] = useState({});
  const [period, setPeriod] = useState(30); // Default 30 days
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 극진이앤지 데이터 가져오기
        const data = await getSalesData(period, 'GEUKJIN');
        setSalesData(data);
        
        // KPI 계산
        const kpiData = calculateKPIs(data, 'GEUKJIN');
        setKpis(kpiData);
      } catch (error) {
        console.error('Error fetching GEUKJIN data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [period]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>웜가이즈 - 극진이앤지 대시보드</title>
        <meta name="description" content="웜가이즈 극진이앤지 매출 대시보드" />
      </Head>

      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">극진이앤지 대시보드</h1>
        
        <div className="flex justify-end mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => handlePeriodChange(7)}
              className={`px-4 py-2 rounded ${period === 7 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              7일
            </button>
            <button
              onClick={() => handlePeriodChange(30)}
              className={`px-4 py-2 rounded ${period === 30 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              30일
            </button>
            <button
              onClick={() => handlePeriodChange(90)}
              className={`px-4 py-2 rounded ${period === 90 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              90일
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <GeukjinDashboard 
            salesData={salesData} 
            kpis={kpis} 
          />
        )}
      </main>
    </div>
  );
}

export default withAuth(GeukjinPage);
