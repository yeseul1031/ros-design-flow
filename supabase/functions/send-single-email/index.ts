import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html }: EmailRequest = await req.json();

    if (!to || !subject || !html) {
      throw new Error("Missing required fields: to, subject, html");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error("Invalid email format");
    }

    console.log(`Sending email to ${to} with subject: ${subject}`);

    // Note: To use manager@rosdesigns.com as sender, verify rosdesigns.com domain at resend.com/domains
    // Until domain is verified, using resend.dev for testing
    const emailResponse = await resend.emails.send({
      from: "ROS 디자인 서비스 <manager@rosdesigns.com>",
      to: [to],
      subject: subject,
      html: html,
    });

    console.log("Resend API response:", JSON.stringify(emailResponse));

    // Check if Resend returned an error
    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      return new Response(
        JSON.stringify({
          success: false,
          error: emailResponse.error.message || "이메일 발송에 실패했습니다.",
          details: emailResponse.error,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Email sent successfully, ID:", emailResponse.data?.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "이메일이 성공적으로 발송되었습니다.",
        messageId: emailResponse.data?.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);