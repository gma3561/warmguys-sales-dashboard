export default function handler(req, res) {
  // 배포 상태 확인을 위한 API 엔드포인트
  const deployInfo = {
    version: '1.0.0-final',
    timestamp: new Date().toISOString(),
    status: 'deployed',
    features: [
      '다중 계열사 지원',
      '실시간 대시보드',
      '인증 시스템',
      'Google Sheets 연동',
      '자동 동기화'
    ],
    affiliates: [
      { name: '엠알에스', status: 'connected', id: '18vNJXwSnhj7xWZYZztBJsEY5kYe0PuzCQvA_BsB4T1Q' },
      { name: '압구정곱창', status: 'connected', id: '1YNNadOC3mXv5ti1TxS1n4gZQ7qKOWNzi527rJkKFTqY' },
      { name: '극진이앤지', status: 'connected', id: '1kzw7D13mcCRRnEl4hxSFZWZtdroIZ9S3Lw8h302wgIU' },
      { name: '웜가이즈', status: 'pending', id: 'TBD' }
    ]
  };
  
  res.status(200).json(deployInfo);
}