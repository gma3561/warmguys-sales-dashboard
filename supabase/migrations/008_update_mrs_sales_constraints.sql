-- migrations/008_update_mrs_sales_constraints.sql
-- 기존 제약조건 삭제
ALTER TABLE public.mrs_sales DROP CONSTRAINT mrs_sales_positive_amounts;

-- 환불 금액은 음수일 수 있으므로 제약조건 수정
-- 다른 매출 항목은 여전히 0 이상이어야 함
ALTER TABLE public.mrs_sales ADD CONSTRAINT mrs_sales_amounts_check CHECK (
    coupang_rocket >= 0 AND 
    smart_store >= 0 AND 
    coupang_wing >= 0 AND 
    other_online >= 0 AND 
    wholesale >= 0 AND 
    export >= 0
    -- total_sales는 제약조건에서 제외 (환불로 인해 음수가 될 수 있음)
    -- refund_amount는 제약조건에서 제외 (환불은 음수로 표현될 수 있음)
);

-- 주석 추가
COMMENT ON CONSTRAINT mrs_sales_amounts_check ON public.mrs_sales IS '매출액은 항상 0 이상이어야 하지만, 총 매출과 환불액은 음수가 될 수 있습니다.'; 