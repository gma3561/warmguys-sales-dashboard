import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase, getAffiliateConfig } from '../lib/supabase';
import { Card, Title, Text, Button, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge } from '@tremor/react';

export default function Admin() {
  const [affiliates, setAffiliates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState({});

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const data = await getAffiliateConfig();
      setAffiliates(data);
      setIsLoading(false);
    }
    
    fetchData();
  }, []);

  const initiateSync = async (affiliateKey) => {
    setSyncStatus(prev => ({ ...prev, [affiliateKey]: 'pending' }));
    
    try {
      const response = await fetch(
        `https://ooqexropurnslqmcbjqk.functions.supabase.co/data-sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ affiliate_key: affiliateKey }),
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setSyncStatus(prev => ({ ...prev, [affiliateKey]: 'success' }));
      } else {
        setSyncStatus(prev => ({ ...prev, [affiliateKey]: 'error' }));
      }
    } catch (error) {
      console.error('동기화 요청 에러:', error);
      setSyncStatus(prev => ({ ...prev, [affiliateKey]: 'error' }));
    }
    
    // 5초 후 상태 초기화
    setTimeout(() => {
      setSyncStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[affiliateKey];
        return newStatus;
      });
    }, 5000);
  };

  const toggleAffiliateActive = async (affiliateKey, currentValue) => {
    try {
      const { error } = await supabase
        .from('affiliate_config')
        .update({ is_active: !currentValue })
        .eq('affiliate_key', affiliateKey);
      
      if (error) throw error;
      
      // 목록 갱신
      setAffiliates(prev => 
        prev.map(item => 
          item.affiliate_key === affiliateKey 
            ? { ...item, is_active: !currentValue } 
            : item
        )
      );
    } catch (error) {
      console.error('계열사 상태 변경 에러:', error);
    }
  };

  const getBadgeColor = (status) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div>
      <Head>
        <title>관리자 - 계열사 매출 대시보드</title>
        <meta name="description" content="계열사 매출 데이터 관리" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">계열사 관리</h1>
          <p className="text-gray-500">데이터 동기화 및 계열사 설정</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Card>
            <Title>계열사 설정</Title>
            <Table className="mt-4">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>계열사 ID</TableHeaderCell>
                  <TableHeaderCell>계열사명</TableHeaderCell>
                  <TableHeaderCell>스프레드시트</TableHeaderCell>
                  <TableHeaderCell>마지막 동기화</TableHeaderCell>
                  <TableHeaderCell>상태</TableHeaderCell>
                  <TableHeaderCell>동기화</TableHeaderCell>
                  <TableHeaderCell>활성화</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {affiliates.map((affiliate) => (
                  <TableRow key={affiliate.id}>
                    <TableCell>{affiliate.affiliate_key}</TableCell>
                    <TableCell>{affiliate.affiliate_name}</TableCell>
                    <TableCell>
                      <a 
                        href={`https://docs.google.com/spreadsheets/d/${affiliate.spreadsheet_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {affiliate.sheet_name}
                      </a>
                    </TableCell>
                    <TableCell>
                      {affiliate.last_successful_sync 
                        ? new Date(affiliate.last_successful_sync).toLocaleString('ko-KR')
                        : '없음'}
                    </TableCell>
                    <TableCell>
                      {syncStatus[affiliate.affiliate_key] ? (
                        <Badge color={getBadgeColor(syncStatus[affiliate.affiliate_key])}>
                          {syncStatus[affiliate.affiliate_key] === 'success' 
                            ? '성공' 
                            : syncStatus[affiliate.affiliate_key] === 'pending' 
                              ? '진행 중' 
                              : '오류'}
                        </Badge>
                      ) : (
                        <Badge color={affiliate.sync_enabled ? 'green' : 'gray'}>
                          {affiliate.sync_enabled ? '동기화 활성화' : '동기화 비활성화'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="xs"
                        color="blue"
                        onClick={() => initiateSync(affiliate.affiliate_key)}
                        disabled={syncStatus[affiliate.affiliate_key] === 'pending' || !affiliate.sync_enabled}
                      >
                        지금 동기화
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="xs"
                        color={affiliate.is_active ? 'green' : 'red'}
                        onClick={() => toggleAffiliateActive(affiliate.affiliate_key, affiliate.is_active)}
                      >
                        {affiliate.is_active ? '활성화됨' : '비활성화됨'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>
    </div>
  );
} 