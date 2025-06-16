-- 초기 테이블들 생성
-- 기본 스키마와 확장 모듈 설정
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- 사용자 정의 타입 생성
CREATE TYPE sync_status AS ENUM ('pending', 'success', 'error', 'partial');
CREATE TYPE user_role AS ENUM ('admin', 'viewer', 'affiliate');

-- 기본 메타데이터 테이블 생성
CREATE TABLE IF NOT EXISTS public._metadata (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 메타데이터 삽입
INSERT INTO public._metadata (key, value) 
VALUES ('schema_version', '"1.0.0"'); 