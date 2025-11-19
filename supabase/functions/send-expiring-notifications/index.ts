import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProjectWithUser {
  id: string;
  end_date: string;
  user_id: string;
  profiles: {
    name: string;
    email: string;
    company: string | null;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 만료 예정(expiring_soon) 상태의 프로젝트와 고객 정보 조회
    const { data: expiringProjects, error: projectsError } = await supabase
      .from("projects")
      .select(`
        id,
        end_date,
        user_id,
        profiles:user_id (
          name,
          email,
          company
        )
      `)
      .eq("status", "expiring_soon");

    if (projectsError) {
      console.error("Error fetching expiring projects:", projectsError);
      throw projectsError;
    }

    if (!expiringProjects || expiringProjects.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "만료 예정인 프로젝트가 없습니다.",
          sentCount: 0 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailResults = [];
    let successCount = 0;
    let failCount = 0;

    // 각 고객에게 이메일 발송
    for (const project of expiringProjects as unknown as ProjectWithUser[]) {
      try {
        const customerName = project.profiles.name;
        const customerEmail = project.profiles.email;
        const endDate = new Date(project.end_date).toLocaleDateString("ko-KR");
        const surveyLink = Deno.env.get("SURVEY_LINK") || "https://forms.gle/example"; // 만족도 조사 링크

        const emailResponse = await resend.emails.send({
          from: "디자인 서비스 <onboarding@resend.dev>",
          to: [customerEmail],
          subject: `[중요] ${customerName}님, 계약 만료 안내 및 재계약 문의`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">안녕하세요, ${customerName}님</h2>
              
              <p style="line-height: 1.6; color: #555;">
                항상 저희 디자인 서비스를 이용해주셔서 감사합니다.
              </p>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <strong style="color: #856404;">계약 만료 예정일: ${endDate}</strong>
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
                <a href="${surveyLink}" 
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
            </div>
          `,
        });

        console.log(`Email sent to ${customerEmail}:`, emailResponse);
        emailResults.push({
          email: customerEmail,
          success: true,
          messageId: emailResponse.data?.id,
        });
        successCount++;
      } catch (emailError) {
        const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
        console.error(`Failed to send email to ${project.profiles.email}:`, emailError);
        emailResults.push({
          email: project.profiles.email,
          success: false,
          error: errorMessage,
        });
        failCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `이메일 발송 완료: 성공 ${successCount}건, 실패 ${failCount}건`,
        sentCount: successCount,
        failedCount: failCount,
        details: emailResults,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-expiring-notifications function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
