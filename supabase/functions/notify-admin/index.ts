import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminNotificationRequest {
  type: "deposit" | "withdrawal";
  amount: number;
  userEmail: string;
  userName: string;
  method: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY FIX: Validate user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user's token using anon key client
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Token validation failed:", claimsError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Invalid user" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Now use service role for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get admin email from user_roles table
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError) {
      console.error("Error fetching admin roles:", rolesError);
      throw new Error("Failed to fetch admin roles");
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admin users found");
      return new Response(
        JSON.stringify({ message: "No admin users to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get admin emails from profiles
    const adminIds = adminRoles.map((r) => r.user_id);
    const { data: adminProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("email")
      .in("user_id", adminIds);

    if (profilesError) {
      console.error("Error fetching admin profiles:", profilesError);
      throw new Error("Failed to fetch admin profiles");
    }

    const adminEmails = adminProfiles
      ?.map((p) => p.email)
      .filter((email): email is string => !!email);

    if (!adminEmails || adminEmails.length === 0) {
      console.log("No admin emails found");
      return new Response(
        JSON.stringify({ message: "No admin emails to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { type, amount, userEmail, userName, method }: AdminNotificationRequest = await req.json();

    // Validate input
    if (!type || !amount || !userEmail) {
      throw new Error("Missing required fields");
    }

    // Validate type is one of allowed values
    if (type !== "deposit" && type !== "withdrawal") {
      throw new Error("Invalid transaction type");
    }

    // Validate amount is a positive number
    if (typeof amount !== "number" || amount <= 0 || !isFinite(amount)) {
      throw new Error("Invalid amount");
    }

    const isDeposit = type === "deposit";
    const typeLabel = isDeposit ? "Dépôt" : "Retrait";
    const typeColor = isDeposit ? "#22c55e" : "#f97316";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #0a0a0a; color: #ffffff; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${typeColor}, ${isDeposit ? '#16a34a' : '#ea580c'}); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .header h1 { margin: 0; font-size: 24px; color: white; }
          .content { background-color: #1a1a1a; padding: 30px; border-radius: 0 0 12px 12px; }
          .alert-box { background-color: #262626; border-left: 4px solid ${typeColor}; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #333; }
          .info-label { color: #888; }
          .info-value { font-weight: bold; color: #fff; }
          .amount { font-size: 28px; color: ${typeColor}; font-weight: bold; text-align: center; margin: 20px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Nouvelle demande de ${typeLabel}</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <p style="margin: 0; font-size: 16px;">
                Une nouvelle demande de <strong>${typeLabel.toLowerCase()}</strong> nécessite votre attention.
              </p>
            </div>
            
            <div class="amount">$${amount.toFixed(2)}</div>
            
            <div class="info-row">
              <span class="info-label">Utilisateur</span>
              <span class="info-value">${userName ? String(userName).substring(0, 100) : 'Non renseigné'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">${String(userEmail).substring(0, 255)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Méthode</span>
              <span class="info-value">${method ? String(method).substring(0, 50) : 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date</span>
              <span class="info-value">${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</span>
            </div>
            
            <div style="text-align: center;">
              <a href="${Deno.env.get("APP_URL") || '#'}" class="cta-button">

              </a>
            </div>
          </div>
          <div class="footer">
            <p>RocketGain Admin Panel</p>
            <p>Cet email a été envoyé automatiquement.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "RocketGain <onboarding@resend.dev>",
        to: adminEmails,
        subject: `🔔 [${typeLabel}] Nouvelle demande de $${amount.toFixed(2)}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const emailResponse = await res.json();
    console.log("Admin notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in notify-admin function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
