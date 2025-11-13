-- Add contract agreement timestamp to payments table
ALTER TABLE public.payments 
ADD COLUMN contract_agreed_at timestamp with time zone;

COMMENT ON COLUMN public.payments.contract_agreed_at IS '고객이 계약서에 동의한 시간';