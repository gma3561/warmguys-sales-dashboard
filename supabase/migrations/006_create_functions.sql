-- migrations/006_create_functions.sql

-- 자동으로 updated_at 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- mrs_sales 테이블에 트리거 적용
CREATE TRIGGER update_mrs_sales_updated_at 
    BEFORE UPDATE ON public.mrs_sales 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- affiliate_config 테이블에 트리거 적용
CREATE TRIGGER update_affiliate_config_updated_at 
    BEFORE UPDATE ON public.affiliate_config 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 매출 데이터 집계 함수
CREATE OR REPLACE FUNCTION get_sales_summary(
    p_affiliate_key TEXT,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    total_amount DECIMAL,
    avg_daily_amount DECIMAL,
    max_daily_amount DECIMAL,
    min_daily_amount DECIMAL,
    growth_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        SUM(total_sales)::DECIMAL as total_amount,
        AVG(total_sales)::DECIMAL as avg_daily_amount,
        MAX(total_sales)::DECIMAL as max_daily_amount,
        MIN(total_sales)::DECIMAL as min_daily_amount,
        (
            CASE 
                WHEN LAG(SUM(total_sales)) OVER (ORDER BY p_start_date) > 0 
                THEN ((SUM(total_sales) - LAG(SUM(total_sales)) OVER (ORDER BY p_start_date)) / 
                      LAG(SUM(total_sales)) OVER (ORDER BY p_start_date) * 100)::DECIMAL
                ELSE 0::DECIMAL
            END
        ) as growth_rate
    FROM public.mrs_sales
    WHERE date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- 이상치 감지 함수
CREATE OR REPLACE FUNCTION detect_anomalies(
    p_affiliate_key TEXT DEFAULT 'MRS',
    p_threshold DECIMAL DEFAULT 0.3
)
RETURNS TABLE (
    date DATE,
    total_sales DECIMAL,
    avg_sales DECIMAL,
    deviation_percent DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH sales_stats AS (
        SELECT 
            s.date,
            s.total_sales,
            AVG(s.total_sales) OVER (
                ORDER BY s.date 
                ROWS BETWEEN 6 PRECEDING AND 1 PRECEDING
            ) as avg_sales
        FROM public.mrs_sales s
        WHERE s.date >= CURRENT_DATE - INTERVAL '30 days'
        ORDER BY s.date
    )
    SELECT 
        ss.date,
        ss.total_sales,
        ss.avg_sales,
        ABS(ss.total_sales - ss.avg_sales) / NULLIF(ss.avg_sales, 0) as deviation_percent
    FROM sales_stats ss
    WHERE ABS(ss.total_sales - ss.avg_sales) / NULLIF(ss.avg_sales, 0) > p_threshold
    ORDER BY ss.date DESC;
END;
$$ LANGUAGE plpgsql; 