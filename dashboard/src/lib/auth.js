// 인증 관련 유틸리티 함수들

// 하드코딩된 로그인 정보
const CREDENTIALS = {
  username: 'Warmguys',
  password: 'Eksha12!@'
};

// 로그인 검증
export function validateCredentials(username, password) {
  return username === CREDENTIALS.username && password === CREDENTIALS.password;
}

// 로그인 상태 확인
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('auth_token');
  const loginTime = localStorage.getItem('login_time');
  
  if (!token || !loginTime) return false;
  
  // 24시간 후 자동 로그아웃
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const now = new Date().getTime();
  const timeSinceLogin = now - parseInt(loginTime);
  
  if (timeSinceLogin > TWENTY_FOUR_HOURS) {
    logout();
    return false;
  }
  
  return true;
}

// 로그인 처리
export function login(username, password) {
  if (validateCredentials(username, password)) {
    const token = btoa(`${username}:${Date.now()}`); // 간단한 토큰 생성
    const loginTime = new Date().getTime().toString();
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('login_time', loginTime);
    localStorage.setItem('username', username);
    
    return true;
  }
  return false;
}

// 로그아웃 처리
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('login_time');
    localStorage.removeItem('username');
  }
}

// 현재 사용자 정보 가져오기
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  if (!isAuthenticated()) return null;
  
  return {
    username: localStorage.getItem('username'),
    loginTime: localStorage.getItem('login_time')
  };
}

// 자동 로그아웃 체크 (주기적으로 호출)
export function checkAuthExpiration() {
  if (!isAuthenticated()) {
    logout();
    // 로그인 페이지로 리다이렉트
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}