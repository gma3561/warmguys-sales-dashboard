/**
 * 상세한 디버깅 테스트
 */
function debugConnectionTest() {
  console.log('=== 디버깅 테스트 시작 ===');
  
  try {
    // 1. 매우 간단한 HTTP 테스트
    console.log('1. HTTP 테스트 시작');
    const response = UrlFetchApp.fetch('https://httpbin.org/get');
    const statusCode = response.getResponseCode();
    console.log('HTTP 상태코드: ' + statusCode);
    console.log('HTTP 응답 길이: ' + response.getContentText().length);
    
    // 2. Supabase 테스트 - 더 안전한 방식
    console.log('2. Supabase 연결 테스트');
    try {
      const supabaseUrl = 'https://ooqexropurnslqmcbjqk.supabase.co/rest/v1/';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNianFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NzQyMDUsImV4cCI6MjA2MzA1MDIwNX0.yXVabtxZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbuA';
      
      const supabaseResponse = UrlFetchApp.fetch(supabaseUrl, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': 'Bearer ' + supabaseKey,
          'Content-Type': 'application/json'
        }
      });
      
      const supabaseStatus = supabaseResponse.getResponseCode();
      const supabaseContent = supabaseResponse.getContentText();
      
      console.log('Supabase 상태코드: ' + supabaseStatus);
      console.log('Supabase 응답 길이: ' + supabaseContent.length);
      console.log('Supabase 응답 시작: ' + supabaseContent.substring(0, 100));
      
    } catch (supabaseError) {
      console.log('Supabase 오류 발생');
      console.log('오류 타입: ' + typeof supabaseError);
      console.log('오류 이름: ' + (supabaseError.name || 'undefined'));
      console.log('오류 메시지: ' + (supabaseError.message || 'undefined'));
      console.log('오류 전체: ' + supabaseError.toString());
    }
    
  } catch (mainError) {
    console.log('메인 오류 발생');
    console.log('메인 오류: ' + mainError.toString());
  }
  
  console.log('=== 디버깅 테스트 완료 ===');
}

/**
 * 매우 간단한 연결 테스트
 */
function verySimpleTest() {
  try {
    console.log('간단한 테스트 시작');
    const response = UrlFetchApp.fetch('https://httpbin.org/get');
    console.log('성공! 상태: ' + response.getResponseCode());
    return true;
  } catch (e) {
    console.log('실패: ' + e);
    return false;
  }
}

/**
 * Supabase만 테스트
 */
function testSupabaseOnly() {
  console.log('Supabase 단독 테스트');
  
  try {
    const url = 'https://ooqexropurnslqmcbjqk.supabase.co/rest/v1/';
    console.log('URL: ' + url);
    
    const response = UrlFetchApp.fetch(url, {
      'method': 'GET',
      'headers': {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNianFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NzQyMDUsImV4cCI6MjA2MzA1MDIwNX0.yXVabtxZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbuA'
      }
    });
    
    console.log('Supabase 응답 상태: ' + response.getResponseCode());
    console.log('Supabase 응답: ' + response.getContentText().substring(0, 200));
    
  } catch (error) {
    console.log('Supabase 테스트 실패');
    console.log('에러: ' + error);
    
    // 더 상세한 오류 정보
    if (error.name) console.log('에러 이름: ' + error.name);
    if (error.message) console.log('에러 메시지: ' + error.message);
    if (error.stack) console.log('에러 스택: ' + error.stack);
  }
}