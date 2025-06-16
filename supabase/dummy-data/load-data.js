// 더미 데이터 로드 스크립트
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase 설정
const supabaseUrl = 'https://ooqexropurnslqmcbjqk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNiamxxayIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ3NDc0MjA1LCJleHAiOjIwNjMwNTAyMDV9.yXVabxtZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SQL 파일 읽기
const sqlFilePath = path.join(process.cwd(), 'insert-dummy-data.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// SQL 명령어 분리
const sqlCommands = sqlContent.split(';').filter(cmd => cmd.trim() !== '');

async function loadDummyData() {
  console.log('더미 데이터 로드 시작...');
  
  try {
    // warmguys_sales 데이터 삭제
    console.log('기존 데이터 삭제 중...');
    await supabase.from('warmguys_sales').delete().neq('id', 0);
    await supabase.from('mrs_sales').delete().neq('id', 0);
    await supabase.from('apgujeong_sales').delete().neq('id', 0);
    await supabase.from('geukjin_sales').delete().neq('id', 0);
    
    // warmguys_sales 데이터 추가
    console.log('warmguys_sales 데이터 추가 중...');
    const warmguysData = prepareDataFromSql(sqlContent, 'warmguys_sales');
    if (warmguysData.length > 0) {
      const { data, error } = await supabase.from('warmguys_sales').insert(warmguysData);
      if (error) throw error;
      console.log(`warmguys_sales 데이터 ${warmguysData.length}개 추가 완료`);
    }
    
    // mrs_sales 데이터 추가
    console.log('mrs_sales 데이터 추가 중...');
    const mrsData = prepareDataFromSql(sqlContent, 'mrs_sales');
    if (mrsData.length > 0) {
      const { data, error } = await supabase.from('mrs_sales').insert(mrsData);
      if (error) throw error;
      console.log(`mrs_sales 데이터 ${mrsData.length}개 추가 완료`);
    }
    
    // apgujeong_sales 데이터 추가
    console.log('apgujeong_sales 데이터 추가 중...');
    const apgujeongData = prepareDataFromSql(sqlContent, 'apgujeong_sales');
    if (apgujeongData.length > 0) {
      const { data, error } = await supabase.from('apgujeong_sales').insert(apgujeongData);
      if (error) throw error;
      console.log(`apgujeong_sales 데이터 ${apgujeongData.length}개 추가 완료`);
    }
    
    // geukjin_sales 데이터 추가
    console.log('geukjin_sales 데이터 추가 중...');
    const geukjinData = prepareDataFromSql(sqlContent, 'geukjin_sales');
    if (geukjinData.length > 0) {
      const { data, error } = await supabase.from('geukjin_sales').insert(geukjinData);
      if (error) throw error;
      console.log(`geukjin_sales 데이터 ${geukjinData.length}개 추가 완료`);
    }
    
    console.log('모든 더미 데이터 로드 완료!');
  } catch (error) {
    console.error('데이터 로드 중 오류 발생:', error);
  }
}

// SQL INSERT 명령에서 데이터 추출
function prepareDataFromSql(sqlContent, tableName) {
  const result = [];
  const regex = new RegExp(`INSERT INTO ${tableName}\\s*\\(([^)]+)\\)\\s*VALUES\\s*([\\s\\S]*?);`, 'g');
  let match;
  
  while ((match = regex.exec(sqlContent)) !== null) {
    const columns = match[1].split(',').map(col => col.trim());
    const valuesBlock = match[2].trim();
    const valueRows = valuesBlock.split('\n').filter(row => row.trim().startsWith('('));
    
    for (const row of valueRows) {
      try {
        // 괄호 제거 및 값 분리
        const cleanRow = row.trim().replace(/^\(|\)$/g, '');
        const valueMatches = [];
        let inString = false;
        let currentValue = '';
        
        for (let i = 0; i < cleanRow.length; i++) {
          const char = cleanRow[i];
          
          if (char === "'" && (i === 0 || cleanRow[i-1] !== '\\')) {
            inString = !inString;
            currentValue += char;
          } else if (char === ',' && !inString) {
            valueMatches.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        
        // 마지막 값 추가
        if (currentValue.trim()) {
          valueMatches.push(currentValue.trim());
        }
        
        // 객체 생성
        const obj = {};
        for (let i = 0; i < columns.length; i++) {
          let value = valueMatches[i];
          if (value === undefined) continue;
          
          // 문자열 따옴표 제거
          if (value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1);
          } 
          // 숫자 변환
          else if (!isNaN(value)) {
            value = Number(value);
          }
          
          obj[columns[i]] = value;
        }
        
        result.push(obj);
      } catch (error) {
        console.error('데이터 변환 중 오류:', error);
      }
    }
  }
  
  return result;
}

// 실행
loadDummyData();