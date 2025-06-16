/**
 * Supabase API와 통신하는 클라이언트 클래스
 */
class SupabaseClient {
  /**
   * 생성자
   * @param {string} url - Supabase 프로젝트 URL
   * @param {string} key - Supabase API 키
   */
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.headers = {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`
    };
  }
  
  /**
   * REST API 요청 전송
   * @param {string} path - API 경로
   * @param {string} method - HTTP 메소드 (GET, POST, PUT, DELETE 등)
   * @param {Object} data - 요청 본문 데이터 (옵션)
   * @return {Object} 응답 데이터
   */
  request(path, method, data = null) {
    const options = {
      method: method,
      headers: this.headers,
      muteHttpExceptions: true
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.payload = JSON.stringify(data);
    }
    
    try {
      const response = UrlFetchApp.fetch(`${this.url}${path}`, options);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      if (responseCode >= 200 && responseCode < 300) {
        return {
          success: true,
          data: JSON.parse(responseText)
        };
      } else {
        Logger.log(`Supabase API 오류: ${responseCode} - ${responseText}`);
        return {
          success: false,
          error: responseText,
          statusCode: responseCode
        };
      }
    } catch (error) {
      Logger.log(`Supabase 요청 실패: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  /**
   * 테이블에서 데이터 조회
   * @param {string} table - 테이블 이름
   * @param {Object} params - 쿼리 파라미터 (옵션)
   * @return {Object} 조회 결과
   */
  select(table, params = {}) {
    let path = `/rest/v1/${table}?`;
    
    // 쿼리 파라미터 추가
    if (params.select) {
      path += `select=${params.select}&`;
    }
    
    if (params.where) {
      for (const [column, value] of Object.entries(params.where)) {
        path += `${column}=eq.${value}&`;
      }
    }
    
    if (params.order) {
      path += `order=${params.order}&`;
    }
    
    if (params.limit) {
      path += `limit=${params.limit}&`;
    }
    
    return this.request(path, 'GET');
  }
  
  /**
   * 테이블에 데이터 삽입
   * @param {string} table - 테이블 이름
   * @param {Object} data - 삽입할 데이터
   * @return {Object} 삽입 결과
   */
  insert(table, data) {
    const path = `/rest/v1/${table}`;
    return this.request(path, 'POST', data);
  }
  
  /**
   * 테이블 데이터 업데이트
   * @param {string} table - 테이블 이름
   * @param {Object} data - 업데이트할 데이터
   * @param {Object} where - 조건절
   * @return {Object} 업데이트 결과
   */
  update(table, data, where) {
    let path = `/rest/v1/${table}?`;
    
    // 조건절 추가
    for (const [column, value] of Object.entries(where)) {
      path += `${column}=eq.${value}&`;
    }
    
    return this.request(path, 'PATCH', data);
  }
  
  /**
   * 테이블 데이터 삽입 또는 업데이트
   * @param {string} table - 테이블 이름
   * @param {Object} data - 삽입/업데이트할 데이터
   * @param {Array} keyColumns - 기본 키 컬럼들
   * @return {Object} 작업 결과
   */
  upsertData(table, data, keyColumns = ['date']) {
    // 먼저 데이터가 존재하는지 확인
    const where = {};
    keyColumns.forEach(column => {
      where[column] = data[column];
    });
    
    const existing = this.select(table, { where });
    
    if (existing.success && existing.data && existing.data.length > 0) {
      // 기존 데이터가 있으면 업데이트
      return this.update(table, data, where);
    } else {
      // 없으면 삽입
      return this.insert(table, data);
    }
  }
  
  /**
   * 동기화 로그 시작
   * @param {string} affiliateKey - 계열사 키
   * @return {Object} 생성된 로그 엔트리
   */
  startSyncLog(affiliateKey) {
    const logData = {
      affiliate_key: affiliateKey,
      sync_started_at: new Date().toISOString(),
      status: 'pending'
    };
    
    const result = this.insert('data_sync_log', logData);
    
    if (result.success) {
      return result.data[0]; // 첫 번째 로그 항목 반환
    } else {
      Logger.log(`동기화 로그 시작 실패: ${result.error}`);
      return { id: 0 }; // 오류 시 임시 ID 제공
    }
  }
  
  /**
   * 동기화 로그 완료
   * @param {number} logId - 로그 ID
   * @param {Object} data - 업데이트할 로그 데이터
   * @return {Object} 업데이트 결과
   */
  completeSyncLog(logId, data) {
    if (!logId) return { success: false, error: '유효하지 않은 로그 ID' };
    
    const updateData = {
      ...data,
      sync_completed_at: new Date().toISOString()
    };
    
    return this.update('data_sync_log', updateData, { id: logId });
  }
  
  /**
   * 저장 프로시저 호출
   * @param {string} functionName - 함수 이름
   * @param {Object} params - 함수 파라미터
   * @return {Object} 호출 결과
   */
  callFunction(functionName, params = {}) {
    const path = `/rest/v1/rpc/${functionName}`;
    return this.request(path, 'POST', params);
  }
} 