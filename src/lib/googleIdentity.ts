const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

export function isGoogleSignInConfigured(): boolean {
  return GOOGLE_CLIENT_ID.length > 0;
}

let scriptPromise: Promise<void> | null = null;
let initialized = false;
let credentialHandler: ((response: google.accounts.id.CredentialResponse) => void) | null =
  null;

export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Identity Services")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function ensureGoogleIdentityInitialized(
  onCredential: (response: google.accounts.id.CredentialResponse) => void,
): Promise<void> {
  if (!isGoogleSignInConfigured()) {
    return;
  }

  credentialHandler = onCredential;
  await loadGoogleIdentityScript();

  if (!window.google?.accounts?.id) {
    throw new Error("Google Identity Services unavailable");
  }

  if (!initialized) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => credentialHandler?.(response),
      auto_select: false,
      cancel_on_tap_outside: true,
      context: "signin",
      itp_support: true,
    });
    initialized = true;
  }
}

export async function promptGoogleOneTap(
  onMoment?: (notification: google.accounts.id.PromptMomentNotification) => void,
): Promise<void> {
  await loadGoogleIdentityScript();
  window.google?.accounts?.id?.prompt(onMoment);
}

export async function promptGoogleSignIn(
  onMoment?: (notification: google.accounts.id.PromptMomentNotification) => void,
): Promise<void> {
  return promptGoogleOneTap(onMoment);
}
