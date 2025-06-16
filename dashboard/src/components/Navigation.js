import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();
  
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <span className="text-xl font-bold cursor-pointer">계열사 매출 대시보드</span>
          </Link>
        </div>
        
        <div className="flex space-x-4">
          <Link href="/">
            <span className={`cursor-pointer px-3 py-2 rounded ${router.pathname === '/' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}>
              대시보드
            </span>
          </Link>
          <Link href="/admin">
            <span className={`cursor-pointer px-3 py-2 rounded ${router.pathname === '/admin' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}>
              관리자
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
} 