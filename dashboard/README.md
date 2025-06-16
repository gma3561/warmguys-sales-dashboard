# Warmguys Sales Dashboard

웜가이즈 계열사 매출 대시보드 프로젝트입니다.

## 배포 상태

- 마지막 배포 시도: 2025-05-18 13:53:48
- 상태: 강제 배포 진행 중 (7번째 시도)
- 버전: v1.0.3

## 배포 트리거 정보

현재까지 총 8번의 커밋으로 배포를 시도했습니다:

1. 워크플로우 최적화
2. 환경 변수 설정
3. Next.js 설정 수정
4. 디버그 정보 추가
5. 패키지 스크립트 수정
6. 임시 페이지 생성
7. 강제 트리거 v1.0.3
8. 워크플로우 디버그 모드

## GitHub Actions 상태 확인

다음 링크에서 빌드 상태를 확인하세요:
https://github.com/gma3561/warmguys_sales/actions

## Next.js 설정

이 프로젝트는 Next.js 13.5.6을 사용하여 구축되었습니다.

### 개발 서버 실행

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
npm run export
```

### 의존성 설치

```bash
npm install
```

## 환경 변수

프로젝트 실행을 위해 다음 환경 변수가 필요합니다:

```
NEXT_PUBLIC_SUPABASE_URL=https://ooqexropurnslqmcbjqk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 대시보드 접속

배포 완료 후 https://gma3561.github.io/warmguys_sales/ 에서 확인할 수 있습니다.

## 디버그 정보

- GitHub Actions 워크플로우에 디버그 단계 추가
- 환경 변수 직접 설정으로 변경
- 빌드 과정 단순화
- .nojekyll 파일 자동 생성
