import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { initializeApp, cert, getApps } from "npm:firebase-admin@12.7.0/app";
import { getAuth } from "npm:firebase-admin@12.7.0/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ResetRequest {
  email: string;
  newPassword: string;
}

async function getServiceAccount(): Promise<Record<string, unknown> | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase
    .from("app_secrets")
    .select("value")
    .eq("id", "firebase_service_account")
    .maybeSingle();

  if (error || !data) return null;
  return data.value as Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const serviceAccount = await getServiceAccount();
    if (!serviceAccount) {
      return new Response(
        JSON.stringify({ error: "Server not configured for password resets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body: ResetRequest = await req.json();
    const email = body.email?.trim().toLowerCase();
    const newPassword = body.newPassword;

    if (!email || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Email and new password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const appName = "admin-reset";
    const existingApp = getApps().find((a) => a.name === appName);
    const adminApp = existingApp ?? initializeApp(
      { credential: cert(serviceAccount as Parameters<typeof cert>[0]) },
      appName,
    );

    const adminAuth = getAuth(adminApp);

    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch {
      return new Response(
        JSON.stringify({ error: "No account found for this email" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    await adminAuth.updateUser(userRecord.uid, { password: newPassword });

    return new Response(
      JSON.stringify({ success: true, message: "Password updated successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reset password";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
