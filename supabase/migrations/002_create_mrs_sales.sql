-- migrations/002_create_mrs_sales.sql
CREATE TABLE public.mrs_sales (
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
    CONSTRAINT mrs_sales_date_unique UNIQUE (date),
    CONSTRAINT mrs_sales_positive_amounts CHECK (
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
CREATE INDEX idx_mrs_sales_date ON public.mrs_sales (date DESC);
CREATE INDEX idx_mrs_sales_created_at ON public.mrs_sales (created_at DESC);
CREATE INDEX idx_mrs_sales_total_sales ON public.mrs_sales (total_sales DESC); 