-- migrations/003_create_sync_log.sql
CREATE TABLE public.data_sync_log (
    id BIGSERIAL PRIMARY KEY,
    affiliate_key VARCHAR(50) NOT NULL,
    sync_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sync_completed_at TIMESTAMPTZ,
    status sync_status DEFAULT 'pending',
    rows_processed INTEGER DEFAULT 0,
    rows_successful INTEGER DEFAULT 0,
    rows_failed INTEGER DEFAULT 0,
    error_message TEXT,
    error_details JSONB,
    execution_time_ms INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_sync_log_affiliate ON public.data_sync_log (affiliate_key);
CREATE INDEX idx_sync_log_status ON public.data_sync_log (status);
CREATE INDEX idx_sync_log_created_at ON public.data_sync_log (created_at DESC); 