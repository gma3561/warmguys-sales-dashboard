-- migrations/004_create_affiliate_config.sql
CREATE TABLE public.affiliate_config (
    id BIGSERIAL PRIMARY KEY,
    affiliate_key VARCHAR(50) UNIQUE NOT NULL,
    affiliate_name VARCHAR(100) NOT NULL,
    spreadsheet_id VARCHAR(100) NOT NULL,
    sheet_name VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    column_mapping JSONB NOT NULL, -- 시트 컬럼과 DB 컬럼 매핑
    is_active BOOLEAN DEFAULT true,
    sync_enabled BOOLEAN DEFAULT true,
    last_successful_sync TIMESTAMPTZ,
    sync_interval_hours INTEGER DEFAULT 1,
    alert_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 데이터 삽입
INSERT INTO public.affiliate_config (
    affiliate_key, 
    affiliate_name, 
    spreadsheet_id, 
    sheet_name, 
    table_name,
    column_mapping
) VALUES (
    'MRS',
    '엠알에스',
    'YOUR_SPREADSHEET_ID', -- 실제 스프레드시트 ID로 교체
    'Imported View',
    'mrs_sales',
    '{
        "날짜": "date",
        "쿠팡로켓": "coupang_rocket",
        "스마트스토어": "smart_store",
        "쿠팡윙": "coupang_wing",
        "기타 온라인": "other_online",
        "도매": "wholesale",
        "수출": "export",
        "총매출": "total_sales",
        "특이사항": "notes",
        "환불액": "refund_amount",
        "환불 내역": "refund_details"
    }'::jsonb
); 