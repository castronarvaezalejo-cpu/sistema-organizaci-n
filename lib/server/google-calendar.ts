import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

import { createClient } from "@supabase/supabase-js";

const calendarScope = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.events",
].join(" ");

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta la variable ${name}.`);
  }

  return value;
}

function tokenKey() {
  return createHash("sha256")
    .update(requiredEnv("GOOGLE_CLIENT_SECRET"))
    .digest();
}

export function serverSupabase() {
  return createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );
}

export function encryptRefreshToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", tokenKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  return [
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptRefreshToken(value: string) {
  const [ivValue, authTagValue, encryptedValue] = value.split(".");

  if (!ivValue || !authTagValue || !encryptedValue) {
    throw new Error("El permiso de Google Calendar no es válido.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    tokenKey(),
    Buffer.from(ivValue, "base64url")
  );

  decipher.setAuthTag(Buffer.from(authTagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function googleAuthorizationUrl(state: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", requiredEnv("GOOGLE_CLIENT_ID"));
  url.searchParams.set("redirect_uri", requiredEnv("GOOGLE_REDIRECT_URI"));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("scope", calendarScope);
  url.searchParams.set("state", state);

  console.log("GOOGLE AUTH URL:");
  console.log(url.toString());

  return url.toString();
}

export async function exchangeGoogleCode(code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri: requiredEnv("GOOGLE_REDIRECT_URI"),
      grant_type: "authorization_code",
    }),
  });

  const body = await response.json();

  if (!response.ok || !body.access_token || !body.refresh_token) {
    throw new Error("Google no entregó un permiso renovable para Calendar.");
  }

  return body as { access_token: string; refresh_token: string };
}

export async function googleEmail(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const body = await response.json();

  if (!response.ok || !body.email) {
    throw new Error("No fue posible identificar la cuenta de Google.");
  }

  return body.email as string;
}

export async function accessTokenFromRefreshToken(refreshToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const body = await response.json();



console.log("=================================");
console.log("STATUS GOOGLE:", response.status);
console.log("BODY GOOGLE:");
console.dir(body, { depth: null });
console.log("=================================");


  if (!response.ok || !body.access_token) {
    throw new Error("La conexión con Google Calendar expiró.");
  }

  return body.access_token as string;
}

export async function currentColaborador(authorization: string | null) {
  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    throw new Error("No hay una sesión válida.");
  }

  const supabase = serverSupabase();
  const { data: authData, error: authError } =
    await supabase.auth.getUser(token);

  if (authError || !authData.user.email) {
    throw new Error("No hay una sesión válida.");
  }

  const { data: colaborador, error } = await supabase
    .from("colaboradores")
    .select("id, nombre, email, rol")
    .eq("email", authData.user.email)
    .single();

  if (error || !colaborador) {
    throw new Error("No se encontró el colaborador de la sesión.");
  }

  return colaborador as {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  };
}
