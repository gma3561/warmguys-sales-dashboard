-- scripts/setup/rls-policies.sql

-- mrs_sales 테이블 RLS
ALTER TABLE public.mrs_sales ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 데이터 접근 가능
CREATE POLICY "Admins can do everything on mrs_sales" ON public.mrs_sales
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 조회자는 읽기만 가능
CREATE POLICY "Viewers can read mrs_sales" ON public.mrs_sales
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role IN ('viewer', 'admin')
        )
    );

-- data_sync_log 테이블 RLS
ALTER TABLE public.data_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can access sync logs" ON public.data_sync_log
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- affiliate_config 테이블 RLS
ALTER TABLE public.affiliate_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage affiliate config" ON public.affiliate_config
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    ); 