-- Supabase에서 실행할 SQL 명령어들

-- 1. warmguys_sales 테이블 생성
CREATE TABLE IF NOT EXISTS warmguys_sales (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    coupang_rocket DECIMAL(15, 2) DEFAULT 0,
    smart_store DECIMAL(15, 2) DEFAULT 0,
    coupang_wing DECIMAL(15, 2) DEFAULT 0,
    other_online DECIMAL(15, 2) DEFAULT 0,
    wholesale DECIMAL(15, 2) DEFAULT 0,
    export DECIMAL(15, 2) DEFAULT 0,
    total_sales DECIMAL(15, 2) DEFAULT 0,
    notes TEXT,
    refund_amount DECIMAL(15, 2) DEFAULT 0,
    refund_details TEXT,
    channel VARCHAR(50) DEFAULT '온라인',
    category VARCHAR(50) DEFAULT '종합',
    order_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- 2. 업데이트 시간 자동 갱신을 위한 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. 트리거 생성
DROP TRIGGER IF EXISTS update_warmguys_sales_updated_at ON warmguys_sales;
CREATE TRIGGER update_warmguys_sales_updated_at
    BEFORE UPDATE ON warmguys_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. data_sync_log 테이블 생성 (동기화 로그용)
CREATE TABLE IF NOT EXISTS data_sync_log (
    id SERIAL PRIMARY KEY,
    affiliate_key VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    rows_processed INTEGER DEFAULT 0,
    rows_successful INTEGER DEFAULT 0,
    rows_failed INTEGER DEFAULT 0,
    error_message TEXT,
    error_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. affiliate_config 테이블 생성 (계열사 설정용)
CREATE TABLE IF NOT EXISTS affiliate_config (
    id SERIAL PRIMARY KEY,
    affiliate_key VARCHAR(50) UNIQUE NOT NULL,
    affiliate_name VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    spreadsheet_id VARCHAR(200),
    sheet_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 기본 설정 데이터 삽입
INSERT INTO affiliate_config (affiliate_key, affiliate_name, table_name, spreadsheet_id, sheet_name)
VALUES ('WARMGUYS', '웜가이즈', 'warmguys_sales', '18vNJXwSnhj7xWZYZztBJsEY5kYe0PuzCQvA_BsB4T1Q', 'Imported View')
ON CONFLICT (affiliate_key) DO UPDATE SET
    affiliate_name = EXCLUDED.affiliate_name,
    table_name = EXCLUDED.table_name,
    spreadsheet_id = EXCLUDED.spreadsheet_id,
    sheet_name = EXCLUDED.sheet_name,
    updated_at = NOW();

-- 7. RLS (Row Level Security) 비활성화 (API 접근 허용)
ALTER TABLE warmguys_sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE data_sync_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_config DISABLE ROW LEVEL SECURITY;

-- 8. 테스트 데이터 삽입 (옵션)
INSERT INTO warmguys_sales (
    date, coupang_rocket, smart_store, coupang_wing, other_online, 
    wholesale, export, total_sales, notes, order_count
) VALUES 
    ('2025-05-18', 5000000, 3000000, 2000000, 0, 0, 0, 10000000, '테스트 데이터', 200),
    ('2025-05-17', 4500000, 2800000, 1800000, 0, 0, 0, 9100000, '테스트 데이터', 182),
    ('2025-05-16', 4800000, 3200000, 1900000, 0, 0, 0, 9900000, '테스트 데이터', 198)
ON CONFLICT (date) DO UPDATE SET
    coupang_rocket = EXCLUDED.coupang_rocket,
    smart_store = EXCLUDED.smart_store,
    coupang_wing = EXCLUDED.coupang_wing,
    total_sales = EXCLUDED.total_sales,
    notes = EXCLUDED.notes,
    order_count = EXCLUDED.order_count,
    updated_at = NOW();

-- 9. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_warmguys_sales_date ON warmguys_sales(date);
CREATE INDEX IF NOT EXISTS idx_warmguys_sales_created_at ON warmguys_sales(created_at);
CREATE INDEX IF NOT EXISTS idx_data_sync_log_created_at ON data_sync_log(created_at);

-- 10. 권한 설정 (anon 역할에 대한 권한)
GRANT ALL ON warmguys_sales TO anon;
GRANT ALL ON data_sync_log TO anon;
GRANT ALL ON affiliate_config TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;