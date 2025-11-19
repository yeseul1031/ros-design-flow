-- 이메일 템플릿 관리 테이블 생성
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- 관리자만 관리 가능
CREATE POLICY "Staff can manage email templates"
ON public.email_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- 개인정보 동의 필드 추가
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS privacy_agreed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_agreed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.matching_requests
ADD COLUMN IF NOT EXISTS privacy_agreed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_agreed_at TIMESTAMP WITH TIME ZONE;

-- 기본 이메일 템플릿 삽입
INSERT INTO public.email_templates (template_key, subject, html_content, description)
VALUES (
  'contract_expiring',
  '[중요] {{customerName}}님, 계약 만료 안내 및 재계약 문의',
  '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333;">안녕하세요, {{customerName}}님</h2>
    
    <p style="line-height: 1.6; color: #555;">
      항상 저희 디자인 서비스를 이용해주셔서 감사합니다.
    </p>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <strong style="color: #856404;">계약 만료 예정일: {{endDate}}</strong>
      <p style="margin: 10px 0 0 0; color: #856404;">
        귀하의 디자인 서비스 계약이 곧 만료될 예정입니다.
      </p>
    </div>

    <h3 style="color: #333; margin-top: 30px;">재계약 안내</h3>
    <p style="line-height: 1.6; color: #555;">
      서비스를 계속 이용하고 싶으시다면 재계약을 진행해주세요.<br>
      재계약 문의는 담당자에게 연락 주시거나, 아래 버튼을 통해 문의해주세요.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:contact@example.com" 
         style="display: inline-block; background-color: #007bff; color: white; 
                padding: 12px 30px; text-decoration: none; border-radius: 5px; 
                font-weight: bold;">
        재계약 문의하기
      </a>
    </div>

    <h3 style="color: #333; margin-top: 30px;">서비스 만족도 조사</h3>
    <p style="line-height: 1.6; color: #555;">
      더 나은 서비스를 제공하기 위해 고객님의 소중한 의견을 듣고 싶습니다.<br>
      간단한 설문조사에 참여해주시면 감사하겠습니다.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{surveyLink}}" 
         style="display: inline-block; background-color: #28a745; color: white; 
                padding: 12px 30px; text-decoration: none; border-radius: 5px; 
                font-weight: bold;">
        만족도 조사 참여하기
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; line-height: 1.6;">
      본 메일은 계약 만료 예정 고객님께 자동으로 발송되는 안내 메일입니다.<br>
      문의사항이 있으시면 언제든지 연락 주세요.
    </p>
  </div>',
  '계약 만료 예정 고객에게 발송되는 이메일 템플릿'
)
ON CONFLICT (template_key) DO NOTHING;