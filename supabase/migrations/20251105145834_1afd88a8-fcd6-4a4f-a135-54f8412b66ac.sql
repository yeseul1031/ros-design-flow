-- Add contract_count and contract_history to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS contract_count integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS contract_history jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.projects.contract_count IS '계약 횟수 (1: 신규, 2: 1회 재계약, 3: 2회 재계약 등)';
COMMENT ON COLUMN public.projects.contract_history IS '이전 계약 정보 배열 [{contract_number, designer_id, designer_name, start_date, end_date}]';