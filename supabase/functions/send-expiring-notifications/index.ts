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

    // 이메일 템플릿 로드
    const { data: templateData, error: templateError } = await supabase
      .from("email_templates")
      .select("subject, html_content")
      .eq("template_key", "contract_expiring")
      .single();

    if (templateError) {
      console.error("Error loading email template:", templateError);
      throw new Error("이메일 템플릿을 불러오는데 실패했습니다.");
    }

    const emailTemplate = templateData;
    const surveyLink = Deno.env.get("SURVEY_LINK") || "https://forms.gle/example";

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

        // 템플릿 변수 치환
        const subject = emailTemplate.subject.replace(/\{\{customerName\}\}/g, customerName);
        const htmlContent = emailTemplate.html_content
          .replace(/\{\{customerName\}\}/g, customerName)
          .replace(/\{\{endDate\}\}/g, endDate)
          .replace(/\{\{surveyLink\}\}/g, surveyLink);

        const emailResponse = await resend.emails.send({
          from: "디자인 서비스 <onboarding@resend.dev>",
          to: [customerEmail],
          subject: subject,
          html: htmlContent,
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
