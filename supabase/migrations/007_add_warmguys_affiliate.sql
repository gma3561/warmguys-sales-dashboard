-- Warmguys 계열사 설정 추가
INSERT INTO public.affiliate_config (
    affiliate_key, 
    affiliate_name, 
    spreadsheet_id, 
    sheet_name, 
    table_name,
    column_mapping
) VALUES (
    'WARMGUYS',
    '웜가이즈',
    'YOUR_WARMGUYS_SPREADSHEET_ID', -- 실제 스프레드시트 ID로 교체
    'Sales Data',
    'warmguys_sales',
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

-- Warmguys 테이블 생성 (필요한 경우)
CREATE TABLE IF NOT EXISTS public.warmguys_sales (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    coupang_rocket DECIMAL(15,2) DEFAULT 0.00,
    smart_store DECIMAL(15,2) DEFAULT 0.00,
    coupang_wing DECIMAL(15,2) DEFAULT 0.00,
    other_online DECIMAL(15,2) DEFAULT 0.00,
    wholesale DECIMAL(15,2) DEFAULT 0.00,
    export DECIMAL(15,2) DEFAULT 0.00,
    total_sales DECIMAL(15,2) DEFAULT 0.00,
    notes TEXT,
    refund_amount DECIMAL(15,2) DEFAULT 0.00,
    refund_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 제약 조건
    CONSTRAINT warmguys_sales_date_unique UNIQUE (date),
    CONSTRAINT warmguys_sales_positive_amounts CHECK (
        coupang_rocket >= 0 AND 
        smart_store >= 0 AND 
        coupang_wing >= 0 AND 
        other_online >= 0 AND 
        wholesale >= 0 AND 
        export >= 0 AND 
        total_sales >= 0
    )
);

-- 인덱스 생성
CREATE INDEX idx_warmguys_sales_date ON public.warmguys_sales (date DESC);
CREATE INDEX idx_warmguys_sales_created_at ON public.warmguys_sales (created_at DESC);
CREATE INDEX idx_warmguys_sales_total_sales ON public.warmguys_sales (total_sales DESC); 