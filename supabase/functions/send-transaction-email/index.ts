import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransactionEmailRequest {
  email: string;
  fullName: string;
  type: "deposit" | "withdrawal";
  status: "completed" | "rejected";
  amount: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-transaction-email function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized - No authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseClient = createClient(
      SUPABASE_URL ?? "",
      SUPABASE_ANON_KEY ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("Failed to get user:", userError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user is admin
    const { data: roles, error: rolesError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (rolesError) {
      console.error("Error checking admin role:", rolesError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to verify permissions" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!roles) {
      console.error("User is not an admin:", user.id);
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden - Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { email, fullName, type, status, amount }: TransactionEmailRequest = body;

    // Input validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!type || !["deposit", "withdrawal"].includes(type)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid transaction type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!status || !["completed", "rejected"].includes(status)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid transaction status" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid amount" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log(`Admin ${user.id} sending email to ${email} for ${type} ${status}`);

    const isApproved = status === "completed";
    const typeLabel = type === "deposit" ? "Dépôt" : "Retrait";
    const statusLabel = isApproved ? "Approuvé" : "Rejeté";
    const statusColor = isApproved ? "#10B981" : "#EF4444";

    // Sanitize fullName to prevent XSS in email
    const sanitizedFullName = (fullName || "Investisseur").replace(/[<>&"']/g, "");

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "InvestPro <onboarding@resend.dev>",
        to: [email],
        subject: `${typeLabel} ${statusLabel} - ${amount}$`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
                <h1 style="color: #FFD700; margin: 0; font-size: 28px;">InvestPro</h1>
              </div>
              <div style="padding: 40px;">
                <h2 style="color: #333; margin-top: 0;">Bonjour ${sanitizedFullName},</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                  Votre demande de <strong>${typeLabel.toLowerCase()}</strong> a été traitée.
                </p>
                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                  <p style="margin: 0; color: #666; font-size: 14px;">Montant</p>
                  <p style="margin: 5px 0 0 0; color: #333; font-size: 32px; font-weight: bold;">${amount}$</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <span style="display: inline-block; background-color: ${statusColor}; color: white; padding: 12px 30px; border-radius: 25px; font-size: 16px; font-weight: bold;">
                    ${statusLabel.toUpperCase()}
                  </span>
                </div>
                ${!isApproved ? `
                <p style="color: #666; font-size: 14px; line-height: 1.6; background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                  Si vous pensez qu'il s'agit d'une erreur, veuillez contacter notre équipe support.
                </p>
                ` : `
                <p style="color: #666; font-size: 14px; line-height: 1.6; background-color: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
                  ${type === "deposit" ? "Votre solde a été crédité avec succès." : "Votre retrait a été traité avec succès."}
                </p>
                `}
              </div>
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  © 2024 InvestPro. Tous droits réservés.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailData = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-transaction-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
