export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🏢 웜가이즈 매출 대시보드</h1>
      <p>계열사 매출 데이터를 실시간으로 분석하고 시각화하는 통합 대시보드</p>
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
        <h2>✅ 배포 성공!</h2>
        <p>Next.js 빌드가 성공적으로 완료되었습니다.</p>
        <p><strong>배포 시간:</strong> {new Date().toLocaleString('ko-KR')}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <h3>로그인 정보</h3>
        <p><strong>아이디:</strong> Warmguys</p>
        <p><strong>비밀번호:</strong> Eksha12!@</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>지원하는 계열사</h3>
        <ul>
          <li>엠알에스 (온라인 매출)</li>
          <li>압구정곱창 압구정점 (오프라인 매장)</li>
          <li>압구정곱창 가로수점 (오프라인 매장)</li>
        </ul>
      </div>

      <div style={{ marginTop: '30px', color: '#666' }}>
        <p>완전한 대시보드는 곧 업데이트됩니다.</p>
      </div>
    </div>
  );
}
