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
    const { paymentKey, orderId, amount } = await req.json();

    const TOSS_SECRET_KEY = Deno.env.get("TOSS_PAYMENTS_SECRET_KEY");
    if (!TOSS_SECRET_KEY) {
      throw new Error("TOSS_PAYMENTS_SECRET_KEY is not configured");
    }

    // Confirm payment with Toss Payments
    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(TOSS_SECRET_KEY + ":")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    if (!tossResponse.ok) {
      const errorData = await tossResponse.json();
      throw new Error(errorData.message || "Payment confirmation failed");
    }

    const paymentData = await tossResponse.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Update payment status in database
    const { data: paymentRequest } = await supabaseClient
      .from("payment_requests")
      .select("*, quotes(*, leads(*))")
      .eq("token", orderId)
      .single();

    if (paymentRequest) {
      const { error: paymentError } = await supabaseClient
        .from("payments")
        .insert({
          quote_id: paymentRequest.quote_id,
          payment_request_id: paymentRequest.id,
          user_id: paymentRequest.quotes.leads.user_id,
          amount: amount,
          status: "completed",
          method: paymentData.method,
          gateway_txn_id: paymentKey,
          paid_at: new Date().toISOString(),
        });

      if (paymentError) throw paymentError;

      // Update lead status
      await supabaseClient
        .from("leads")
        .update({ status: "paid" })
        .eq("id", paymentRequest.quotes.lead_id);
    }

    return new Response(JSON.stringify({ success: true, payment: paymentData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Payment confirmation error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Payment confirmation failed" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
