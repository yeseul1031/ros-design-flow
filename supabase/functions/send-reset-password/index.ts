import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate the reset link via Supabase Admin API
    const siteUrl = "https://ros-design-flow.lovable.app";
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${siteUrl}/reset-password`,
      },
    });

    if (linkError) {
      console.error("Generate link error:", linkError);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use the hashed_token to construct a direct link to our app
    // This bypasses Supabase's verify endpoint redirect issues
    const hashedToken = linkData?.properties?.hashed_token || "";
    const resetLink = hashedToken
      ? `${siteUrl}/reset-password?token_hash=${encodeURIComponent(hashedToken)}&type=recovery`
      : `${siteUrl}/reset-password`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#111111;font-family:'Pretendard Variable','Pretendard',-apple-system,BlinkMacSystemFont,system-ui,Roboto,'Helvetica Neue','Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1A1A1A;border-radius:12px;overflow:hidden;">
          <!-- Header Banner -->
          <tr>
            <td style="background-color:#1E1E1E;padding:48px 40px;">
              <h1 style="margin:0;color:#FFFFFF;font-size:28px;font-weight:600;line-height:1.4;">
                비밀번호를<br>잊으셨나요?
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;color:#FFFFFF;font-size:16px;line-height:1.6;">
                안녕하세요, 고객님!
              </p>
              <p style="margin:0 0 16px;color:#FFFFFFCC;font-size:16px;line-height:1.6;">
                비밀번호를 잊으셨나요? 걱정 마세요!
              </p>
              <p style="margin:0 0 32px;color:#FFFFFFCC;font-size:16px;line-height:1.6;">
                아래 버튼을 통해 비밀번호 재설정이 가능합니다.
              </p>
              
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background-color:#EB4B29;border-radius:6px;padding:16px 40px;">
                    <a href="${resetLink}" style="color:#FFFFFF;text-decoration:none;font-size:16px;font-weight:600;display:block;">
                      비밀번호 변경하기
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin:0;color:#FFFFFF66;font-size:13px;line-height:1.6;">
                본 메일은 비밀번호 재설정을 요청하신 경우에만 발송됩니다.<br>
                요청하지 않으셨다면 이 메일을 무시해 주세요.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color:#151515;padding:24px 40px;border-top:1px solid #333333;">
              <p style="margin:0;color:#666666;font-size:12px;line-height:1.6;">
                (주)알오에스 | 대표 최인나<br>
                사업자등록번호 877-87-03752<br>
                manager@rosdesigns.com
              </p>
              <p style="margin:8px 0 0;color:#666666;font-size:12px;">
                ©ROS. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ROS Design <onboarding@resend.dev>",
        to: [email],
        subject: "[ROS] 고객님의 비밀번호 재설정 이메일입니다.",
        html: htmlContent,
      }),
    });

    const resendData = await resendRes.json();
    console.log("Resend response:", resendData);

    if (!resendRes.ok) {
      throw new Error(`Resend error: ${JSON.stringify(resendData)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
