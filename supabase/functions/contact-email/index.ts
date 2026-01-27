import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  console.log("🔥 contact-email called", req.method);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: ContactPayload = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Champs manquants" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { error: dbError } = await supabase
      .from("contact_messages")
      .insert([{ name, email, subject, message }]);

    if (dbError) throw dbError;

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const contactEmail = Deno.env.get("CONTACT_EMAIL");

    const emailRes = await fetch("https://idnbrclabilhemcloipt.supabase.co/functions/v1/contact-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
  },
      body: JSON.stringify({
    name,
    email,
    subject,
    message
  }),
    });

    if (!emailRes.ok) {
      throw new Error(await emailRes.text());
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("CONTACT EMAIL ERROR:", error);

    return new Response(
      JSON.stringify({
        error: error?.message ?? "Erreur serveur",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
