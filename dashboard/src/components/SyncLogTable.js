import React from 'react';
import { format } from 'date-fns';
import { Card, Title, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge } from '@tremor/react';

export default function SyncLogTable({ syncLogs }) {
  if (!syncLogs || syncLogs.length === 0) {
    return (
      <Card className="mt-4">
        <Title>데이터 동기화 로그</Title>
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">동기화 기록이 없습니다</p>
        </div>
      </Card>
    );
  }

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
    <Card className="mt-4">
      <Title>데이터 동기화 로그</Title>
      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>동기화 시간</TableHeaderCell>
            <TableHeaderCell>계열사</TableHeaderCell>
            <TableHeaderCell>상태</TableHeaderCell>
            <TableHeaderCell>처리된 행</TableHeaderCell>
            <TableHeaderCell>성공한 행</TableHeaderCell>
            <TableHeaderCell>처리 시간</TableHeaderCell>
            <TableHeaderCell>오류 메시지</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {syncLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {log.sync_completed_at ? 
                  format(new Date(log.sync_completed_at), 'yyyy-MM-dd HH:mm:ss') : 
                  format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
              </TableCell>
              <TableCell>{log.affiliate_key}</TableCell>
              <TableCell>
                <Badge color={getBadgeColor(log.status)}>
                  {log.status === 'success' ? '성공' : log.status === 'pending' ? '진행 중' : '실패'}
                </Badge>
              </TableCell>
              <TableCell>{log.rows_processed || 0}</TableCell>
              <TableCell>{log.rows_successful || 0}</TableCell>
              <TableCell>
                {log.execution_time_ms ? `${(log.execution_time_ms / 1000).toFixed(2)}초` : '-'}
              </TableCell>
              <TableCell>
                {log.error_message && (
                  <span className="text-red-500 text-sm">{log.error_message}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
} 