import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, serviceKey!);

    const { data: pr, error } = await supabase
      .from('payment_requests')
      .select(`
        id, token, expires_at, created_at,
        quotes:quote_id (
          id, total_amount, items,
          leads:lead_id (
            id, name, email, phone, company
          )
        )
      `)
      .eq('token', token)
      .maybeSingle();

    if (error) throw error;

    if (!pr) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Normalize shapes to a single quote and lead
    const prAny: any = pr as any;
    const quote = Array.isArray(prAny.quotes) ? prAny.quotes[0] : prAny.quotes;
    const lead = quote?.leads
      ? Array.isArray(quote.leads)
        ? quote.leads[0]
        : quote.leads
      : null;

    return new Response(
      JSON.stringify({
        payment_request: {
          id: pr.id,
          token: pr.token,
          expires_at: pr.expires_at,
          created_at: pr.created_at,
        },
        quote,
        lead: lead ?? null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (e) {
    const err = e as any;
    return new Response(JSON.stringify({ error: err?.message || 'Unexpected error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
